import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter } from "lucide-react";

interface AdvancedFiltersProps {
  onFiltersChange: (filters: {
    priceRange: [number, number];
    amenities: string[];
    bedrooms?: number;
  }) => void;
}

const amenitiesList = [
  "Swimming Pool",
  "Gym/Fitness Center",
  "24/7 Security",
  "Parking",
  "Garden",
  "Balcony",
  "Sea View",
  "Mountain View",
  "WiFi",
  "Air Conditioning",
  "Elevator",
  "Pet Friendly",
];

export function AdvancedFilters({ onFiltersChange }: AdvancedFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [bedrooms, setBedrooms] = useState<number | undefined>();

  const handleAmenityToggle = (amenity: string) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity)
        ? prev.filter(a => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleApply = () => {
    onFiltersChange({
      priceRange,
      amenities: selectedAmenities,
      bedrooms,
    });
  };

  const handleReset = () => {
    setPriceRange([0, 10000000]);
    setSelectedAmenities([]);
    setBedrooms(undefined);
    onFiltersChange({
      priceRange: [0, 10000000],
      amenities: [],
      bedrooms: undefined,
    });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Advanced Filters
          {(selectedAmenities.length > 0 || bedrooms) && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {selectedAmenities.length + (bedrooms ? 1 : 0)}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Advanced Filters</SheetTitle>
          <SheetDescription>
            Refine your property search with detailed criteria
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Price Range Slider */}
          <div className="space-y-4">
            <Label>Price Range</Label>
            <div className="px-2">
              <Slider
                min={0}
                max={10000000}
                step={100000}
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>${priceRange[0].toLocaleString()}</span>
              <span>${priceRange[1].toLocaleString()}</span>
            </div>
          </div>

          {/* Bedrooms */}
          <div className="space-y-3">
            <Label>Minimum Bedrooms</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((num) => (
                <Button
                  key={num}
                  variant={bedrooms === num ? "default" : "outline"}
                  size="sm"
                  onClick={() => setBedrooms(bedrooms === num ? undefined : num)}
                  className="flex-1"
                >
                  {num}+
                </Button>
              ))}
            </div>
          </div>

          {/* Amenities */}
          <div className="space-y-3">
            <Label>Amenities</Label>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesList.map((amenity) => (
                <div key={amenity} className="flex items-center space-x-2">
                  <Checkbox
                    id={amenity}
                    checked={selectedAmenities.includes(amenity)}
                    onCheckedChange={() => handleAmenityToggle(amenity)}
                  />
                  <label
                    htmlFor={amenity}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1">
            Reset
          </Button>
          <SheetTrigger asChild>
            <Button onClick={handleApply} className="flex-1">
              Apply Filters
            </Button>
          </SheetTrigger>
        </div>
      </SheetContent>
    </Sheet>
  );
}
