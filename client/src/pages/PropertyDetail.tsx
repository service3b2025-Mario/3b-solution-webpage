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
            <div className="lg:col-span-2 space-y-8">
              {/* Gallery */}
              {property.mainImage ? (
                <img src={property.mainImage} alt={property.title} className="w-full h-full object-cover rounded-xl" />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                  <Building2 className="w-24 h-24 text-primary/30" />
                </div>
              )}

              {/* Title & Location */}
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-4">
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

              {/* Description */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Property Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description || property.shortDescription}
                  </p>
                </CardContent>
              </Card>

              {/* Features */}
              {features.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Key Features</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-secondary/10 rounded-lg flex items-center justify-center">
                            <Check className="w-4 h-4 text-secondary" />
                          </div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Amenities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {amenities.map((amenity, index) => (
                        <Badge key={index} variant="outline" className="px-4 py-2">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

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
                      <p className="text-muted-foreground">Amenities</p>
                      <p>{amenities.length > 0 ? amenities.join(', ') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Income Generating</p>
                      <p>{property.incomeGenerating ? 'Yes' : 'No'}</p>
                      {property.incomeGenerating && <p><span className="font-semibold">Income Details:</span> {property.incomeDetails || 'N/A'}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Schedule Virtual Tour */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Schedule Virtual Tour</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign in to book a personalized virtual tour with our investment team.
                  </p>
                  <Link href="/schedule-tour">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-white h-12">
                      Sign In to Schedule Tour
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Request Information Form */}
              <Card className="border-0 shadow-lg sticky top-28">
                <CardContent className="p-6">
                  <h4 className="font-semibold mb-4">Request Information</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Interested in this property? Fill out the form below and our team will get in touch with you.
                  </p>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="sr-only">First Name</label>
                        <input type="text" id="firstName" placeholder="First Name" className="w-full p-2 border rounded-md" />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="sr-only">Last Name</label>
                        <input type="text" id="lastName" placeholder="Last Name" className="w-full p-2 border rounded-md" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="sr-only">Email</label>
                      <input type="email" id="email" placeholder="john@example.com" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="phone" className="sr-only">Phone Number</label>
                      <input type="tel" id="phone" placeholder="+1 (555) 123-4567" className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                      <label htmlFor="investorType" className="sr-only">Investor Type</label>
                      <select id="investorType" className="w-full p-2 border rounded-md">
                        <option>Select Investor Type</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="investmentRange" className="sr-only">Investment Range</label>
                      <select id="investmentRange" className="w-full p-2 border rounded-md">
                        <option>Select Investment Range</option>
                      </select>
                    </div>
                    <div>
                      <label htmlFor="message" className="sr-only">Message</label>
                      <textarea id="message" placeholder="Tell us about your investment goals and timeline..." rows={3} className="w-full p-2 border rounded-md"></textarea>
                    </div>
                    <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90 text-white h-12">
                      Submit Inquiry
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      By submitting this form, you agree to be contacted by 3B Solution regarding this property and other investment opportunities.
                    </p>
                  </form>

                  <div className="mt-6 pt-6 border-t border-border">
                    <h4 className="font-semibold mb-4">Contact Expert</h4>
                    <div className="flex items-center gap-3 mb-4">
                      <img src="/path/to/georg-blancheck.jpg" alt="Georg Blancheck" className="w-10 h-10 rounded-full" />
                      <div>
                        <p className="font-semibold">Georg Blancheck</p>
                        <p className="text-sm text-muted-foreground">CEO & Founder - Real Estate Expert</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <a href="tel:+63123456789" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                        <Phone className="w-4 h-4" />
                        <span>+63 123 456 789</span>
                      </a>
                      <a href="mailto:invest@3bsolution.com" className="flex items-center gap-3 text-muted-foreground hover:text-foreground">
                        <Mail className="w-4 h-4" />
                        <span>invest@3bsolution.com</span>
                      </a>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Properties */}
      {similarProperties && similarProperties.items.length > 1 && (
        <section className="py-16 bg-muted/30">
          <div className="container">
            <h2 className="text-2xl font-bold mb-8">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {similarProperties.items.filter(p => p.id !== property.id).slice(0, 3).map((p) => (
                <Link key={p.id} href={`/properties/${p.slug}`}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                    <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-primary/30" />
                      </div>
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
