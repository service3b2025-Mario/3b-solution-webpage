import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { VisitorLoginModal } from "@/components/VisitorLoginModal";
import { 
  MapPin, Heart, Share2, Play, Camera, Check, 
  TrendingUp, Building2, ChevronLeft, ChevronRight,
  ArrowLeft
} from "lucide-react";
import { BookingSelector } from "@/components/BookingSelector";

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, isLoading } = trpc.properties.getBySlug.useQuery(slug || "");
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [mediaTab, setMediaTab] = useState<'photos' | 'video' | 'tour'>('photos');
  const [showLoginModal, setShowLoginModal] = useState(false);

  const incrementViews = trpc.properties.incrementViews.useMutation();

  useEffect(() => {
    if (property?.id) {
      incrementViews.mutate(property.id);
    }
  }, [property?.id]);

  // Check if property is in wishlist (server-side)
  const { data: isSaved } = trpc.wishlist.check.useQuery(property?.id ?? 0, {
    enabled: !!user && !!property,
  });

  // Add to wishlist mutation
  const addMutation = trpc.wishlist.add.useMutation({
    onSuccess: () => {
      if (property) {
        utils.wishlist.check.invalidate(property.id);
        utils.wishlist.list.invalidate();
      }
      toast.success('Property saved to your wishlist!');
    },
    onError: (error) => {
      if (error.message?.includes('Already in wishlist')) {
        toast.info('This property is already in your wishlist');
      } else {
        toast.error(error.message || 'Failed to save property');
      }
    },
  });

  // Remove from wishlist mutation
  const removeMutation = trpc.wishlist.remove.useMutation({
    onSuccess: () => {
      if (property) {
        utils.wishlist.check.invalidate(property.id);
        utils.wishlist.list.invalidate();
      }
      toast.success('Property removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove property');
    },
  });

  // Handle Save property
  const handleSave = () => {
    if (!property) return;
    
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    
    if (isSaved) {
      removeMutation.mutate(property.id);
    } else {
      addMutation.mutate(property.id);
    }
  };

  // Handle Share property
  const handleShare = async () => {
    if (!property) return;
    
    const shareUrl = window.location.href;
    const shareData = {
      title: property.title,
      text: `Check out this property: ${property.title} in ${property.location}`,
      url: shareUrl
    };

    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      try {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } catch (err) {
        copyToClipboard(shareUrl);
      }
    } else {
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('Link copied to clipboard!');
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 bg-muted rounded w-1/2" />
            <div className="h-4 bg-muted rounded w-3/4" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <Link href="/properties">
            <Button>Back to Properties</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const interiorFeatures = property.interiorFeatures && Array.isArray(property.interiorFeatures) && property.interiorFeatures.length > 0 
    ? property.interiorFeatures 
    : null;

  const exteriorFeatures = property.exteriorFeatures && Array.isArray(property.exteriorFeatures) && property.exteriorFeatures.length > 0 
    ? property.exteriorFeatures 
    : null;

  return (
    <Layout>
      <VisitorLoginModal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)} 
      />
      
      {/* Breadcrumb */}
      <div className="bg-muted/30 border-b">
        <div className="container py-3">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href="/properties" className="text-muted-foreground hover:text-foreground">Properties</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-md">{property.title}</span>
          </div>
        </div>
      </div>

      <div className="bg-background min-h-screen pb-20">
        {/* Header Section */}
        <div className="sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b px-4 md:px-6 py-4">
          <div className="container">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
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
                <h1 className="text-xl md:text-2xl font-bold leading-tight">{property.title}</h1>
                <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
                  <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{property.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant={isSaved ? "default" : "outline"} 
                  size="sm" 
                  className={`h-9 text-xs px-3 ${isSaved ? 'bg-red-500 hover:bg-red-600 text-white' : ''}`}
                  onClick={handleSave}
                >
                  <Heart className={`w-3.5 h-3.5 mr-1.5 ${isSaved ? 'fill-current' : ''}`} /> {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 text-xs px-3"
                  onClick={handleShare}
                >
                  <Share2 className="w-3.5 h-3.5 mr-1.5" /> Share
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Media & Details */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Media Section */}
              <div className="bg-muted/30 rounded-xl overflow-hidden border">
                <Tabs value={mediaTab} onValueChange={(v) => setMediaTab(v as any)} className="w-full">
                  <div className="border-b bg-background px-4">
                    <TabsList className="h-12 w-full justify-start bg-transparent p-0 gap-6">
                      <TabsTrigger 
                        value="photos" 
                        className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0"
                      >
                        <Camera className="w-4 h-4 mr-2" /> Photos
                      </TabsTrigger>
                      <TabsTrigger 
                        value="video" 
                        className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0"
                        disabled={!property.videoUrl}
                      >
                        <Play className="w-4 h-4 mr-2" /> Video
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tour" 
                        className="h-12 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0"
                        disabled={!property.virtualTourUrl}
                      >
                        <Building2 className="w-4 h-4 mr-2" /> 360° Tour
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="aspect-video bg-black relative group">
                    <TabsContent value="photos" className="m-0 h-full">
                      {property.images && property.images.length > 0 ? (
                        <>
                          <img 
                            src={property.images[currentImageIndex]} 
                            alt={`Property view ${currentImageIndex + 1}`}
                            className="w-full h-full object-contain"
                          />
                          
                          {/* Navigation Arrows */}
                          {property.images.length > 1 && (
                            <>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => prev === 0 ? (property.images?.length || 1) - 1 : prev - 1);
                                }}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCurrentImageIndex(prev => prev === (property.images?.length || 1) - 1 ? 0 : prev + 1);
                                }}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-md">
                            {currentImageIndex + 1} / {property.images.length}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/50">
                          <Building2 className="w-16 h-16 mb-2 opacity-50" />
                          <p>No images available</p>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="video" className="m-0 h-full flex items-center justify-center">
                      {property.videoUrl ? (
                        <iframe 
                          src={property.videoUrl.replace('watch?v=', 'embed/')} 
                          className="w-full h-full" 
                          allowFullScreen
                          title="Property Video"
                        />
                      ) : (
                        <div className="text-white/50">No video available</div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="tour" className="m-0 h-full flex items-center justify-center">
                      {property.virtualTourUrl ? (
                        <iframe 
                          src={property.virtualTourUrl} 
                          className="w-full h-full" 
                          allowFullScreen
                          title="Virtual Tour"
                        />
                      ) : (
                        <div className="text-white/50">No virtual tour available</div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Property Description */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Description</h3>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="font-medium text-foreground mb-2">
                    {property.shortDescription}
                  </p>
                  <p className="whitespace-pre-line">
                    {property.description}
                  </p>
                  {property.additionalInformation && (
                    <div className="mt-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold text-foreground mb-2">Additional Information</h4>
                      <p>{property.additionalInformation}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features */}
              {(interiorFeatures || exteriorFeatures) && (
                <div className="space-y-4 pt-6 border-t">
                  <h3 className="text-lg font-semibold">Property Features</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {interiorFeatures && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Interior Features</h4>
                        <ul className="space-y-2">
                          {interiorFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {exteriorFeatures && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Exterior Features</h4>
                        <ul className="space-y-2">
                          {exteriorFeatures.map((feature, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Specifications */}
              <div className="space-y-4 pt-6 border-t">
                <h3 className="text-lg font-semibold">Property Specifications</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                  
                  {/* Basic Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">ID:</span>
                      <span className="font-medium">#{property.id}</span>
                      
                      <span className="text-muted-foreground">Region:</span>
                      <span className="font-medium">{property.region || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Type:</span>
                      <span className="font-medium">{property.propertyType}</span>
                      
                      <span className="text-muted-foreground">Country:</span>
                      <span className="font-medium">{property.country}</span>
                      
                      <span className="text-muted-foreground">Asset Class:</span>
                      <span className="font-medium">{property.assetClass || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Size & Dimensions */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Size & Dimensions</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Land Size (sqm):</span>
                      <span className="font-medium">{property.landSizeSqm || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Land Size (ha):</span>
                      <span className="font-medium">{property.landSizeHa || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Land Price per sqm:</span>
                      <span className="font-medium">{property.landPricePerSqm || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Building Area:</span>
                      <span className="font-medium">{property.buildingAreaSqm || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Floor Area:</span>
                      <span className="font-medium">{property.floorAreaSqm || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Floors:</span>
                      <span className="font-medium">{property.floors || 'N/A'}</span>
                      
                      <span className="text-muted-foreground">FAR:</span>
                      <span className="font-medium">{property.floorAreaRatio || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Units Info */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Units Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total Units:</span>
                        <span className="font-medium">{property.units || 'N/A'}</span>
                      </div>
                      {property.unitsDetails && (
                        <div className="text-xs text-muted-foreground mt-1">
                          <span className="font-medium text-foreground">Details:</span> {property.unitsDetails}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Pricing & Investment</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-muted-foreground">Asking Price (Net):</span>
                      <span className="font-medium">{property.askingPriceNet ? `$${Number(property.askingPriceNet).toLocaleString()}` : 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Asking Price (Gross):</span>
                      <span className="font-medium">{property.askingPriceGross ? `$${Number(property.askingPriceGross).toLocaleString()}` : 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Min Price (Display):</span>
                      <span className="font-medium">{property.priceMin ? `$${Number(property.priceMin).toLocaleString()}` : 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Max Price (Display):</span>
                      <span className="font-medium">{property.priceMax ? `$${Number(property.priceMax).toLocaleString()}` : 'N/A'}</span>
                      
                      <span className="text-muted-foreground">Currency:</span>
                      <span className="font-medium">{property.currency || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Amenities</h4>
                    <div className="text-sm">
                      {property.amenities && property.amenities.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {property.amenities.map((amenity, i) => (
                            <span key={i} className="inline-block bg-muted px-2 py-0.5 rounded text-xs">
                              {amenity}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </div>
                  </div>

                  {/* Income Generating */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">Income Generating</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        {property.incomeGenerating ? (
                          <Badge className="bg-green-600 hover:bg-green-700">Yes</Badge>
                        ) : (
                          <Badge variant="outline">No</Badge>
                        )}
                      </div>
                      {property.incomeDetails && (
                        <p className="text-xs text-muted-foreground italic">
                          {property.incomeDetails}
                        </p>
                      )}
                    </div>
                  </div>

                </div>
              </div>

              {/* Additional Info Footer */}
              <div className="bg-muted/30 p-4 rounded-lg text-xs text-muted-foreground leading-relaxed">
                <h4 className="font-semibold mb-1">Additional Information</h4>
                <p>
                  This hospitality asset is offered strictly off-market. While the city of Dresden and the general hotel profile are disclosed for high-level orientation, all sensitive details, including exact address, full branding agreements, and financial documentation remain confidential. The asset is suitable for family offices, institutional investors, or hotel operators seeking a stable, income-generating city hotel in Germany with defensive characteristics and selective upside potential. Further information is available exclusively upon execution of a non-disclosure agreement.
                </p>
              </div>

            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              <div className="sticky top-24">
                <BookingSelector propertyTitle={property.title} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
