import { useEffect } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { MapPin, Building2, Calendar, TrendingUp, ArrowLeft, Phone, Mail, ChevronRight, Check } from "lucide-react";
import InvestmentCalculator from "@/components/InvestmentCalculator";

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
      <section className="py-8">
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
                {/* Add overlay for 'CONCEPT' if needed, similar to the target image */}
                {/* This part might require more complex logic based on property data */}
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
                  <Button variant="outline" size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg></Button>
                  <Button variant="outline" size="icon"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-share-2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.59 13.51 6.83 4.83"/><path d="m15.41 6.49-6.83 4.83"/></svg></Button>
                </div>
              </div>

              {/* Description */}
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

              {/* Features */}
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

              {/* Amenities */}


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

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Schedule Virtual Tour */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Schedule Virtual Tour</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to book a personalized virtual tour with our investment team.
                  </p>
                  <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12">
                    Sign In to Schedule Tour
                  </Button>
                </CardContent>
              </Card>

              {/* Request Information Form */}
              <Card className="border-0 shadow-lg sticky top-28 lg:top-32">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Request Information</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interested in this property? Fill out the form below and our team will get in touch with you.
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <input type="text" placeholder="First Name" className="p-2 border rounded" />
                    <input type="text" placeholder="Last Name" className="p-2 border rounded" />
                  </div>
                  <input type="email" placeholder="Email" className="w-full p-2 border rounded mb-4" />
                  <input type="tel" placeholder="Phone Number" className="w-full p-2 border rounded mb-4" />
                  <select className="w-full p-2 border rounded mb-4">
                    <option>Select Investor Type</option>
                  </select>
                  <select className="w-full p-2 border rounded mb-4">
                    <option>Select Investment Range</option>
                  </select>
                  <textarea placeholder="Message" rows={4} className="w-full p-2 border rounded mb-4"></textarea>
                  <Button className="w-full bg-secondary hover:bg-secondary/90 text-white h-12">Submit Inquiry</Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    By submitting this form, you agree to be contacted by 3B Solution regarding this property and other investment opportunities.
                  </p>
                </CardContent>
              </Card>

              {/* Contact Expert */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Contact Expert</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <img src="/placeholder-avatar.jpg" alt="Expert Avatar" className="w-12 h-12 rounded-full object-cover" />
                    <div>
                      <p className="font-semibold">Georg Blanschek</p>
                      <p className="text-sm text-muted-foreground">CEO & Founder - Real Estate Expert</p>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star w-4 h-4 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        <span>4.9 (127 )</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <input type="text" placeholder="Your Name" className="w-full p-2 border rounded" />
                    <input type="email" placeholder="Email Address" className="w-full p-2 border rounded" />
                    <input type="tel" placeholder="Phone Number" className="w-full p-2 border rounded" />
                    <select className="w-full p-2 border rounded">
                      <option>Contact Method</option>
                    </select>
                    <textarea placeholder="Message (optional)" rows={3} className="w-full p-2 border rounded"></textarea>
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12">Request Information</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties && similarProperties.items.length > 0 && (
        <section className="py-8">
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
        </section>
      )}
    </Layout>
  );
}
