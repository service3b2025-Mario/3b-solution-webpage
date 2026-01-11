import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  X, MapPin, Bed, Bath, Square, Heart, Share2, Play, Camera,
  Check, Home, Calendar, Car, Thermometer, Wind, Layers, DollarSign,
  TrendingUp, Building2, Phone, Star, ChevronLeft, ChevronRight, Maximize2, Minimize2
} from "lucide-react";
import { PropertyInquiryForm } from "./PropertyInquiryForm";
import { TourScheduler } from "./TourScheduler";

interface Property {
  id: number;
  title: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  longDescription?: string | null;
  price?: number | null;
  priceMin?: number | null;
  priceMax?: number | null;
  pricePerSqft?: number | null;
  location: string;
  country: string;
  region?: string | null;
  address?: string | null;
  propertyType: string;
  assetClass?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  area?: number | null;
  yearBuilt?: number | null;
  lotSize?: string | null;
  landSizeSqm?: string | null;
  landSizeHa?: string | null;
  landPricePerSqm?: string | null;
  buildingAreaSqm?: string | null;
  floorAreaSqm?: string | null;
  floors?: number | null;
  units?: number | null;
  unitsDetails?: string | null;
  floorAreaRatio?: string | null;
  askingPriceNet?: string | null;
  askingPriceGross?: string | null;
  currency?: string | null;
  incomeGenerating?: boolean | null;
  incomeDetails?: string | null;
  parking?: string | null;
  heating?: string | null;
  cooling?: string | null;
  flooring?: string | null;
  hoaFees?: number | null;
  propertyTax?: number | null;
  features?: string[] | null;
  amenities?: string[] | null;
  interiorFeatures?: string[] | null;
  exteriorFeatures?: string[] | null;
  images?: string[] | null;
  mainImage?: string | null;
  videoUrl?: string | null;
  virtualTourUrl?: string | null;
  featured?: boolean | null;
  offMarket?: boolean | null;
  status?: string | null;
  others?: string | null;
  marketValueChange?: number | null;
  estimatedRentalIncome?: number | null;
  capRate?: number | null;
  cashOnCashReturn?: number | null;
  appreciation?: number | null;
}

interface PropertyDetailModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  similarProperties?: Property[];
  agent?: {
    name: string;
    title: string;
    image?: string;
    rating: number;
    reviews: number;
  };
}

