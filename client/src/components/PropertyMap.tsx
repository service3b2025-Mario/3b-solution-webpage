import { useRef, useCallback, useState } from "react";
import { MapView } from "./Map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Building2, Globe, EyeOff } from "lucide-react";
import { getCountryCoordinates } from "@/../../shared/countryCoordinates";

interface PropertyLocation {
  id: number;
  title: string;
  region: string;
  country: string;
  city?: string | null;
  latitude: number;
  longitude: number;
  propertyType: string;
  priceMin?: string | null;
  expectedReturn?: string | null;
  offMarket?: boolean;
}

interface PropertyMapProps {
  properties: PropertyLocation[];
  className?: string;
  onPropertyClick?: (property: PropertyLocation) => void;
}

// Region center coordinates for initial map view
const regionCenters: Record<string, { lat: number; lng: number; zoom: number }> = {
  SouthEastAsia: { lat: 12.8797, lng: 121.7740, zoom: 5 },
  Maldives: { lat: 3.2028, lng: 73.2207, zoom: 7 },
  MiddleEast: { lat: 25.2048, lng: 55.2708, zoom: 5 },
  Europe: { lat: 48.8566, lng: 2.3522, zoom: 4 },
  NorthAmerica: { lat: 37.0902, lng: -95.7129, zoom: 4 },
  Caribbean: { lat: 18.2208, lng: -66.5901, zoom: 6 },
  SouthAmerica: { lat: -14.2350, lng: -51.9253, zoom: 4 },
};

// Global view center
const globalCenter = { lat: 20, lng: 0 };
const globalZoom = 2;

export function PropertyMap({ properties, className, onPropertyClick }: PropertyMapProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyLocation | null>(null);

  // Get property type color
  const getMarkerColor = (propertyType: string): string => {
    const colors: Record<string, string> = {
      Hospitality: "#e67e22",
      Island: "#3498db",
      Resort: "#27ae60",
      CityHotel: "#9b59b6",
      CountrysideHotel: "#1abc9c",
      MixedUse: "#f39c12",
      Office: "#34495e",
      Commercial: "#e74c3c",
      Residential: "#2ecc71",
      Land: "#95a5a6",
      default: "#e67e22",
    };
    return colors[propertyType] || colors.default;
  };

  // Create custom marker element
  const createMarkerElement = (property: PropertyLocation): HTMLElement => {
    const color = getMarkerColor(property.propertyType);
    const markerDiv = document.createElement("div");
    markerDiv.className = "property-marker";
    markerDiv.innerHTML = `
      <div style="
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s ease;
      ">
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      </div>
    `;
    
    // Hover effect
    markerDiv.addEventListener("mouseenter", () => {
      markerDiv.style.transform = "scale(1.2)";
    });
    markerDiv.addEventListener("mouseleave", () => {
      markerDiv.style.transform = "scale(1)";
    });
    
    return markerDiv;
  };

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    
    // Clear existing markers
    markersRef.current.forEach(marker => marker.map = null);
    markersRef.current = [];
    
    // Add markers for each property with valid coordinates
    properties.forEach((property) => {
      // For off-market properties, use country-level coordinates
      let markerPosition: { lat: number; lng: number };
      if (property.offMarket) {
        markerPosition = getCountryCoordinates(property.country);
      } else if (property.latitude && property.longitude) {
        markerPosition = { lat: property.latitude, lng: property.longitude };
      } else {
        return; // Skip if no valid coordinates
      }
      
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: markerPosition,
        title: property.offMarket ? `${property.title} (Off Market - ${property.country})` : property.title,
        content: createMarkerElement(property),
      });
      
      // Add click listener
      marker.addListener("click", () => {
        setSelectedProperty(property);
        if (onPropertyClick) {
          onPropertyClick(property);
        }
        
        // Pan to marker - use markerPosition instead of property coordinates
        map.panTo(markerPosition);
        map.setZoom(property.offMarket ? 5 : 10); // Zoom less for off-market (country level)
      });
      
      markersRef.current.push(marker);
    });
    
    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      properties.forEach((property) => {
        if (property.latitude && property.longitude) {
          bounds.extend({ lat: property.latitude, lng: property.longitude });
        }
      });
      map.fitBounds(bounds);
    }
  }, [properties, onPropertyClick]);

  const formatPrice = (price: string | null | undefined): string => {
    if (!price) return "Contact for price";
    const num = parseFloat(price);
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    }
    return `$${num.toLocaleString()}`;
  };

  return (
    <div className={className}>
      <div className="relative">
        <MapView
          className="w-full h-[500px] rounded-xl overflow-hidden shadow-lg"
          initialCenter={globalCenter}
          initialZoom={globalZoom}
          onMapReady={handleMapReady}
        />
        
        {/* Selected Property Info Card */}
        {selectedProperty && (
          <Card className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white/95 backdrop-blur-sm shadow-xl border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="w-5 h-5 text-secondary" />
                {selectedProperty.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {selectedProperty.offMarket && (
                <div className="flex items-center gap-2 text-xs font-medium text-orange-600 bg-orange-50 px-2 py-1 rounded">
                  <EyeOff className="w-3 h-3" />
                  Off Market - Country location only
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                {selectedProperty.offMarket ? selectedProperty.country : (selectedProperty.city ? `${selectedProperty.city}, ` : "") + selectedProperty.country}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="w-4 h-4" />
                {selectedProperty.region.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-primary">
                  {formatPrice(selectedProperty.priceMin)}
                </span>
                {selectedProperty.expectedReturn && (
                  <span className="text-secondary font-medium">
                    {selectedProperty.expectedReturn}% return
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Legend */}
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-muted-foreground mb-2">Property Types</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#27ae60" }} />
              <span>Resort</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#3498db" }} />
              <span>Island</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#9b59b6" }} />
              <span>City Hotel</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e74c3c" }} />
              <span>Commercial</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PropertyMap;
