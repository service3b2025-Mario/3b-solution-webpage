import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POPULAR_REGIONS } from "../../../shared/regionMapping";

interface QuickFilterChipsProps {
  selectedLocation?: string;
  onLocationSelect: (location: string, type: "country" | "region" | "continent") => void;
  propertyCounts?: Record<string, number>;
}

export function QuickFilterChips({
  selectedLocation,
  onLocationSelect,
  propertyCounts = {},
}: QuickFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {POPULAR_REGIONS.map((region) => {
        const isSelected = selectedLocation === region.key;
        const count = propertyCounts[region.key] || 0;

        return (
          <Button
            key={region.key}
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => onLocationSelect(region.key, region.type)}
            className={`
              relative transition-all duration-200
              ${isSelected 
                ? "bg-primary text-primary-foreground shadow-md scale-105" 
                : "bg-background hover:bg-accent hover:scale-105"
              }
            `}
          >
            <span className="mr-1.5">{region.flag}</span>
            <span className="font-medium">{region.label}</span>
            {count > 0 && (
              <Badge 
                variant="secondary" 
                className={`
                  ml-2 px-1.5 py-0 text-xs font-semibold
                  ${isSelected 
                    ? "bg-primary-foreground/20 text-primary-foreground" 
                    : "bg-muted text-muted-foreground"
                  }
                `}
              >
                {count}
              </Badge>
            )}
          </Button>
        );
      })}
    </div>
  );
}
