import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight, Building2, TrendingUp, MapPin, DollarSign, Users, Shield } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InvestmentsPhilippines() {
  // Fetch Philippine properties
  const { data: properties, isLoading } = trpc.properties.list.useQuery({
    region: "Philippines",
    limit: 6,
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 bg-gradient-to-br from-primary via-primary/90 to-secondary overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920')] bg-cover bg-center opacity-10" />
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Philippines Real Estate Investment
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-white/90">
              Discover premium hospitality and mixed-use opportunities in Southeast Asia's fastest-growing economy
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/properties?region=Philippines">
                <Button size="lg" variant="secondary" className="text-lg">
                  View All Properties <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-primary">
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
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Invest in the Philippines?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Strategic location, robust economic growth, and exceptional tourism potential make the Philippines an ideal destination for real estate investment
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <TrendingUp className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Strong Economic Growth</h3>
                <p className="text-muted-foreground">
                  GDP growth averaging 6-7% annually, driven by robust domestic consumption, BPO sector expansion, and infrastructure development
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <Users className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Tourism Boom</h3>
                <p className="text-muted-foreground">
                  Pre-pandemic tourist arrivals exceeded 8 million annually, with government targeting 12 million by 2028 through infrastructure and marketing initiatives
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <MapPin className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Strategic Location</h3>
                <p className="text-muted-foreground">
                  Gateway to Southeast Asia with excellent connectivity to major Asian markets, positioned in the world's fastest-growing economic region
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <DollarSign className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Attractive Returns</h3>
                <p className="text-muted-foreground">
                  Hospitality assets delivering 15-30% ROI, with strong rental yields in Metro Manila CBD and resort destinations like Palawan and Siargao
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <Building2 className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Infrastructure Development</h3>
                <p className="text-muted-foreground">
                  $180B infrastructure program (Build Build Build) improving connectivity, with new airports, expressways, and railway systems enhancing property values
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-lg transition-all">
              <CardContent className="p-8">
                <Shield className="w-12 h-12 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3">Foreign Investment Friendly</h3>
                <p className="text-muted-foreground">
                  Condominium ownership up to 40% foreign equity, long-term leases available, and streamlined processes for international investors
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Investment Areas */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Key Investment Areas</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From Metro Manila's business districts to world-class island resorts
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-primary">Metro Manila</h3>
                <p className="text-muted-foreground mb-4">
                  Prime CBD locations in Makati, BGC, and Ortigas offering mixed-use, hospitality, and office assets with immediate income generation and strong capital appreciation potential
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Makati CBD - Financial district with premium office and hotel demand</li>
                  <li>• Bonifacio Global City - Modern mixed-use hub attracting multinational corporations</li>
                  <li>• Ortigas Center - Established business district with infrastructure upgrades</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-primary">Palawan</h3>
                <p className="text-muted-foreground mb-4">
                  World-renowned island destination offering beachfront resorts, private islands, and eco-tourism developments with exceptional growth potential driven by international tourism
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• El Nido - Limestone cliffs and pristine beaches attracting luxury travelers</li>
                  <li>• Coron - Diving destination with untapped resort development potential</li>
                  <li>• Puerto Princesa - Gateway city with expanding airport connectivity</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-primary">Siargao</h3>
                <p className="text-muted-foreground mb-4">
                  Emerging surf capital of the Philippines with boutique hotels, beachfront land, and lifestyle developments catering to adventure travelers and digital nomads
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Cloud 9 - World-class surf break with premium beachfront demand</li>
                  <li>• General Luna - Tourism hub with boutique hotel opportunities</li>
                  <li>• Dapa - Airport gateway with development land availability</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 hover:shadow-xl transition-all">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-3 text-primary">Greater Manila Region</h3>
                <p className="text-muted-foreground mb-4">
                  Large-scale development land in Bulacan, Rizal, and Cavite benefiting from infrastructure expansion, offering master-planned residential and mixed-use opportunities
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Bulacan - New international airport driving land values</li>
                  <li>• Antipolo - Leisure and lifestyle corridor east of Metro Manila</li>
                  <li>• Cavite - Industrial and residential growth south of Manila</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Properties */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Philippine Properties</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Explore our curated selection of {properties?.total || 21}+ premium investment opportunities
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
                                    <Link key={property.id} href={`/properties?region=Philippines`}>
                    <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-2 h-full">
                      <div className="h-56 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden">
                        {property.mainImage ? (
                          <img 
                            src={property.mainImage} 
                            alt={property.title}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-16 h-16 text-primary/30" />
                          </div>
                        )}
                        {property.featured && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Featured
                          </div>
                        )}
                        {property.offMarket && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <div className="text-white text-3xl font-bold tracking-widest transform -rotate-12">
                              OFF-MARKET
                            </div>
                          </div>
                        )}
                        <div className="absolute top-4 right-4 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                          {property.propertyType}
                        </div>
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-2 text-sm text-muted-foreground mb-2">
                          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          <span>{property.city}, {property.country}</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                          {property.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {property.shortDescription || property.description}
                        </p>
                        {property.expectedReturn && (
                          <div className="flex items-center gap-2 text-primary font-semibold">
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
                <Link href="/properties?region=Philippines">
                  <Button size="lg" className="text-lg">
                    View All {properties?.total || 21} Philippine Properties <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Invest in the Philippines?
            </h2>
            <p className="text-xl mb-8 text-white/90">
              Our team of local experts will guide you through every step of your Philippine real estate investment journey
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contact">
                <Button size="lg" variant="secondary" className="text-lg">
                  Schedule Consultation <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/properties?region=Philippines">
                <Button size="lg" variant="outline" className="text-lg border-white text-white hover:bg-white hover:text-primary">
                  Browse Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
