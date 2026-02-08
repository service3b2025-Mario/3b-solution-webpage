import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Bookmark, Trash2, Search, Bell, BellOff, Edit, Eye, MapPin, Building2, DollarSign, Bed } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { VisitorLoginModal } from "@/components/VisitorLoginModal";

export default function MySavedSearches() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  const { data: savedSearches, isLoading, refetch } = trpc.savedSearches.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const deleteSavedSearch = trpc.savedSearches.delete.useMutation({
    onSuccess: () => {
      toast.success("Search deleted successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to delete search");
    },
  });

  const toggleNotifications = trpc.savedSearches.toggleNotifications.useMutation({
    onSuccess: (_, variables) => {
      toast.success(variables.enabled ? "Notifications enabled" : "Notifications disabled");
      refetch();
    },
    onError: () => {
      toast.error("Failed to update notifications");
    },
  });

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this saved search?")) {
      deleteSavedSearch.mutate(id);
    }
  };

  const handleToggleNotifications = (id: number, currentValue: boolean, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleNotifications.mutate({ id, enabled: !currentValue });
  };

  const handleViewResults = (filters: any) => {
    // Build query string from filters
    const params = new URLSearchParams();
    if (filters.region && filters.region !== 'all') params.set('region', filters.region);
    if (filters.country && filters.country !== 'all') params.set('country', filters.country);
    if (filters.propertyType && filters.propertyType !== 'all') params.set('type', filters.propertyType);
    if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
    
    setLocation(`/properties?${params.toString()}`);
  };

  const formatFilterSummary = (filters: any) => {
    const parts: string[] = [];
    
    if (filters.region && filters.region !== 'all') {
      parts.push(filters.region);
    }
    if (filters.country && filters.country !== 'all') {
      parts.push(filters.country);
    }
    if (filters.propertyType && filters.propertyType !== 'all') {
      parts.push(filters.propertyType);
    }
    if (filters.minPrice || filters.maxPrice) {
      const min = filters.minPrice ? `$${parseInt(filters.minPrice).toLocaleString()}` : '0';
      const max = filters.maxPrice ? `$${parseInt(filters.maxPrice).toLocaleString()}` : '∞';
      parts.push(`${min} - ${max}`);
    }
    if (filters.bedrooms) {
      parts.push(`${filters.bedrooms}+ beds`);
    }
    if (filters.amenities && filters.amenities.length > 0) {
      parts.push(`${filters.amenities.length} amenities`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : 'All properties';
  };

  if (!user) {
    return (
      <Layout>
        <SEO 
          title="My Saved Searches | 3B Solution"
          description="Manage your saved property searches"
        />
        <div className="container py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Bookmark className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Sign In to View Your Saved Searches</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Save your property search criteria and get notified when new matching properties are listed.
            </p>
            <Button size="lg" onClick={() => setShowLoginModal(true)}>
              <Bookmark className="w-5 h-5 mr-2" />
              Sign In with Email
            </Button>
          </div>
        </div>

        <VisitorLoginModal
          open={showLoginModal}
          onOpenChange={setShowLoginModal}
          triggerContext="saved-search"
        />
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="My Saved Searches | 3B Solution"
        description="Manage your saved property searches"
      />
      
      {/* Header */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Saved Searches</h1>
              <p className="text-lg text-muted-foreground">
                {savedSearches?.length || 0} saved {savedSearches?.length === 1 ? 'search' : 'searches'}
              </p>
            </div>
            <Bookmark className="w-12 h-12 text-primary" />
          </div>
        </div>
      </section>

      {/* Saved Searches Content */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <div className="animate-pulse p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : savedSearches && savedSearches.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedSearches.map((search: any) => (
                <Card key={search.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{search.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {formatFilterSummary(search.filters)}
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(search.id, e)}
                        className="text-muted-foreground hover:text-red-600 transition-colors"
                        title="Delete search"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Filter Details */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {search.filters.region && search.filters.region !== 'all' && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{search.filters.region}</span>
                        </div>
                      )}
                      {search.filters.propertyType && search.filters.propertyType !== 'all' && (
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-muted-foreground" />
                          <span>{search.filters.propertyType}</span>
                        </div>
                      )}
                      {(search.filters.minPrice || search.filters.maxPrice) && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {search.filters.minPrice ? `$${parseInt(search.filters.minPrice).toLocaleString()}` : '0'} - 
                            {search.filters.maxPrice ? ` $${parseInt(search.filters.maxPrice).toLocaleString()}` : ' ∞'}
                          </span>
                        </div>
                      )}
                      {search.filters.bedrooms && (
                        <div className="flex items-center gap-2">
                          <Bed className="w-4 h-4 text-muted-foreground" />
                          <span>{search.filters.bedrooms}+ bedrooms</span>
                        </div>
                      )}
                    </div>

                    {/* Notifications Toggle */}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="flex items-center gap-2">
                        {search.notificationsEnabled ? (
                          <Bell className="w-4 h-4 text-primary" />
                        ) : (
                          <BellOff className="w-4 h-4 text-muted-foreground" />
                        )}
                        <Label htmlFor={`notifications-${search.id}`} className="text-sm cursor-pointer">
                          Email notifications
                        </Label>
                      </div>
                      <Switch
                        id={`notifications-${search.id}`}
                        checked={search.notificationsEnabled}
                        onCheckedChange={(checked) => 
                          toggleNotifications.mutate({ id: search.id, enabled: checked })
                        }
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        className="flex-1"
                        onClick={() => handleViewResults(search.filters)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created on {new Date(search.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Bookmark className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-4">No Saved Searches Yet</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Save your property search criteria to get notified when new matching properties become available.
              </p>
              <Link href="/properties">
                <Button size="lg">
                  <Search className="w-5 h-5 mr-2" />
                  Start Searching
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
