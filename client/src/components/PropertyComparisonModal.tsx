import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MapPin, Bed, Bath, TrendingUp, DollarSign, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Property {
  id: number;
  title: string;
  mainImage?: string;
  region: string;
  country: string;
  city?: string;
  propertyType: string;
  priceMin?: string;
  priceMax?: string;
  currency?: string;
  expectedReturn?: string;
  investmentTimeline?: string;
  size?: string;
  sizeUnit?: string;
  bedrooms?: number;
  bathrooms?: number;
  features?: string[];
  amenities?: string[];
  status: string;
}

interface PropertyComparisonModalProps {
  properties: Property[];
  isOpen: boolean;
  onClose: () => void;
  onRemove: (id: number) => void;
}

export function PropertyComparisonModal({ properties, isOpen, onClose, onRemove }: PropertyComparisonModalProps) {
  const formatPrice = (min?: string, max?: string, currency = "USD") => {
    if (!min && !max) return "Contact for pricing";
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
    
    if (min && max && min !== max) {
      return `${formatter.format(Number(min))} - ${formatter.format(Number(max))}`;
    }
    return formatter.format(Number(min || max));
  };

  // Dynamic column count based on properties (max 3)
  const propertyCount = Math.min(properties.length, 3);
  
  // Grid columns: 1 for labels + number of properties
  const getGridCols = () => {
    switch (propertyCount) {
      case 1: return "grid-cols-2";
      case 2: return "grid-cols-3";
      case 3: return "grid-cols-4";
      default: return "grid-cols-4";
    }
  };

  const ComparisonRow = ({ label, values, icon: Icon }: { label: string; values: (string | number | undefined)[]; icon?: any }) => (
    <div className="border-b border-border last:border-b-0">
      <div className={`grid ${getGridCols()} gap-2 md:gap-4 py-3 md:py-4`}>
        <div className="flex items-center gap-1 md:gap-2 font-medium text-muted-foreground text-xs md:text-sm min-w-[80px] md:min-w-[120px]">
          {Icon && <Icon className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />}
          <span className="truncate">{label}</span>
        </div>
        {values.slice(0, 3).map((value, index) => (
          <div key={index} className="text-xs md:text-sm min-w-[100px] break-words">
            {value || "—"}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 md:p-6 pb-0">
          <DialogTitle className="text-xl md:text-2xl">Property Comparison</DialogTitle>
        </DialogHeader>

        {/* Scrollable container - horizontal on mobile, vertical on all */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(90vh-120px)] p-4 md:p-6 pt-2">
          <div className="min-w-[600px] md:min-w-0 space-y-4 md:space-y-6">
            {/* Property Images and Titles */}
            <div className={`grid ${getGridCols()} gap-2 md:gap-4`}>
              <div className="font-medium text-muted-foreground text-xs md:text-sm flex items-center min-w-[80px] md:min-w-[120px]">
                Property
              </div>
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="relative min-w-[140px] md:min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1 right-1 md:top-2 md:right-2 z-10 h-5 w-5 md:h-6 md:w-6 bg-black/50 hover:bg-black/70 rounded-full"
                    onClick={() => onRemove(property.id)}
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  </Button>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-2">
                    {property.mainImage ? (
                      <img
                        src={property.mainImage}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 md:w-12 md:h-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-xs md:text-sm line-clamp-2">{property.title}</h3>
                  <Badge 
                    variant={property.status === 'available' ? 'default' : 'secondary'} 
                    className="mt-1 text-[10px] md:text-xs"
                  >
                    {property.status}
                  </Badge>
                </div>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="border rounded-lg overflow-hidden bg-white">
              <ComparisonRow
                label="Location"
                icon={MapPin}
                values={properties.slice(0, 3).map(p => `${p.city || p.country}, ${p.region}`)}
              />
              <ComparisonRow
                label="Property Type"
                icon={Building2}
                values={properties.slice(0, 3).map(p => p.propertyType)}
              />
              <ComparisonRow
                label="Price"
                icon={DollarSign}
                values={properties.slice(0, 3).map(p => formatPrice(p.priceMin, p.priceMax, p.currency))}
              />
              <ComparisonRow
                label="Expected Return"
                icon={TrendingUp}
                values={properties.slice(0, 3).map(p => p.expectedReturn ? `${p.expectedReturn}%` : undefined)}
              />
              <ComparisonRow
                label="Investment Timeline"
                icon={Calendar}
                values={properties.slice(0, 3).map(p => p.investmentTimeline)}
              />
              <ComparisonRow
                label="Size"
                values={properties.slice(0, 3).map(p => p.size && p.sizeUnit ? `${p.size} ${p.sizeUnit}` : undefined)}
              />
              <ComparisonRow
                label="Bedrooms"
                icon={Bed}
                values={properties.slice(0, 3).map(p => p.bedrooms)}
              />
              <ComparisonRow
                label="Bathrooms"
                icon={Bath}
                values={properties.slice(0, 3).map(p => p.bathrooms)}
              />
              
              {/* Features */}
              <div className="border-b border-border last:border-b-0">
                <div className={`grid ${getGridCols()} gap-2 md:gap-4 py-3 md:py-4`}>
                  <div className="font-medium text-muted-foreground text-xs md:text-sm min-w-[80px] md:min-w-[120px]">
                    Features
                  </div>
                  {properties.slice(0, 3).map((property, index) => (
                    <div key={index} className="text-xs md:text-sm space-y-1 min-w-[100px]">
                      {property.features && property.features.length > 0 ? (
                        property.features.slice(0, 4).map((feature, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-green-500 flex-shrink-0">✓</span>
                            <span className="text-[10px] md:text-xs truncate">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {property.features && property.features.length > 4 && (
                        <span className="text-[10px] md:text-xs text-muted-foreground">
                          +{property.features.length - 4} more
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="border-b border-border last:border-b-0">
                <div className={`grid ${getGridCols()} gap-2 md:gap-4 py-3 md:py-4`}>
                  <div className="font-medium text-muted-foreground text-xs md:text-sm min-w-[80px] md:min-w-[120px]">
                    Amenities
                  </div>
                  {properties.slice(0, 3).map((property, index) => (
                    <div key={index} className="text-xs md:text-sm space-y-1 min-w-[100px]">
                      {property.amenities && property.amenities.length > 0 ? (
                        property.amenities.slice(0, 4).map((amenity, i) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <span className="text-[10px] md:text-xs truncate">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {property.amenities && property.amenities.length > 4 && (
                        <span className="text-[10px] md:text-xs text-muted-foreground">
                          +{property.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Fixed footer */}
        <div className="p-4 md:p-6 pt-0 border-t bg-white">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
