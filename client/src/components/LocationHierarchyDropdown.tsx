import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MapPin, Globe } from "lucide-react";
import { getRegionHierarchy, type RegionHierarchy } from "../../../shared/regionMapping";

interface LocationHierarchyDropdownProps {
  selectedLocation?: string;
  onLocationSelect: (location: string, type: "country" | "region" | "continent") => void;
  propertyCounts?: Record<string, number>;
}

export function LocationHierarchyDropdown({
  selectedLocation,
  onLocationSelect,
  propertyCounts = {},
}: LocationHierarchyDropdownProps) {
  const [open, setOpen] = useState(false);
  const hierarchy = getRegionHierarchy();

  const handleSelect = (location: string, type: "country" | "region" | "continent") => {
    onLocationSelect(location, type);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[280px] justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="truncate">
              {selectedLocation || "All Locations"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[280px] max-h-[500px] overflow-y-auto z-[10000]" align="start">
        <DropdownMenuItem
          onClick={() => handleSelect("", "continent")}
          className="cursor-pointer"
        >
          <Globe className="mr-2 h-4 w-4" />
          <span className="font-medium">All Locations</span>
          {propertyCounts["all"] && (
            <Badge variant="secondary" className="ml-auto">
              {propertyCounts["all"]}
            </Badge>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />

        {hierarchy.map((continent) => (
          <DropdownMenuSub key={continent.continent}>
            <DropdownMenuSubTrigger className="cursor-pointer">
              <span className="mr-2">{continent.continentIcon}</span>
              <span className="font-medium">{continent.continent}</span>
              {propertyCounts[continent.continent] && (
                <Badge variant="secondary" className="ml-auto">
                  {propertyCounts[continent.continent]}
                </Badge>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent className="max-h-[400px] overflow-y-auto z-[10001]">
                <DropdownMenuItem
                  onClick={() => handleSelect(continent.continent, "continent")}
                  className="cursor-pointer font-medium"
                >
                  <span className="mr-2">{continent.continentIcon}</span>
                  All {continent.continent}
                  {propertyCounts[continent.continent] && (
                    <Badge variant="secondary" className="ml-auto">
                      {propertyCounts[continent.continent]}
                    </Badge>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />

                {continent.regions.map((region) => (
                  <DropdownMenuSub key={region.name}>
                    <DropdownMenuSubTrigger className="cursor-pointer pl-4">
                      <span className="text-sm">{region.name}</span>
                      {propertyCounts[region.name] && (
                        <Badge variant="secondary" className="ml-auto text-xs">
                          {propertyCounts[region.name]}
                        </Badge>
                      )}
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="max-h-[350px] overflow-y-auto z-[10002]">
                        <DropdownMenuItem
                          onClick={() => handleSelect(region.name, "region")}
                          className="cursor-pointer font-medium text-sm"
                        >
                          All {region.name}
                          {propertyCounts[region.name] && (
                            <Badge variant="secondary" className="ml-auto text-xs">
                              {propertyCounts[region.name]}
                            </Badge>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {region.countries.map((country) => (
                          <DropdownMenuItem
                            key={country.name}
                            onClick={() => handleSelect(country.name, "country")}
                            className="cursor-pointer pl-4 text-sm"
                          >
                            <span className="mr-2">{country.flag}</span>
                            <span>{country.name}</span>
                            {propertyCounts[country.name] && (
                              <Badge variant="secondary" className="ml-auto text-xs">
                                {propertyCounts[country.name]}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
