import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { MapPin, Building2, Calendar, TrendingUp, ArrowLeft, Phone, Mail, ChevronRight, Check } from "lucide-react";
import InvestmentCalculator from "@/components/InvestmentCalculator";
import { BookingSelector } from "@/components/BookingSelector";

export default function PropertyDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: property, isLoading } = trpc.properties.getBySlug.useQuery(slug || "");
  const { data: similarProperties } = trpc.properties.list.useQuery({ 
    region: property?.region, 
    limit: 3 
  }, { enabled: !!property });
  
  const incrementViews = trpc.properties.incrementViews.useMutation();

  useEffect(() => {
    if (property?.id) {
      incrementViews.mutate(property.id);
    }
  }, [property?.id]);

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

  const features = property.features as string[] || [];
  const amenities = property.amenities as string[] || [];

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="bg-muted/50 py-4">
        <div className="container">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <Link href="/properties" className="text-muted-foreground hover:text-foreground">Properties</Link>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
            <span className="text-foreground">{property.title}</span>
          </div>
        </div>
      </div>

      {/* Property Header */}
      <section className="py-8 pb-32">
        <div className="container">
          <Link href="/properties" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="w-4 h-4" />
            Back to Properties
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8 xl:space-y-12">
              {/* Main Image / Gallery */}
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-lg">
                {property.mainImage ? (
                  <img src={property.mainImage} alt={property.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Building2 className="w-24 h-24 text-primary/30" />
                  </div>
                )}
                {property.mainImage && (
                  <div className="absolute inset-0 flex items-center justify-center text-white text-5xl font-bold opacity-70">
                    CONCEPT
                  </div>
                )}
              </div>

              {/* Title & Location */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge variant="secondary">{property.propertyType}</Badge>
                    <Badge variant="outline">{property.status}</Badge>
                    {property.featured && <Badge className="bg-secondary">Featured</Badge>}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">{property.title}</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-5 h-5" />
                    <span>{property.city}, {property.country} • {property.region}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></Button>
                  <Button variant="outline" size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 4.83"/><path d="m15.41 6.49-6.83 4.83"/></svg></Button>
                </div>
              </div>

              {/* Property Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Property Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {property.description || property.shortDescription}
                  </p>
                  {property.additionalInformation && (
                    <p className="text-muted-foreground leading-relaxed border-t pt-4 mt-4">
                      {property.additionalInformation}
                    </p>
                   )}
                </CardContent>
              </Card>

              {/* Property Features */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Property Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-semibold mb-2">Interior Features</h5>
                      {features.length > 0 ? (
                        <ul className="space-y-2">
                          {features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-muted-foreground">
                              <Check className="w-4 h-4 text-primary" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No interior features listed</p>
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold mb-2">Exterior Features</h5>
                      {amenities.length > 0 ? (
                        <ul className="space-y-2">
                          {amenities.map((amenity, index) => (
                            <li key={index} className="flex items-center gap-2 text-muted-foreground">
                              <Check className="w-4 h-4 text-primary" />
                              {amenity}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-muted-foreground">No exterior features listed</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Investment Calculator */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Investment Projection</CardTitle>
                </CardHeader>
                <CardContent>
                  <InvestmentCalculator />
                </CardContent>
              </Card>

              {/* Property Specifications */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Property Specifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Basic Information</p>
                      <p><span className="font-semibold">ID:</span> {property.id}</p>
                      <p><span className="font-semibold">Region:</span> {property.region}</p>
                      <p><span className="font-semibold">Type:</span> {property.propertyType}</p>
                      <p><span className="font-semibold">Country:</span> {property.country}</p>
                      <p><span className="font-semibold">Asset Class:</span> {property.assetClass || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Size & Dimensions</p>
                      <p><span className="font-semibold">Land Size (sqm):</span> {property.landSizeSqm || 'N/A'}</p>
                      <p><span className="font-semibold">Land Size (ha):</span> {property.landSizeHa || 'N/A'}</p>
                      <p><span className="font-semibold">Building Area (sqm):</span> {property.buildingAreaSqm || 'N/A'}</p>
                      <p><span className="font-semibold">Floor Area (sqm):</span> {property.floorAreaSqm || 'N/A'}</p>
                      <p><span className="font-semibold">Floors:</span> {property.floors || 'N/A'}</p>
                      <p><span className="font-semibold">FAR:</span> {property.floorAreaRatio || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Units Information</p>
                      <p><span className="font-semibold">Total Units:</span> {property.units || 'N/A'}</p>
                      <p><span className="font-semibold">Units Details:</span> {property.unitsDetails || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Pricing & Investment</p>
                      <p><span className="font-semibold">Asking Price (Net):</span> ${Number(property.askingPriceNet || 0).toLocaleString()}</p>
                      <p><span className="font-semibold">Asking Price (Gross):</span> ${Number(property.askingPriceGross || 0).toLocaleString()}</p>
                      <p><span className="font-semibold">Min Price:</span> ${Number(property.priceMin || 0).toLocaleString()}</p>
                      <p><span className="font-semibold">Max Price:</span> ${Number(property.priceMax || 0).toLocaleString()}</p>
                      <p><span className="font-semibold">Currency:</span> {property.currency || 'N/A'}</p>
                      <p><span className="font-semibold">ROI:</span> {property.roiPercent || 'N/A'}%</p>
                      <p><span className="font-semibold">Expected Return:</span> {property.expectedReturn || 'N/A'}%</p>
                      <p><span className="font-semibold">Investment Timeline:</span> {property.investmentTimeline || 'N/A'}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Income Generating</p>
                      <p>{property.incomeGenerating ? 'Yes' : 'No'}</p>
                      {property.incomeGenerating && (
                        <p><span className="font-semibold">Income Details:</span> {property.incomeDetails || 'N/A'}</p>
                      )}
                    </div>
                    {property.additionalFinancialInfo && (
                      <div>
                        <p className="text-muted-foreground">Additional Financial Information</p>
                        <p>{property.additionalFinancialInfo}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Booking Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Schedule a Consultation</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Interested in this property? Connect with our team.
                    </p>
                  </CardHeader>
                  <CardContent>
                    <BookingSelector />
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties && similarProperties.items.length > 0 && (
        <section className="py-8">
          <div className="container">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.items.filter(p => p.id !== property.id).slice(0, 3).map((p) => (
                <Link key={p.id} href={`/properties/${p.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      {p.mainImage ? (
                        <img src={p.mainImage} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-primary/30" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        {p.city}, {p.country}
                      </div>
                      <h3 className="font-semibold group-hover:text-primary transition-colors">{p.title}</h3>
                      <div className="mt-4 flex justify-between">
                        <span className="font-bold text-primary">${Number(p.priceMin || 0).toLocaleString()}</span>
                        <span className="font-bold text-secondary">{p.expectedReturn}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </Layout>
  );
}