export function PropertyDetailModal({ 
  property, 
  isOpen, 
  onClose, 
  similarProperties = [],
  agent = {
    name: "Georg Blascheck",
    title: "CEO & Founder - Real Estate Expert",
    image: "/team-georg.png",
    rating: 4.9,
    reviews: 127
  }
}: PropertyDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState<'photos' | 'video' | 'tour'>('photos');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    contactMethod: "",
    message: ""
  });
  
  if (!property) return null;

  // Use actual features from property data
  const interiorFeatures = property.interiorFeatures && Array.isArray(property.interiorFeatures) && property.interiorFeatures.length > 0 
    ? property.interiorFeatures 
    : null;

  const exteriorFeatures = property.exteriorFeatures && Array.isArray(property.exteriorFeatures) && property.exteriorFeatures.length > 0 
    ? property.exteriorFeatures 
    : null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Contact form submitted:", contactForm);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`w-full p-0 overflow-hidden bg-background transition-all duration-300 ${
        isFullscreen 
          ? '!max-w-[100vw] !w-[100vw] !max-h-[100vh] !h-[100vh] !m-0 !rounded-none' 
          : 'max-w-[95vw] lg:max-w-6xl max-h-[90vh]'
      }`}>
        <DialogTitle className="sr-only">{property.title}</DialogTitle>
        
        {/* Header Action Buttons */}
        <div className="absolute right-4 top-4 z-50 flex items-center gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="rounded-full bg-background/80 backdrop-blur-sm w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors shadow-md"
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-full bg-background/80 backdrop-blur-sm w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors shadow-md"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className={`overflow-y-auto ${isFullscreen ? 'max-h-[100vh]' : 'max-h-[90vh]'}`}>
          {/* Header Section */}
          <div className="sticky top-0 z-40 bg-background border-b px-4 md:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pr-28">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {property.featured && (
                    <Badge className="bg-secondary text-white text-xs px-2 py-0.5">Featured</Badge>
                  )}
                  {property.marketValueChange && property.marketValueChange > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600 text-xs px-2 py-0.5">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Up {property.marketValueChange}%
                    </Badge>
                  )}
                </div>
                <h2 className="text-lg md:text-xl font-bold leading-tight">{property.title}</h2>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                  <Heart className="w-3 h-3 mr-1" /> Save
                </Button>
                <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                  <Share2 className="w-3 h-3 mr-1" /> Share
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="p-4 md:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-5">
                {/* Media Viewer - Photos, Video, 360 Tour */}
                <div className="bg-muted/30 rounded-lg p-3">
                  <Tabs value={mediaTab} onValueChange={(v) => setMediaTab(v as 'photos' | 'video' | 'tour')} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-3">
                      <TabsTrigger value="photos" className="text-xs">
                        <Camera className="w-3 h-3 mr-1" /> Photos
                      </TabsTrigger>
                      <TabsTrigger value="video" disabled={!property.videoUrl} className="text-xs">
                        <Play className="w-3 h-3 mr-1" /> Video
                      </TabsTrigger>
                      <TabsTrigger value="tour" disabled={!property.virtualTourUrl} className="text-xs">
                        <Building2 className="w-3 h-3 mr-1" /> 360° Tour
                      </TabsTrigger>
                    </TabsList>

                    {/* Photos Tab */}
                    <TabsContent value="photos" className="mt-0">
                      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg overflow-hidden">
                        {property.images && property.images.length > 0 ? (
                          <>
                            <img 
                              src={property.images[currentImageIndex]} 
                              alt={`${property.title} - Image ${currentImageIndex + 1}`}
                              className="w-full h-full object-cover"
                            />
                            {/* Featured Badge */}
                            {property.featured && (
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
                                Featured
                              </div>
                            )}
                            {/* Status Watermarks */}
                            {property.status === 'offMarket' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-white text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-70 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  OFF-MARKET
                                </div>
                              </div>
                            )}
                            {property.status === 'reserved' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-yellow-400 text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-85 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  RESERVED
                                </div>
                              </div>
                            )}
                            {property.status === 'sold' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-red-500 text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-85 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  SOLD
                                </div>
                              </div>
                            )}
                            {property.images.length > 1 && (
                              <>
                                <Button 
                                  size="icon" 
                                  variant="secondary" 
                                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80 hover:opacity-100"
                                  onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : property.images!.length - 1)}
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="icon" 
                                  variant="secondary" 
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-80 hover:opacity-100"
                                  onClick={() => setCurrentImageIndex(prev => prev < property.images!.length - 1 ? prev + 1 : 0)}
                                >
                                  <ChevronRight className="w-4 h-4" />
                                </Button>
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                                  {currentImageIndex + 1} / {property.images.length}
                                </div>
                              </>
                            )}
                          </>
                        ) : property.mainImage ? (
                          <>
                            <img 
                              src={property.mainImage} 
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            {/* Featured Badge */}
                            {property.featured && (
                              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg z-10">
                                Featured
                              </div>
                            )}
                            {/* Status Watermarks for mainImage */}
                            {property.status === 'offMarket' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-white text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-70 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  OFF-MARKET
                                </div>
                              </div>
                            )}
                            {property.status === 'reserved' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-yellow-400 text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-85 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  RESERVED
                                </div>
                              </div>
                            )}
                            {property.status === 'sold' && (
                              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-red-500 text-5xl font-bold tracking-[0.3em] transform -rotate-12 opacity-85 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
                                  SOLD
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-20 h-20 text-primary/20" />
                          </div>
                        )}
                      </div>
                      {/* Thumbnails */}
                      {property.images && property.images.length > 1 && (
                        <div className="flex gap-2 mt-2 overflow-x-auto">
                          {property.images.map((img, idx) => (
                            <div 
                              key={idx}
                              className={`w-16 h-12 rounded overflow-hidden flex-shrink-0 cursor-pointer border-2 transition-colors ${
                                currentImageIndex === idx ? 'border-secondary' : 'border-transparent hover:border-muted-foreground/30'
                              }`}
                              onClick={() => setCurrentImageIndex(idx)}
                            >
                              <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>

                    {/* Video Tab */}
                    <TabsContent value="video" className="mt-0">
                      <div className="relative aspect-[16/10] bg-black rounded-lg overflow-hidden">
                        {property.videoUrl ? (
                          property.videoUrl.includes('youtube.com') || property.videoUrl.includes('youtu.be') ? (
                            <iframe
                              className="w-full h-full"
                              src={property.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                              title="Property Video"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : property.videoUrl.includes('vimeo.com') ? (
                            <iframe
                              className="w-full h-full"
                              src={property.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                              title="Property Video"
                              allow="autoplay; fullscreen; picture-in-picture"
                              allowFullScreen
                            />
                          ) : (
                            <video className="w-full h-full" controls>
                              <source src={property.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="text-center">
                              <Play className="w-16 h-16 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No video available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>

                    {/* 360 Virtual Tour Tab */}
                    <TabsContent value="tour" className="mt-0">
                      <div className="relative aspect-[16/10] bg-black rounded-lg overflow-hidden">
                        {property.virtualTourUrl ? (
                          <iframe
                            className="w-full h-full"
                            src={property.virtualTourUrl}
                            title="360° Virtual Tour"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; xr-spatial-tracking"
                            allowFullScreen
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white">
                            <div className="text-center">
                              <Building2 className="w-16 h-16 mx-auto mb-2 opacity-50" />
                              <p className="text-sm">No virtual tour available</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                {/* Property Description */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-base mb-3">Property Description</h3>
                  <div className="text-sm text-muted-foreground space-y-2.5 leading-relaxed">
                    {property.shortDescription && (
                      <p className="font-medium text-foreground">{property.shortDescription}</p>
                    )}
                    {property.longDescription ? (
                      <p className="whitespace-pre-wrap">{property.longDescription}</p>
                    ) : property.description ? (
                      <p className="whitespace-pre-wrap">{property.description}</p>
                    ) : (
                      <p className="italic">No description available for this property.</p>
                    )}
                  </div>
                </div>

                {/* Property Features */}
                {(interiorFeatures || exteriorFeatures) && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-3">Property Features</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Interior Features</h4>
                        {interiorFeatures ? (
                          <ul className="space-y-1.5">
                            {interiorFeatures.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No interior features listed</p>
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-sm text-muted-foreground mb-2">Exterior Features</h4>
                        {exteriorFeatures ? (
                          <ul className="space-y-1.5">
                            {exteriorFeatures.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <Check className="w-3.5 h-3.5 text-secondary flex-shrink-0 mt-0.5" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No exterior features listed</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Property Specifications */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h3 className="font-semibold text-base mb-3">Property Specifications</h3>
                  <div className="space-y-4">
                    {/* Basic Information */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Basic Information</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-muted-foreground">ID:</span> <span className="font-medium">#{property.id}</span></div>
                        <div><span className="text-muted-foreground">Type:</span> <span className="font-medium">{property.propertyType}</span></div>
                        {property.assetClass && <div><span className="text-muted-foreground">Asset Class:</span> <span className="font-medium">{property.assetClass}</span></div>}
                        <div><span className="text-muted-foreground">Region:</span> <span className="font-medium">{property.region}</span></div>
                        <div><span className="text-muted-foreground">Country:</span> <span className="font-medium">{property.country}</span></div>
                        {property.offMarket && <div className="col-span-2"><Badge variant="outline" className="text-xs">Off Market</Badge></div>}
                      </div>
                      {property.address && (
                        <div className="mt-2 text-sm"><span className="text-muted-foreground">Address:</span> <span className="font-medium">{property.address}</span></div>
                      )}
                    </div>

                    {/* Size & Dimensions */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Size & Dimensions</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Land Size (sqm):</span> <span className="font-medium">{property.landSizeSqm ? Number(property.landSizeSqm).toLocaleString('en-US') : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Land Size (ha):</span> <span className="font-medium">{property.landSizeHa ? Number(property.landSizeHa).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Land Price per sqm:</span> <span className="font-medium">{property.landPricePerSqm ? `${property.currency || 'PHP'} ${Number(property.landPricePerSqm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Building Area:</span> <span className="font-medium">{property.buildingAreaSqm ? Number(property.buildingAreaSqm).toLocaleString('en-US') + ' sqm' : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Floor Area:</span> <span className="font-medium">{property.floorAreaSqm ? Number(property.floorAreaSqm).toLocaleString('en-US') + ' sqm' : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Floors:</span> <span className="font-medium">{property.floors ? property.floors.toLocaleString('en-US') : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">FAR:</span> <span className="font-medium">{property.floorAreaRatio ? Number(property.floorAreaRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* Units Information */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Units Information</h4>
                      <div className="space-y-1 text-sm">
                        <div><span className="text-muted-foreground">Total Units:</span> <span className="font-medium">{property.units ? property.units.toLocaleString('en-US') : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Details:</span> <span className="font-medium">{property.unitsDetails || 'N/A'}</span></div>
                      </div>
                    </div>

                    {/* Pricing Information */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Pricing & Investment</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div><span className="text-muted-foreground">Asking Price (Net):</span> <span className="font-medium">{property.askingPriceNet ? `${property.currency || 'USD'} ${Number(property.askingPriceNet).toLocaleString('en-US')}` : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Asking Price (Gross):</span> <span className="font-medium">{property.askingPriceGross ? `${property.currency || 'USD'} ${Number(property.askingPriceGross).toLocaleString('en-US')}` : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Min Price (Display):</span> <span className="font-medium">{property.priceMin ? `${property.currency || 'USD'} ${Number(property.priceMin).toLocaleString('en-US')}` : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Max Price (Display):</span> <span className="font-medium">{property.priceMax ? `${property.currency || 'USD'} ${Number(property.priceMax).toLocaleString('en-US')}` : 'N/A'}</span></div>
                        <div><span className="text-muted-foreground">Currency:</span> <span className="font-medium">{property.currency || 'USD'}</span></div>
                      </div>
                    </div>

                    {/* Amenities */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Amenities</h4>
                      {property.amenities && Array.isArray(property.amenities) && property.amenities.length > 0 ? (
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {property.amenities.map((amenity, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-primary mt-1">•</span>
                              <span>{amenity}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">N/A</p>
                      )}
                    </div>

                    {/* Income Information */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Income Generating</h4>
                      <div className="text-sm">
                        {property.incomeGenerating ? (
                          <>
                            <Badge className="bg-green-600 text-white mb-2">Yes</Badge>
                            <p className="text-muted-foreground italic">Details available after NDA: {property.incomeDetails || 'Contact for details'}</p>
                          </>
                        ) : (
                          <Badge variant="outline" className="text-xs">No</Badge>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                      <h4 className="font-medium text-sm text-muted-foreground mb-2">Additional Information</h4>
                      <p className="text-sm text-muted-foreground">{property.others || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-4">
                {/* Tour Scheduler */}
                <TourScheduler propertyId={property.id} propertyTitle={property.title} />
                
                {/* Property Inquiry Form */}
                <PropertyInquiryForm propertyId={property.id} propertyTitle={property.title} />
                
                {/* Agent Contact Card */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3 pb-3 border-b">
                    {agent.image ? (
                      <img 
                        src={agent.image} 
                        alt={agent.name}
                        className="w-10 h-10 rounded-full object-cover object-top flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-primary">GB</span>
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-sm truncate">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground truncate">{agent.title}</p>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs font-medium">{agent.rating}</span>
                        <span className="text-xs text-muted-foreground">({agent.reviews})</span>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleContactSubmit} className="space-y-2.5">
                    <Input 
                      placeholder="Your Name" 
                      className="h-8 text-sm"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <Input 
                      type="email" 
                      placeholder="Email Address" 
                      className="h-8 text-sm"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                    <Input 
                      type="tel" 
                      placeholder="Phone Number" 
                      className="h-8 text-sm"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                    <Select 
                      value={contactForm.contactMethod}
                      onValueChange={(value) => setContactForm(prev => ({ ...prev, contactMethod: value }))}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Contact Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      </SelectContent>
                    </Select>
                    <Textarea 
                      placeholder="Message (optional)" 
                      rows={2}
                      className="text-sm resize-none"
                      value={contactForm.message}
                      onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                    />
                    <Button type="submit" className="w-full h-8 bg-primary hover:bg-primary/90 text-sm">
                      Request Information
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button type="button" variant="outline" className="h-8 text-xs">
                        <Calendar className="w-3 h-3 mr-1" /> Schedule
                      </Button>
                      <Button type="button" variant="outline" className="h-8 text-xs">
                        <Phone className="w-3 h-3 mr-1" /> Call
                      </Button>
                    </div>
                  </form>
                </div>



              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default PropertyDetailModal;
