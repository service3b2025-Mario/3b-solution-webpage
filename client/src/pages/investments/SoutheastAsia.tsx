import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { ArrowRight, TrendingUp, MapPin, Building2, Users, DollarSign, Globe } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function SoutheastAsia() {
  // Fetch Philippines property count
  const { data: philippineProperties } = trpc.properties.list.useQuery({
    region: "Philippines",
    limit: 1,
  });
  return (
    <Layout>
      <SEO 
        title="Southeast Asia Real Estate Investment | 5-Star Hotels & Resorts | 3B Solution"
        description="Invest in premium hospitality real estate across Southeast Asia. Focus on Philippines with 21+ projects. 15-30% returns. UHNWI and institutional investors."
        keywords="Southeast Asia real estate investment, Philippines hotel investment, Thailand resort investment, Vietnam property investment, ASEAN hospitality real estate, luxury hotel Southeast Asia"
        canonical="https://www.3bsolution.com/investments/southeast-asia"
        ogImage="https://www.3bsolution.com/hero-background.jpg"
      />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 backdrop-blur-sm border-2 border-secondary/40 rounded-full mb-6">
              <MapPin className="w-5 h-5 text-secondary" />
              <span className="text-primary font-semibold">Southeast Asia Investment Hub</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Philippines Hospitality Real Estate
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              Access premium 5-star hotel and resort investments across the fastest-growing tourism market in Asia. Featuring {philippineProperties?.total || 21}+ Philippine projects with proven 15-30% annual returns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/properties?region=SouthEastAsia">
                <Button size="lg" variant="outline">
                  View Available Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why the Philippines in Southeast Asia?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The region offers unparalleled growth potential for hospitality real estate investors
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-primary mb-2">6.5%</div>
                <div className="text-sm text-muted-foreground">Average GDP Growth</div>
                <p className="text-xs text-muted-foreground mt-2">Fastest-growing region globally</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-secondary mb-2">130M+</div>
                <div className="text-sm text-muted-foreground">Annual Tourist Arrivals</div>
                <p className="text-xs text-muted-foreground mt-2">Pre-pandemic levels exceeded</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-accent mb-2">680M</div>
                <div className="text-sm text-muted-foreground">Population</div>
                <p className="text-xs text-muted-foreground mt-2">Rising middle class demand</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-bold text-chart-1 mb-2">$3.6T</div>
                <div className="text-sm text-muted-foreground">Combined GDP</div>
                <p className="text-xs text-muted-foreground mt-2">7th largest economy globally</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground mb-2">Tourism Boom</h3>
                <p className="text-muted-foreground">International arrivals growing 12% annually. China, Korea, Japan driving demand for luxury accommodations.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Building2 className="w-12 h-12 mb-4 text-secondary" />
                <h3 className="text-lg font-bold text-foreground mb-2">Supply Constraints</h3>
                <p className="text-muted-foreground">Limited 5-star inventory in secondary cities. High barriers to entry create scarcity value.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <DollarSign className="w-12 h-12 mb-4 text-accent" />
                <h3 className="text-lg font-bold text-foreground mb-2">Favorable Economics</h3>
                <p className="text-muted-foreground">Lower construction costs, strong USD positioning, and attractive cap rates of 8-12%.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 mb-4 text-chart-1" />
                <h3 className="text-lg font-bold text-foreground mb-2">Government Support</h3>
                <p className="text-muted-foreground">Pro-tourism policies, infrastructure investment, and foreign investment incentives.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mb-4 text-chart-2" />
                <h3 className="text-lg font-bold text-foreground mb-2">Operator Demand</h3>
                <p className="text-muted-foreground">Marriott, Hilton, Accor actively seeking management contracts in the region.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <MapPin className="w-12 h-12 mb-4 text-chart-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Strategic Location</h3>
                <p className="text-muted-foreground">Gateway between East and West. Major air hubs connecting global markets.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Markets */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Focus Market</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Strategic concentration in Southeast Asia's highest-growth hospitality market
            </p>
          </div>
          
          {/* Centered Philippines Card */}
          <div className="flex justify-center">
            <Card className="border-4 border-primary/30 hover:border-primary/50 transition-all shadow-2xl hover:shadow-3xl max-w-2xl w-full">
              <CardContent className="p-12">
                <div className="flex items-center justify-center gap-4 mb-8">
                  <MapPin className="w-12 h-12 text-primary" />
                  <h3 className="text-4xl font-bold text-primary">Philippines</h3>
                </div>
                
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-primary mb-3">{philippineProperties?.total || 21}+ Projects</div>
                  <div className="text-lg text-muted-foreground font-semibold">Philippines-focused hospitality portfolio</div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary mb-2">7.5%</div>
                    <div className="text-sm text-muted-foreground">GDP Growth Rate</div>
                  </div>
                  <div className="bg-primary/5 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary mb-2">8.9M</div>
                    <div className="text-sm text-muted-foreground">Tourist Arrivals</div>
                  </div>
                </div>
                
                <div className="space-y-4 text-base">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-foreground"><span className="font-semibold">Luxury Resort Destinations:</span> Boracay, Palawan, Cebu</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-foreground"><span className="font-semibold">Premium City Hotels:</span> Manila, Bonifacio Global City</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-foreground"><span className="font-semibold">Mixed-Use Developments:</span> Clark, Subic Bay</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-foreground"><span className="font-semibold">Market Advantages:</span> English-speaking, US-aligned, stable regulations</p>
                  </div>
                </div>
                
                <div className="mt-8 pt-8 border-t border-primary/20 text-center">
                  <Link href="/properties?location=Philippines">
                    <Button size="lg" className="bg-primary hover:bg-primary/90 text-white">
                      View Philippines Properties
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Opportunities */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Process Support for International Capital</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We help transform online interest into real transactions
            </p>
          </div>
          
          {/* Support Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Clear Cross-Border Communication</h3>
                    <p className="text-sm text-muted-foreground">Bridge language and cultural gaps with investors and buyers worldwide</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Practical ROI & IRR Modeling</h3>
                    <p className="text-sm text-muted-foreground">Financial analysis based on actual project data and market conditions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Structured Due Diligence</h3>
                    <p className="text-sm text-muted-foreground">Organized coordination of all required materials and documentation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-chart-1/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-chart-1" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Local Approvals Guidance</h3>
                    <p className="text-sm text-muted-foreground">Navigate regulatory requirements and stakeholder relationships</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-chart-2/10 flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-chart-2" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-2">Continuous Follow-Up</h3>
                    <p className="text-sm text-muted-foreground">Ongoing support after lead submission until deal completion</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-primary/30 bg-primary/5 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-2">Ideal For</h3>
                    <p className="text-sm text-foreground">Family offices, funds, and international clients who need a reliable local connector</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Investor Funnels */}
          <div className="bg-muted/30 rounded-2xl p-8 md:p-12">
            <h3 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">Our Primary Investor Funnels</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h4 className="font-bold text-foreground">Project Discovery</h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>Project teaser</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>NDA signing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>Full details</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-primary" />
                    <span>Inquiry submission</span>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-secondary text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h4 className="font-bold text-foreground">Property Inquiry</h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-secondary" />
                    <span>Property listing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-secondary" />
                    <span>Information request</span>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center font-bold text-sm">3</div>
                  <h4 className="font-bold text-foreground">Direct Contact</h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-accent" />
                    <span>Direct contact</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-accent" />
                    <span>Meeting setup</span>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-chart-1 text-white flex items-center justify-center font-bold text-sm">4</div>
                  <h4 className="font-bold text-foreground">Portfolio Review</h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-chart-1" />
                    <span>Portfolio overview</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-chart-1" />
                    <span>Developer introduction</span>
                  </div>
                </div>
              </div>

              <div className="bg-background rounded-lg p-6 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-chart-2 text-white flex items-center justify-center font-bold text-sm">5</div>
                  <h4 className="font-bold text-foreground">Resources Path</h4>
                </div>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-chart-2" />
                    <span>Resources download</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-chart-2" />
                    <span>Return to deal flow</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Invest in the Philippines?</h2>
            <p className="text-xl text-white/90 mb-8">
              Schedule a consultation to review current opportunities and receive our latest market report
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/investors">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Investor Qualification
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
