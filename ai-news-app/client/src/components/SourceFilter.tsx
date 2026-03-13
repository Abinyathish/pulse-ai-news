import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Filter, Check, ChevronDown } from "lucide-react";

const SOURCE_COLORS: Record<string, string> = {
  "TechCrunch": "bg-emerald-500",
  "The Verge": "bg-violet-500",
  "Ars Technica": "bg-orange-500",
  "Wired": "bg-zinc-700 dark:bg-zinc-400",
  "VentureBeat": "bg-blue-500",
  "MIT News": "bg-red-600",
  "Google AI Blog": "bg-sky-500",
  "OpenAI": "bg-teal-500",
};

const ALL_SOURCES = [
  "TechCrunch",
  "The Verge",
  "Ars Technica",
  "Wired",
  "VentureBeat",
  "MIT News",
  "Google AI Blog",
  "OpenAI",
];

interface SourceFilterProps {
  selectedSources: string[];
  onSourcesChange: (sources: string[]) => void;
}

export function SourceFilter({ selectedSources, onSourcesChange }: SourceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selectedSources.length === 0;

  const toggleSource = (source: string) => {
    if (selectedSources.includes(source)) {
      const updated = selectedSources.filter((s) => s !== source);
      onSourcesChange(updated);
    } else {
      onSourcesChange([...selectedSources, source]);
    }
  };

  const selectAll = () => {
    onSourcesChange([]);
  };

  const activeCount = selectedSources.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-source-filter"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
          activeCount > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <Filter className="h-3.5 w-3.5" />
        <span>Sources</span>
        {activeCount > 0 && (
          <span className="ml-0.5 text-xs bg-primary text-primary-foreground rounded-full h-4 min-w-[16px] flex items-center justify-center px-1">
            {activeCount}
          </span>
        )}
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-56 rounded-lg border bg-popover shadow-lg z-50 py-1.5 animate-in fade-in-0 zoom-in-95">
          {/* Select All */}
          <button
            onClick={selectAll}
            data-testid="source-all"
            className={cn(
              "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-muted",
              allSelected && "text-primary font-medium"
            )}
          >
            <div className={cn(
              "h-4 w-4 rounded border flex items-center justify-center shrink-0",
              allSelected ? "bg-primary border-primary" : "border-border"
            )}>
              {allSelected && <Check className="h-3 w-3 text-primary-foreground" />}
            </div>
            <span>All Sources</span>
          </button>

          <div className="h-px bg-border mx-2 my-1" />

          {/* Individual sources */}
          {ALL_SOURCES.map((source) => {
            const isSelected = selectedSources.includes(source);
            return (
              <button
                key={source}
                onClick={() => toggleSource(source)}
                data-testid={`source-${source.toLowerCase().replace(/\s+/g, "-")}`}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-muted",
                  isSelected && "text-foreground font-medium"
                )}
              >
                <div className={cn(
                  "h-4 w-4 rounded border flex items-center justify-center shrink-0",
                  isSelected ? "bg-primary border-primary" : "border-border"
                )}>
                  {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                </div>
                <span className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  SOURCE_COLORS[source] || "bg-gray-400"
                )} />
                <span>{source}</span>
              </button>
            );
          })}

          {/* Clear filter */}
          {activeCount > 0 && (
            <>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={selectAll}
                data-testid="source-clear"
                className="w-full px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
