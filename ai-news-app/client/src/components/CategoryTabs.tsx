import { cn } from "@/lib/utils";
import { Brain, FlaskConical, Building2, Package, Shield, Layers } from "lucide-react";

const categories = [
  { id: "all", label: "All", icon: Layers },
  { id: "models", label: "Models", icon: Brain },
  { id: "research", label: "Research", icon: FlaskConical },
  { id: "industry", label: "Industry", icon: Building2 },
  { id: "products", label: "Products", icon: Package },
  { id: "policy", label: "Policy", icon: Shield },
] as const;

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export function CategoryTabs({ activeCategory, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="flex items-center gap-1 flex-wrap" role="tablist" aria-label="News categories">
      {categories.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onCategoryChange(cat.id)}
            data-testid={`tab-${cat.id}`}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
