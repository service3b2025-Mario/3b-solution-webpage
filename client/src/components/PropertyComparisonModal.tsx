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

  const ComparisonRow = ({ label, values, icon: Icon }: { label: string; values: (string | number | undefined)[]; icon?: any }) => (
    <div className="border-b border-border">
      <div className="grid grid-cols-4 gap-4 py-4">
        <div className="flex items-center gap-2 font-medium text-muted-foreground">
          {Icon && <Icon className="w-4 h-4" />}
          {label}
        </div>
        {values.map((value, index) => (
          <div key={index} className="text-sm">
            {value || "—"}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Property Comparison</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Images and Titles */}
          <div className="grid grid-cols-4 gap-4">
            <div className="font-medium text-muted-foreground">Property</div>
            {properties.map((property) => (
              <div key={property.id} className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 h-6 w-6 bg-black/50 hover:bg-black/70"
                  onClick={() => onRemove(property.id)}
                >
                  <X className="w-4 h-4 text-white" />
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
                      <Building2 className="w-12 h-12 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-sm line-clamp-2">{property.title}</h3>
                <Badge variant={property.status === 'available' ? 'default' : 'secondary'} className="mt-1">
                  {property.status}
                </Badge>
              </div>
            ))}
          </div>

          {/* Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <ComparisonRow
              label="Location"
              icon={MapPin}
              values={properties.map(p => `${p.city || p.country}, ${p.region}`)}
            />
            <ComparisonRow
              label="Property Type"
              icon={Building2}
              values={properties.map(p => p.propertyType)}
            />
            <ComparisonRow
              label="Price"
              icon={DollarSign}
              values={properties.map(p => formatPrice(p.priceMin, p.priceMax, p.currency))}
            />
            <ComparisonRow
              label="Expected Return"
              icon={TrendingUp}
              values={properties.map(p => p.expectedReturn ? `${p.expectedReturn}%` : undefined)}
            />
            <ComparisonRow
              label="Investment Timeline"
              icon={Calendar}
              values={properties.map(p => p.investmentTimeline)}
            />
            <ComparisonRow
              label="Size"
              values={properties.map(p => p.size && p.sizeUnit ? `${p.size} ${p.sizeUnit}` : undefined)}
            />
            <ComparisonRow
              label="Bedrooms"
              icon={Bed}
              values={properties.map(p => p.bedrooms)}
            />
            <ComparisonRow
              label="Bathrooms"
              icon={Bath}
              values={properties.map(p => p.bathrooms)}
            />
            
            {/* Features */}
            <div className="border-b border-border">
              <div className="grid grid-cols-4 gap-4 py-4">
                <div className="font-medium text-muted-foreground">Features</div>
                {properties.map((property, index) => (
                  <div key={index} className="text-sm space-y-1">
                    {property.features && property.features.length > 0 ? (
                      property.features.slice(0, 5).map((feature, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-green-500">✓</span>
                          <span className="text-xs">{feature}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {property.features && property.features.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{property.features.length - 5} more
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="border-b border-border">
              <div className="grid grid-cols-4 gap-4 py-4">
                <div className="font-medium text-muted-foreground">Amenities</div>
                {properties.map((property, index) => (
                  <div key={index} className="text-sm space-y-1">
                    {property.amenities && property.amenities.length > 0 ? (
                      property.amenities.slice(0, 5).map((amenity, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-blue-500">✓</span>
                          <span className="text-xs">{amenity}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                    {property.amenities && property.amenities.length > 5 && (
                      <span className="text-xs text-muted-foreground">
                        +{property.amenities.length - 5} more
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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
