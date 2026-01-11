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
      <div className={`grid ${getGridCols()} gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 px-4 md:px-6`}>
        <div className="flex items-center gap-2 font-medium text-muted-foreground text-sm md:text-base min-w-[100px] md:min-w-[140px] lg:min-w-[160px]">
          {Icon && <Icon className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />}
          <span>{label}</span>
        </div>
        {values.slice(0, 3).map((value, index) => (
          <div key={index} className="text-sm md:text-base lg:text-lg">
            {value || "—"}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[95vw] lg:max-w-[90vw] xl:max-w-[85vw] max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 md:p-6 lg:p-8 pb-0">
          <DialogTitle className="text-xl md:text-2xl lg:text-3xl">Property Comparison</DialogTitle>
        </DialogHeader>

        {/* Scrollable container */}
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(90vh-140px)] p-4 md:p-6 lg:p-8 pt-4">
          <div className="min-w-[600px] md:min-w-0 space-y-6 md:space-y-8">
            {/* Property Images and Titles */}
            <div className={`grid ${getGridCols()} gap-4 md:gap-6 lg:gap-8`}>
              <div className="font-medium text-muted-foreground text-sm md:text-base flex items-center min-w-[100px] md:min-w-[140px] lg:min-w-[160px]">
                Property
              </div>
              {properties.slice(0, 3).map((property) => (
                <div key={property.id} className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 h-6 w-6 md:h-8 md:w-8 bg-black/50 hover:bg-black/70 rounded-full"
                    onClick={() => onRemove(property.id)}
                  >
                    <X className="w-4 h-4 md:w-5 md:h-5 text-white" />
                  </Button>
                  <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-3">
                    {property.mainImage ? (
                      <img
                        src={property.mainImage}
                        alt={property.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-12 h-12 md:w-16 md:h-16 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-sm md:text-base lg:text-lg line-clamp-2">{property.title}</h3>
                  <Badge 
                    variant={property.status === 'available' ? 'default' : 'secondary'} 
                    className="mt-2 text-xs md:text-sm"
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
                <div className={`grid ${getGridCols()} gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 px-4 md:px-6`}>
                  <div className="font-medium text-muted-foreground text-sm md:text-base min-w-[100px] md:min-w-[140px] lg:min-w-[160px]">
                    Features
                  </div>
                  {properties.slice(0, 3).map((property, index) => (
                    <div key={index} className="text-sm md:text-base space-y-1">
                      {property.features && property.features.length > 0 ? (
                        property.features.slice(0, 5).map((feature, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-green-500 flex-shrink-0">✓</span>
                            <span className="text-xs md:text-sm">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {property.features && property.features.length > 5 && (
                        <span className="text-xs md:text-sm text-muted-foreground">
                          +{property.features.length - 5} more
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="border-b border-border last:border-b-0">
                <div className={`grid ${getGridCols()} gap-4 md:gap-6 lg:gap-8 py-4 md:py-5 px-4 md:px-6`}>
                  <div className="font-medium text-muted-foreground text-sm md:text-base min-w-[100px] md:min-w-[140px] lg:min-w-[160px]">
                    Amenities
                  </div>
                  {properties.slice(0, 3).map((property, index) => (
                    <div key={index} className="text-sm md:text-base space-y-1">
                      {property.amenities && property.amenities.length > 0 ? (
                        property.amenities.slice(0, 5).map((amenity, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-blue-500 flex-shrink-0">✓</span>
                            <span className="text-xs md:text-sm">{amenity}</span>
                          </div>
                        ))
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                      {property.amenities && property.amenities.length > 5 && (
                        <span className="text-xs md:text-sm text-muted-foreground">
                          +{property.amenities.length - 5} more
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
        <div className="p-4 md:p-6 lg:p-8 pt-4 border-t bg-white">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} className="md:text-base md:px-6 md:py-2">
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
