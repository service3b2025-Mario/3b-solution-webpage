import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Building2, MapPin, Heart, Trash2, Eye, TrendingUp } from "lucide-react";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { VisitorLoginModal } from "@/components/VisitorLoginModal";

export default function MyWishlist() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { data: wishlistItems, isLoading } = trpc.wishlist.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const removeFromWishlist = trpc.wishlist.remove.useMutation({
    onSuccess: (_data, propertyId) => {
      toast.success("Property removed from wishlist");
      // Invalidate both list and check queries so all components update immediately
      utils.wishlist.list.invalidate();
      utils.wishlist.check.invalidate(propertyId);
    },
    onError: () => {
      toast.error("Failed to remove property");
    },
  });

  const handleRemove = (propertyId: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    removeFromWishlist.mutate(propertyId);
  };

  const handlePropertyClick = (property: any) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  if (!user) {
    return (
      <Layout>
        <SEO 
          title="My Wishlist | 3B Solution"
          description="View and manage your saved properties"
        />
        <div className="container py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Heart className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Sign In to View Your Wishlist</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Save your favorite properties and access them anytime. No password needed — just verify your email.
            </p>
            <Button size="lg" onClick={() => setShowLoginModal(true)}>
              <Heart className="w-5 h-5 mr-2" />
              Sign In with Email
            </Button>
          </div>
        </div>

        <VisitorLoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          triggerContext="wishlist"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="My Wishlist | 3B Solution"
        description="View and manage your saved properties"
      />
      
      {/* Header */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Wishlist</h1>
              <p className="text-lg text-muted-foreground">
                {wishlistItems?.length || 0} saved {wishlistItems?.length === 1 ? 'property' : 'properties'}
              </p>
            </div>
            <Heart className="w-12 h-12 text-primary" />
          </div>
        </div>
      </section>

      {/* Wishlist Content */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="animate-pulse">
                    <div className="h-48 bg-muted"></div>
                    <CardContent className="p-6">
                      <div className="h-6 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded mb-2"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : wishlistItems && wishlistItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistItems.map((item: any) => {
                const property = item.property;
                return (
                  <Card 
                    key={item.id} 
                    className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => handlePropertyClick(property)}
                  >
                    {/* Property Image */}
                    <div className="relative h-48 overflow-hidden">
                      {property.mainImage ? (
                        <img 
                          src={property.mainImage} 
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-muted-foreground" />
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={(e) => handleRemove(property.id, e)}
                        className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg hover:bg-red-50 hover:text-red-600 transition-colors z-10"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>

                      {/* Status Badge */}
                      {property.status === 'available' && (
                        <div className="absolute top-3 left-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Available
                        </div>
                      )}
                      {property.featured && (
                        <div className="absolute bottom-3 left-3 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          Featured
                        </div>
                      )}
                    </div>

                    {/* Property Details */}
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-2 line-clamp-1">
                        {property.title}
                      </h3>
                      
                      <div className="flex items-center text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="text-sm">{property.city}, {property.country}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Investment Range</p>
                          <p className="text-lg font-bold text-primary">
                            ${parseInt(property.priceMin || '0').toLocaleString()} - ${parseInt(property.priceMax || '0').toLocaleString()}
                          </p>
                        </div>
                        {property.expectedReturn && (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Returns</p>
                            <div className="flex items-center text-green-600 font-semibold">
                              <TrendingUp className="w-4 h-4 mr-1" />
                              {property.expectedReturn}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePropertyClick(property);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>

                      <p className="text-xs text-muted-foreground mt-3">
                        Saved on {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Heart className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-4">Your Wishlist is Empty</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Start exploring our premium properties and save your favorites for easy access later.
              </p>
              <Link href="/properties">
                <Button size="lg">
                  Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Property Detail Modal */}
      {selectedProperty && (
        <PropertyDetailModal 
          property={selectedProperty}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedProperty(null);
          }}
        />
      )}
    </Layout>
  );
}
