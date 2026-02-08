import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RotateCcw, MapPin } from "lucide-react";

interface InteractiveWorldMapProps {
  selectedLocation?: string;
  onLocationSelect: (location: string, type: "country" | "region" | "continent") => void;
  propertyCounts?: Record<string, number>;
}

// Define regions with their countries
const regions = [
  {
    name: "Philippines",
    type: "country" as const,
    countries: ["Philippines"],
    icon: "🇵🇭",
    description: "Southeast Asia's premier property destination",
    position: { top: "45%", left: "75%" },
  },
  {
    name: "Maldives",
    type: "country" as const,
    countries: ["Maldives"],
    icon: "🇲🇻",
    description: "Luxury island resort opportunities",
    position: { top: "52%", left: "65%" },
  },
  {
    name: "Caribbean",
    type: "region" as const,
    countries: ["Dominican Republic", "Bahamas", "Jamaica", "Cuba", "Haiti", "Barbados", "Trinidad and Tobago", "Grenada", "Saint Lucia", "Saint Vincent and the Grenadines", "Antigua and Barbuda", "Dominica", "Saint Kitts and Nevis"],
    icon: "🏝️",
    description: "Tropical paradise developments",
    position: { top: "42%", left: "22%" },
  },
  {
    name: "United States",
    type: "country" as const,
    countries: ["United States"],
    icon: "🇺🇸",
    description: "North American market opportunities",
    position: { top: "35%", left: "18%" },
  },
  {
    name: "Europe",
    type: "continent" as const,
    countries: ["Spain", "France", "Germany", "Italy", "United Kingdom", "Greece", "Portugal"],
    icon: "🇪🇺",
    description: "European luxury real estate",
    position: { top: "28%", left: "48%" },
  },
];

export function InteractiveWorldMap({
  selectedLocation,
  onLocationSelect,
  propertyCounts = {},
}: InteractiveWorldMapProps) {
  const handleReset = () => {
    onLocationSelect("", "country");
  };

  // Calculate total properties for each region
  const getRegionCount = (region: typeof regions[0]) => {
    return region.countries.reduce((total, country) => {
      return total + (propertyCounts[country] || 0);
    }, 0);
  };

  return (
    <Card className="relative bg-card border border-border overflow-hidden p-6">
      {/* Reset Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleReset}
          className="bg-background/95 backdrop-blur shadow-lg"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h3 className="text-2xl font-semibold mb-2">Explore Properties by Region</h3>
        <p className="text-muted-foreground">Click on a region to view available properties</p>
      </div>

      {/* World Map Visualization */}
      <div className="relative w-full h-[600px] bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-lg border-2 border-border overflow-hidden">
        {/* Simplified world map background */}
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {/* Simple continent shapes */}
            {/* North America */}
            <path d="M 50 80 Q 120 60, 180 100 L 160 180 Q 140 200, 100 190 Z" fill="currentColor" />
            {/* South America */}
            <path d="M 140 220 Q 160 240, 150 300 L 130 320 Q 110 300, 120 260 Z" fill="currentColor" />
            {/* Europe */}
            <path d="M 350 60 Q 400 50, 420 80 L 410 120 Q 380 130, 360 110 Z" fill="currentColor" />
            {/* Africa */}
            <path d="M 380 140 Q 420 160, 430 220 L 410 280 Q 380 290, 370 240 Z" fill="currentColor" />
            {/* Asia */}
            <path d="M 480 70 Q 600 60, 680 100 L 670 180 Q 620 200, 550 180 L 500 140 Z" fill="currentColor" />
            {/* Australia */}
            <path d="M 620 260 Q 680 250, 700 280 L 690 310 Q 650 320, 630 300 Z" fill="currentColor" />
          </svg>
        </div>

        {/* Region markers */}
        {regions.map((region) => {
          const count = getRegionCount(region);
          const isSelected = region.countries.includes(selectedLocation || "");
          
          return (
            <button
              key={region.name}
              onClick={() => {
                // If it's a single country, use the country name
                // If it's a region/continent, use the first country or region name
                const locationToSelect = region.type === "country" 
                  ? region.countries[0]
                  : region.countries.find(c => propertyCounts[c] && propertyCounts[c] > 0) || region.countries[0];
                
                onLocationSelect(locationToSelect, region.type);
              }}
              disabled={count === 0}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 ${
                count === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
              } ${isSelected ? 'scale-125 z-20' : 'z-10'}`}
              style={{
                top: region.position.top,
                left: region.position.left,
              }}
            >
              <div className={`relative ${isSelected ? 'animate-pulse' : ''}`}>
                {/* Marker pin */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-lg ${
                  isSelected 
                    ? 'bg-orange-500 ring-4 ring-orange-300' 
                    : count > 0 
                      ? 'bg-blue-500 hover:bg-blue-600 ring-2 ring-blue-300' 
                      : 'bg-gray-400 ring-2 ring-gray-300'
                }`}>
                  {region.icon}
                </div>
                
                {/* Property count badge */}
                {count > 0 && (
                  <div className={`absolute -top-2 -right-2 min-w-[24px] h-6 px-2 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-md ${
                    isSelected ? 'bg-orange-600' : 'bg-blue-600'
                  }`}>
                    {count}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Region Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {regions.map((region) => {
          const count = getRegionCount(region);
          const isSelected = region.countries.includes(selectedLocation || "");
          
          return (
            <Card
              key={region.name}
              className={`p-4 cursor-pointer transition-all duration-200 ${
                count === 0 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:scale-105'
              } ${
                isSelected 
                  ? 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950/20' 
                  : 'hover:bg-accent'
              }`}
              onClick={() => {
                if (count > 0) {
                  const locationToSelect = region.type === "country" 
                    ? region.countries[0]
                    : region.countries.find(c => propertyCounts[c] && propertyCounts[c] > 0) || region.countries[0];
                  
                  onLocationSelect(locationToSelect, region.type);
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{region.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold">{region.name}</h4>
                    {count > 0 && (
                      <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                        isSelected 
                          ? 'bg-orange-500 text-white' 
                          : 'bg-blue-500 text-white'
                      }`}>
                        {count}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{region.description}</p>
                  {count === 0 && (
                    <p className="text-xs text-muted-foreground mt-1 italic">No properties available</p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
        <div className="flex items-start gap-2">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click on a region marker on the map or select a region card below</li>
              <li>View the number of available properties in each region</li>
              <li>Selected regions are highlighted in orange</li>
              <li>Use the reset button (top right) to clear your selection</li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
