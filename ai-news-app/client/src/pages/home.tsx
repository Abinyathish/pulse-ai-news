import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type { NewsArticle } from "@shared/schema";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CategoryTabs } from "@/components/CategoryTabs";
import { SearchBar } from "@/components/SearchBar";
import { NewsCard } from "@/components/NewsCard";
import { NewsSkeleton } from "@/components/NewsSkeleton";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { RefreshCw, Newspaper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { queryClient, API_BASE } from "@/lib/queryClient";

export default function Home() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeAgoText, setTimeAgoText] = useState("");

  const { data: articles, isLoading, isError, isFetching, dataUpdatedAt } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news", { category, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category !== "all") params.set("category", category);
      if (search) params.set("search", search);
      const url = `${API_BASE}/api/news${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch news");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    refetchInterval: 3 * 60 * 1000, // auto-refresh every 3 minutes
    refetchOnWindowFocus: true,
  });

  // Track last updated time
  useEffect(() => {
    if (dataUpdatedAt) {
      setLastUpdated(new Date(dataUpdatedAt));
    }
  }, [dataUpdatedAt]);

  // Update relative time text every 30 seconds
  useEffect(() => {
    const update = () => {
      if (!lastUpdated) return;
      const seconds = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (seconds < 10) setTimeAgoText("just now");
      else if (seconds < 60) setTimeAgoText(`${seconds}s ago`);
      else if (seconds < 3600) setTimeAgoText(`${Math.floor(seconds / 60)}m ago`);
      else setTimeAgoText(`${Math.floor(seconds / 3600)}h ago`);
    };
    update();
    const interval = setInterval(update, 30000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-4">
            <Logo />
            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <SearchBar value={search} onChange={setSearch} />
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleRefresh}
                disabled={isFetching}
                aria-label="Refresh news"
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile search */}
      <div className="sm:hidden px-4 pt-3">
        <SearchBar value={search} onChange={setSearch} />
      </div>

      {/* Category tabs */}
      <div className="border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          <CategoryTabs activeCategory={category} onCategoryChange={setCategory} />
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-6">
        {isLoading ? (
          <NewsSkeleton />
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-base font-semibold mb-2">Failed to load news</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Something went wrong fetching the latest AI news.
            </p>
            <Button onClick={handleRefresh} data-testid="button-retry">
              Try again
            </Button>
          </div>
        ) : articles && articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Newspaper className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-base font-semibold mb-2">No articles found</h2>
            <p className="text-sm text-muted-foreground">
              {search
                ? `No results for "${search}". Try a different search term.`
                : "No articles available for this category right now."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-muted-foreground" data-testid="text-count">
                {articles?.length} article{articles?.length !== 1 ? "s" : ""}
              </p>
              {timeAgoText && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground" data-testid="text-last-updated">
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${isFetching ? "bg-yellow-500 animate-pulse" : "bg-green-500"}`} />
                  <span>{isFetching ? "Updating..." : `Updated ${timeAgoText}`}</span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {articles?.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Pulse AI News — Real-time AI and tech updates
          </p>
          <PerplexityAttribution />
        </div>
      </footer>
    </div>
  );
}
