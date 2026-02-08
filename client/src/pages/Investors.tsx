import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { SEO } from "@/components/SEO";
import { ArrowRight, Users, Building2, Globe, CheckCircle2, Shield, TrendingUp } from "lucide-react";

export default function Investors() {
  return (
    <Layout>
      <SEO 
        title="Client Onboarding | UHNWI & Institutional Investors | 3B Solution"
        description="Exclusive real estate opportunities for Ultra High Net Worth Individuals, institutional investors, and family offices. Minimum $100K. 15-30% target returns."
        keywords="UHNWI real estate services, institutional real estate clients, family office real estate, qualified client opportunities, luxury hotel services, qualified clients"
        canonical="https://www.3bsolution.com/investors"
      />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 backdrop-blur-sm border-2 border-secondary/40 rounded-full mb-6">
              <span className="text-primary font-semibold">🏆 Exclusive Property Opportunities</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              Client Onboarding
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8">
              3B Solution partners with qualified clients to access premium hospitality and commercial real estate opportunities across global markets
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button size="lg" variant="outline">
                  View Property Opportunities
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Types Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Who We Work With</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We serve four categories of qualified clients
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* UHNWI */}
            <Link href="/investors/uhnwi">
              <Card className="border-2 border-primary/20 hover:border-primary/40 transition-all cursor-pointer">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">UHNWI</h3>
                <p className="text-center text-muted-foreground mb-6">Ultra High Net Worth Individuals</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Net Worth: $30M+</p>
                      <p className="text-sm text-muted-foreground">Liquid assets of $5M+ preferred</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Qualified Client Status</p>
                      <p className="text-sm text-muted-foreground">SEC or equivalent certification</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Budget Range</p>
                      <p className="text-sm text-muted-foreground">$100K - $50M per opportunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Holding Period</p>
                      <p className="text-sm text-muted-foreground">5-7 years typical hold period</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>

            {/* Institutional Clients */}
            <Link href="/investors/institutional">
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 transition-all cursor-pointer">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-secondary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Institutional</h3>
                <p className="text-center text-muted-foreground mb-6">Pension Funds, Insurance, Endowments</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">AUM: $50M+</p>
                      <p className="text-sm text-muted-foreground">Institutional-grade due diligence</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Investment Committee</p>
                      <p className="text-sm text-muted-foreground">Formal approval process</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Budget Range</p>
                      <p className="text-sm text-muted-foreground">$5M - $200M per opportunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Reporting Requirements</p>
                      <p className="text-sm text-muted-foreground">Quarterly + audited annuals</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>

            {/* Family Offices */}
            <Link href="/investors/family-offices">
              <Card className="border-2 border-accent/20 hover:border-accent/40 transition-all cursor-pointer">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-accent/10 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Family Offices</h3>
                <p className="text-center text-muted-foreground mb-6">Multi-generational Wealth Management</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Family Wealth: $100M+</p>
                      <p className="text-sm text-muted-foreground">Single or multi-family office</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Legacy Planning</p>
                      <p className="text-sm text-muted-foreground">Generational wealth transfer</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Budget Range</p>
                      <p className="text-sm text-muted-foreground">$1M - $100M per opportunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Exclusive Deal Flow</p>
                      <p className="text-sm text-muted-foreground">Off-market opportunities</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>

            {/* Individual & First-Time Buyers */}
            <Link href="/investors/individual">
              <Card className="border-2 border-chart-2/20 hover:border-chart-2/40 transition-all cursor-pointer">
              <CardContent className="p-8">
                <div className="w-16 h-16 mx-auto mb-6 bg-chart-2/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-8 h-8 text-chart-2" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-4 text-center">Individual & First-Time Buyers</h3>
                <p className="text-center text-muted-foreground mb-6">Building wealth through real estate</p>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Investment Capacity: $100K+</p>
                      <p className="text-sm text-muted-foreground">Entry-level qualified clients</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Portfolio Diversification</p>
                      <p className="text-sm text-muted-foreground">Real estate allocation strategy</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Budget Range</p>
                      <p className="text-sm text-muted-foreground">$100K - $5M per opportunity</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-chart-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-semibold">Expert Guidance & Support</p>
                      <p className="text-sm text-muted-foreground">Dedicated service advisory</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Transaction Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Transaction Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our structured approach ensures alignment and transparency
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Initial Consultation</h3>
                <p className="text-muted-foreground">Discuss investment objectives, risk tolerance, and portfolio allocation goals</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-secondary">2</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Client Registration</h3>
                <p className="text-muted-foreground">Complete client verification and KYC/AML compliance</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-accent">3</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Deal Review</h3>
                <p className="text-muted-foreground">Access property memorandums, pro formas, and due diligence materials</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-chart-1">4</span>
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Investment</h3>
                <p className="text-muted-foreground">Execute subscription agreements and fund capital for selected opportunities</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Investor Benefits</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Why qualified clients choose 3B Solution
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Shield className="w-12 h-12 mb-4 text-primary" />
                <h3 className="text-lg font-bold text-foreground mb-2">Institutional-Grade Due Diligence</h3>
                <p className="text-muted-foreground">Third-party valuations, legal review, environmental assessments, and market analysis on every deal</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <TrendingUp className="w-12 h-12 mb-4 text-secondary" />
                <h3 className="text-lg font-bold text-foreground mb-2">Proven Performance</h3>
                <p className="text-muted-foreground">15-30% historical annual returns across 70+ projects with 95% client satisfaction rate</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Globe className="w-12 h-12 mb-4 text-accent" />
                <h3 className="text-lg font-bold text-foreground mb-2">Global Diversification</h3>
                <p className="text-muted-foreground">Access to opportunities across Southeast Asia, Maldives, Europe, USA, and Caribbean</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Building2 className="w-12 h-12 mb-4 text-chart-1" />
                <h3 className="text-lg font-bold text-foreground mb-2">Luxury Hospitality Focus</h3>
                <p className="text-muted-foreground">Specialized in 5-star hotels and ultra-luxury resorts with strong operator partnerships</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <Users className="w-12 h-12 mb-4 text-chart-2" />
                <h3 className="text-lg font-bold text-foreground mb-2">Dedicated Support</h3>
                <p className="text-muted-foreground">Personal relationship manager and quarterly performance reviews for all clients</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <CheckCircle2 className="w-12 h-12 mb-4 text-chart-3" />
                <h3 className="text-lg font-bold text-foreground mb-2">Transparent Reporting</h3>
                <p className="text-muted-foreground">Quarterly performance reports and annual audited financials with full transparency</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-white/90 mb-8">
              Schedule a confidential consultation to discuss your investment objectives and review current opportunities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                  Schedule Consultation
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/properties">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  View Properties
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
