import { useState } from "react";
import type { NewsArticle } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function categoryColor(category: string) {
  switch (category) {
    case "models": return "bg-chart-1/12 text-[hsl(var(--chart-1))]";
    case "research": return "bg-chart-3/12 text-[hsl(var(--chart-3))]";
    case "industry": return "bg-chart-4/12 text-[hsl(var(--chart-4))]";
    case "products": return "bg-chart-2/12 text-[hsl(var(--chart-2))]";
    case "policy": return "bg-chart-5/12 text-[hsl(var(--chart-5))]";
    default: return "bg-muted text-muted-foreground";
  }
}

function sourceInitials(source: string): string {
  return source
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface NewsCardProps {
  article: NewsArticle;
}

export function NewsCard({ article }: NewsCardProps) {
  const [imgError, setImgError] = useState(false);
  const hasImage = article.imageUrl && !imgError;

  const timeAgo = (() => {
    try {
      return formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true });
    } catch {
      return "";
    }
  })();

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background rounded-md"
      data-testid={`card-article-${article.id}`}
    >
      <Card className="overflow-hidden h-full transition-colors group-hover:bg-card/80 dark:group-hover:bg-card/60">
        {/* Image */}
        {hasImage && (
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-muted">
            <img
              src={article.imageUrl}
              alt=""
              loading="lazy"
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            {/* Source badge overlay */}
            <div className="absolute top-2.5 left-2.5">
              <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2 py-1">
                <div className="h-4 w-4 rounded bg-white/20 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                  {sourceInitials(article.source)}
                </div>
                <span className="text-[11px] text-white/90 font-medium">
                  {article.source}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 flex flex-col gap-2.5 flex-1">
          {/* Source + time (shown when no image) */}
          {!hasImage && (
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold shrink-0">
                  {sourceInitials(article.source)}
                </div>
                <span className="text-xs text-muted-foreground truncate" data-testid="text-source">
                  {article.source}
                </span>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0" data-testid="text-time">
                {timeAgo}
              </span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors" data-testid="text-title">
            {article.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 flex-1" data-testid="text-description">
            {article.description}
          </p>

          {/* Bottom row */}
          <div className="flex items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className={`text-[10px] px-2 py-0.5 ${categoryColor(article.category)}`}>
                {article.category}
              </Badge>
              {hasImage && (
                <span className="text-[11px] text-muted-foreground" data-testid="text-time">
                  {timeAgo}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              Read <ExternalLink className="h-3 w-3" />
            </span>
          </div>
        </div>
      </Card>
    </a>
  );
}
