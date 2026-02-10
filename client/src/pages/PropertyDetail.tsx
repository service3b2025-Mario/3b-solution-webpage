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

export default function PropertyDetail({ params }: { params?: { slug?: string } }) {
  const { slug: paramSlug } = useParams<{ slug?: string }>();
  const slug = params?.slug || paramSlug || "";
  
  const { data: property, isLoading } = trpc.properties.getBySlug.useQuery(slug, {
    enabled: !!slug
  });

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
        open={showLoginModal} 
        onOpenChange={setShowLoginModal} 
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

                  <TabsContent value="photos" className="m-0">
                    <div className="relative aspect-video bg-black group">
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
                                onClick={() => setCurrentImageIndex(prev => prev === 0 ? property.images!.length - 1 : prev - 1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronLeft className="w-6 h-6" />
                              </button>
                              <button 
                                onClick={() => setCurrentImageIndex(prev => prev === property.images!.length - 1 ? 0 : prev + 1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <ChevronRight className="w-6 h-6" />
                              </button>
                            </>
                          )}

                          {/* Image Counter */}
                          <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded">
                            {currentImageIndex + 1} / {property.images.length}
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                          <Camera className="w-12 h-12 opacity-20" />
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="video" className="m-0">
                    <div className="aspect-video bg-black">
                      {property.videoUrl && (
                        <iframe 
                          src={property.videoUrl} 
                          className="w-full h-full" 
                          allowFullScreen
                        />
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="tour" className="m-0">
                    <div className="aspect-video bg-black">
                      {property.virtualTourUrl && (
                        <iframe 
                          src={property.virtualTourUrl} 
                          className="w-full h-full" 
                          allowFullScreen
                        />
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Description */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">About this property</h2>
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p>{property.description}</p>
                  {property.longDescription && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="whitespace-pre-line">{property.longDescription}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Interior Features */}
                {interiorFeatures && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Interior Features
                    </h3>
                    <ul className="space-y-2">
                      {interiorFeatures.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Exterior Features */}
                {exteriorFeatures && (
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Check className="w-4 h-4 text-primary" /> Exterior Features
                    </h3>
                    <ul className="space-y-2">
                      {exteriorFeatures.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Property Details Grid */}
              <div className="bg-muted/30 rounded-xl p-6">
                <h3 className="font-semibold mb-4">Property Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                  
                  {/* Price */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Price</p>
                    <p className="font-medium">
                      {property.price ? (
                        new Intl.NumberFormat('en-US', { style: 'currency', currency: property.currency || 'USD', maximumFractionDigits: 0 }).format(property.price)
                      ) : (
                        <span className="text-muted-foreground italic">Price on Request</span>
                      )}
                    </p>
                  </div>

                  {/* Property Type */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Property Type</p>
                    <p className="font-medium">{property.propertyType}</p>
                  </div>

                  {/* Status */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{property.status?.replace(/([A-Z])/g, ' $1').trim()}</p>
                  </div>

                  {/* Bedrooms */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bedrooms</p>
                    <p className="font-medium">{property.bedrooms || 'N/A'}</p>
                  </div>

                  {/* Bathrooms */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Bathrooms</p>
                    <p className="font-medium">{property.bathrooms || 'N/A'}</p>
                  </div>

                  {/* Area */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Living Area</p>
                    <p className="font-medium">{property.area ? `${property.area} m²` : 'N/A'}</p>
                  </div>

                  {/* Lot Size */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Lot Size</p>
                    <p className="font-medium">{property.lotSize || 'N/A'}</p>
                  </div>

                  {/* Year Built */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Year Built</p>
                    <p className="font-medium">{property.yearBuilt || 'N/A'}</p>
                  </div>

                  {/* Amenities */}
                  <div className="col-span-2 md:col-span-3">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-1">Amenities</p>
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
