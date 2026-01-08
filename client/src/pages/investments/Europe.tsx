import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Building2, TrendingUp, MapPin } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InvestmentsEurope() {
  const { data: properties, isLoading } = trpc.properties.list.useQuery({
    region: "Europe",
    limit: 6,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-[#2B7A8B] via-[#2B7A8B]/90 to-[#1e5563] overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=1920')] bg-cover bg-center opacity-15" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              European Real Estate Investment
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Premium hospitality and mixed-use opportunities across Europe's most dynamic markets
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties?region=Europe">
                <Button size="lg" variant="secondary" className="text-lg">
                  View All Properties <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-[#2B7A8B]">
                  Schedule Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">10+ European Projects</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Curated selection of hospitality and mixed-use assets across key European markets
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">10+</div>
                <div className="text-lg font-semibold mb-2">Projects</div>
                <p className="text-sm text-muted-foreground">
                  Hospitality & Mixed-Use assets across strategic European locations
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">15-25%</div>
                <div className="text-lg font-semibold mb-2">Expected ROI</div>
                <p className="text-sm text-muted-foreground">
                  Strong returns driven by tourism recovery and operational optimization
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8 text-center">
                <div className="text-4xl font-bold text-primary mb-2">€5M-€50M</div>
                <div className="text-lg font-semibold mb-2">Investment Range</div>
                <p className="text-sm text-muted-foreground">
                  Diverse ticket sizes accommodating various investment strategies
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured European Properties</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our European portfolio of premium investment opportunities
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-56 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {(properties?.items || []).slice(0, 6).map((property) => (
                  <Link key={property.id} href={`/properties`}>
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 h-full">
                      <div className="h-56 bg-gradient-to-br from-[#2B7A8B]/20 to-[#1e5563]/20 relative overflow-hidden">
                        {property.mainImage ? (
                          <img 
                            src={property.mainImage} 
                            alt={property.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-[#2B7A8B]/30" />
                          </div>
                        )}
                        {property.featured && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Featured
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-[#2B7A8B] text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {property.propertyType}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{property.city}, {property.country}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-[#2B7A8B] transition-colors line-clamp-2">
                          {property.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {property.shortDescription || property.description}
                        </p>
                        {property.expectedReturn && (
                          <div className="flex items-center gap-2 text-[#2B7A8B] font-semibold">
                            <TrendingUp className="w-4 h-4" />
                            <span>{property.expectedReturn}% Expected Return</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              <div className="text-center mt-12">
                <Link href="/properties?region=Europe">
                  <Button size="lg" style={{ backgroundColor: '#2B7A8B' }} className="text-lg text-white hover:opacity-90">
                    View All European Properties <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 text-white" style={{ backgroundColor: '#2B7A8B' }}>
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Invest in Europe?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Connect with our European investment team to explore opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="text-lg">
                  Schedule Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
