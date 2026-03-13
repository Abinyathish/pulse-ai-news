import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import type { NewsArticle } from "@shared/schema";
import Parser from "rss-parser";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "AI-News-App/1.0",
  },
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      ["media:group", "media:group"],
      ["content:encoded", "content:encoded"],
    ],
  },
});

// RSS feeds — comprehensive AI & tech coverage
const RSS_FEEDS = [
  // Major tech news
  { url: "https://techcrunch.com/category/artificial-intelligence/feed/", source: "TechCrunch", category: "industry" },
  { url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml", source: "The Verge", category: "products" },
  { url: "https://feeds.arstechnica.com/arstechnica/technology-lab", source: "Ars Technica", category: "research" },
  { url: "https://www.wired.com/feed/tag/ai/latest/rss", source: "Wired", category: "industry" },
  { url: "https://venturebeat.com/category/ai/feed/", source: "VentureBeat", category: "industry" },
  // Research & labs
  { url: "https://news.mit.edu/topic/mitartificial-intelligence2-rss.xml", source: "MIT News", category: "research" },
  { url: "https://blog.google/technology/ai/rss/", source: "Google AI Blog", category: "models" },
  { url: "https://openai.com/blog/rss.xml", source: "OpenAI", category: "models" },
  // Additional tech sources
  { url: "https://www.zdnet.com/topic/artificial-intelligence/rss.xml", source: "ZDNet", category: "products" },
  { url: "https://www.engadget.com/rss.xml", source: "Engadget", category: "products" },
  { url: "https://feeds.feedburner.com/TheHackersNews", source: "The Hacker News", category: "research" },
  { url: "https://www.technologyreview.com/feed/", source: "MIT Tech Review", category: "research" },
  { url: "https://www.theinformation.com/feed", source: "The Information", category: "industry" },
  { url: "https://9to5google.com/feed/", source: "9to5Google", category: "products" },
  { url: "https://9to5mac.com/feed/", source: "9to5Mac", category: "products" },
];

function categorizeArticle(title: string, description: string, defaultCategory: string): string {
  const text = `${title} ${description}`.toLowerCase();

  if (text.match(/\b(gpt|llm|claude|gemini|llama|mistral|model|transformer|fine.?tun|parameter|benchmark|training|weights)\b/)) {
    return "models";
  }
  if (text.match(/\b(paper|research|study|findings|arxiv|neural|algorithm|breakthrough|discovery|scientists)\b/)) {
    return "research";
  }
  if (text.match(/\b(launch|product|app|feature|update|release|tool|platform|service|api|chatbot|assistant)\b/)) {
    return "products";
  }
  if (text.match(/\b(regulation|policy|govern|law|ethics|safety|bias|ban|copyright|congress|eu.?ai.?act)\b/)) {
    return "policy";
  }
  if (text.match(/\b(funding|acquisition|startup|valuation|revenue|ipo|invest|partnership|deal|billion|million)\b/)) {
    return "industry";
  }

  return defaultCategory;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8217;/g, "\u2019")
    .replace(/&#8216;/g, "\u2018")
    .replace(/&#8220;/g, "\u201C")
    .replace(/&#8221;/g, "\u201D")
    .replace(/&#8211;/g, "\u2013")
    .replace(/&#8212;/g, "\u2014")
    .replace(/&#\d+;/g, (match) => {
      const code = parseInt(match.replace(/&#|;/g, ""), 10);
      return String.fromCharCode(code);
    })
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrl(item: any): string | undefined {
  // Try media:content (single object)
  if (item["media:content"]?.$?.url) {
    return item["media:content"].$.url;
  }
  // Try media:content (array)
  if (Array.isArray(item["media:content"])) {
    const img = item["media:content"].find((m: any) => m.$?.medium === "image" || m.$?.url);
    if (img?.$?.url) return img.$.url;
  }
  // Try media:thumbnail
  if (item["media:thumbnail"]?.$?.url) {
    return item["media:thumbnail"].$.url;
  }
  if (Array.isArray(item["media:thumbnail"])) {
    if (item["media:thumbnail"][0]?.$?.url) return item["media:thumbnail"][0].$.url;
  }
  // Try media:group > media:content
  if (item["media:group"]?.["media:content"]?.$?.url) {
    return item["media:group"]["media:content"].$.url;
  }
  // Try enclosure
  if (item.enclosure?.url && (item.enclosure.type?.startsWith("image") || !item.enclosure.type)) {
    return item.enclosure.url;
  }
  // Try to extract from content/description HTML
  const content = item["content:encoded"] || item.content || item.description || "";
  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/);
  if (imgMatch) {
    return imgMatch[1];
  }
  // Try og:image in content
  const ogMatch = content.match(/property=["']og:image["'][^>]+content=["']([^"']+)["']/);
  if (ogMatch) {
    return ogMatch[1];
  }
  return undefined;
}

async function fetchAllFeeds(): Promise<NewsArticle[]> {
  const articles: NewsArticle[] = [];
  const seenUrls = new Set<string>();

  const feedPromises = RSS_FEEDS.map(async (feedConfig) => {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = (feed.items || []).slice(0, 30); // Fetch more items per feed

      for (const item of items) {
        if (!item.title || !item.link) continue;
        if (seenUrls.has(item.link)) continue;
        seenUrls.add(item.link);

        const description = stripHtml(
          item.contentSnippet || item.content || item.summary || item.description || ""
        ).slice(0, 300);

        const title = stripHtml(item.title);
        const category = categorizeArticle(title, description, feedConfig.category);
        const imageUrl = extractImageUrl(item);

        articles.push({
          id: Buffer.from(item.link).toString("base64").slice(0, 40),
          title,
          description: description || "No description available.",
          url: item.link,
          source: feedConfig.source,
          category,
          publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
          imageUrl,
        });
      }
    } catch (err) {
      console.error(`Failed to fetch ${feedConfig.source}: ${(err as Error).message}`);
    }
  });

  await Promise.all(feedPromises);

  // Sort by date, newest first
  articles.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  return articles;
}

// Cache for 2 minutes so news feels near real-time
const CACHE_DURATION_MS = 2 * 60 * 1000;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/news", async (_req, res) => {
    try {
      const now = Date.now();
      const lastFetch = storage.getLastFetchTime();

      if (now - lastFetch > CACHE_DURATION_MS) {
        const articles = await fetchAllFeeds();
        if (articles.length > 0) {
          storage.setArticles(articles);
          storage.setLastFetchTime(now);
        }
      }

      const articles = await storage.getArticles();
      const category = _req.query.category as string | undefined;
      const search = _req.query.search as string | undefined;

      let filtered = articles;

      if (category && category !== "all") {
        filtered = filtered.filter((a) => a.category === category);
      }

      const source = _req.query.source as string | undefined;
      if (source) {
        const selectedSources = source.split(",").map((s) => s.trim());
        filtered = filtered.filter((a) => selectedSources.includes(a.source));
      }

      // Date filter: accepts comma-separated YYYY-MM-DD dates
      const dates = _req.query.dates as string | undefined;
      if (dates) {
        const selectedDates = dates.split(",").map((d) => d.trim());
        filtered = filtered.filter((a) => {
          const articleDate = new Date(a.publishedAt).toISOString().split("T")[0];
          return selectedDates.includes(articleDate);
        });
      }

      if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter(
          (a) =>
            a.title.toLowerCase().includes(lower) ||
            a.description.toLowerCase().includes(lower) ||
            a.source.toLowerCase().includes(lower)
        );
      }

      res.json(filtered);
    } catch (err) {
      console.error("Error fetching news:", err);
      res.status(500).json({ error: "Failed to fetch news" });
    }
  });

  app.get("/api/sources", async (_req, res) => {
    const articles = await storage.getArticles();
    const sources = [...new Set(articles.map((a) => a.source))];
    res.json(sources);
  });

  return httpServer;
}
