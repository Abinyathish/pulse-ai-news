import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { CalendarDays, Check, ChevronDown, X } from "lucide-react";

interface DateFilterProps {
  selectedDates: string[];
  onDatesChange: (dates: string[]) => void;
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  if (dateOnly.getTime() === today.getTime()) return "Today";
  if (dateOnly.getTime() === yesterday.getTime()) return "Yesterday";

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getRecentDates(count: number): string[] {
  const dates: string[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split("T")[0]);
  }
  return dates;
}

export function DateFilter({ selectedDates, onDatesChange }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recentDates = getRecentDates(7); // Last 7 days

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSelected = selectedDates.length === 0;

  const toggleDate = (date: string) => {
    if (selectedDates.includes(date)) {
      onDatesChange(selectedDates.filter((d) => d !== date));
    } else {
      onDatesChange([...selectedDates, date]);
    }
  };

  const selectAll = () => onDatesChange([]);
  const selectToday = () => onDatesChange([recentDates[0]]);

  const activeCount = selectedDates.length;

  // Build button label
  let buttonLabel = "Date";
  if (activeCount === 1) {
    buttonLabel = formatDateLabel(selectedDates[0]);
  } else if (activeCount > 1) {
    buttonLabel = `${activeCount} days`;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        data-testid="button-date-filter"
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors border",
          activeCount > 0
            ? "border-primary/50 bg-primary/10 text-primary"
            : "border-border text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
      >
        <CalendarDays className="h-3.5 w-3.5" />
        <span>{buttonLabel}</span>
        {activeCount > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectAll();
            }}
            className="ml-0.5 hover:bg-primary/20 rounded-full p-0.5"
            aria-label="Clear date filter"
          >
            <X className="h-3 w-3" />
          </button>
        )}
        {activeCount === 0 && (
          <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-52 rounded-lg border bg-popover shadow-lg z-50 py-1.5 animate-in fade-in-0 zoom-in-95">
          {/* All Dates */}
          <button
            onClick={selectAll}
            data-testid="date-all"
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
            <span>All Dates</span>
          </button>

          <div className="h-px bg-border mx-2 my-1" />

          {/* Quick select: Today */}
          <button
            onClick={() => { selectToday(); setIsOpen(false); }}
            data-testid="date-today-quick"
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm transition-colors hover:bg-muted text-primary font-medium"
          >
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>Today only</span>
          </button>

          <div className="h-px bg-border mx-2 my-1" />

          {/* Individual dates */}
          {recentDates.map((date) => {
            const isSelected = selectedDates.includes(date);
            const label = formatDateLabel(date);

            // Also show day of week for non-today/yesterday
            const dayOfWeek = new Date(date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
            const fullLabel = label === "Today" || label === "Yesterday" ? label : `${dayOfWeek}, ${label}`;

            return (
              <button
                key={date}
                onClick={() => toggleDate(date)}
                data-testid={`date-${date}`}
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
                <span>{fullLabel}</span>
              </button>
            );
          })}

          {/* Clear */}
          {activeCount > 0 && (
            <>
              <div className="h-px bg-border mx-2 my-1" />
              <button
                onClick={selectAll}
                data-testid="date-clear"
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
