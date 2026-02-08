import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Shield, Globe, Building, Award, Lock, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InvestorTypesLinks } from "@/components/InvestorTypesLinks";

export default function UHNWIPage() {
  return (
    <Layout>
      <div className="container py-6">
        <Breadcrumb 
          items={[
            { label: "Investors", href: "/investors" },
            { label: "UHNWI" }
          ]} 
        />
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-secondary/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Ultra High Net Worth Individuals
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Exclusive real estate brokerage services for discerning clients with an interest in premium global properties.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  View Exclusive Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Schedule Private Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why UHNWI Choose 3B Solution</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Tailored brokerage services designed specifically for discerning clients seeking premium real estate opportunities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Exclusive Property Access</h3>
                <p className="text-muted-foreground">
                  Access to exclusive off-market deals and pre-launch opportunities through our extensive network of developers and property owners.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Property Selection</h3>
                <p className="text-muted-foreground">
                  Strategic property sourcing across prime international markets to help you find properties in multiple jurisdictions.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Confidential Transactions</h3>
                <p className="text-muted-foreground">
                  Discreet handling of all transactions with privacy-first approach, secure data management, and confidential deal structures.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-1/10 rounded-lg flex items-center justify-center mb-6">
                  <Building className="w-7 h-7 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Premium Property Opportunities</h3>
                <p className="text-muted-foreground">
                  Curated selection of trophy assets and premium properties in sought-after locations with strong market fundamentals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-2/10 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">White-Glove Service</h3>
                <p className="text-muted-foreground">
                  Dedicated relationship manager, priority access to new listings, and personalized property search assistance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-3/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Exclusive Network Access</h3>
                <p className="text-muted-foreground">
                  Connect with our client community, co-ownership opportunities, and private events with industry leaders.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Client Profile */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">UHNWI Client Profile</h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Substantial Property Experience</h3>
                      <p className="text-muted-foreground">
                        Experience with significant property transactions and management of a global property portfolio.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Client Onboarding</h3>
                      <p className="text-muted-foreground">
                        Standard client registration and identity verification as per real estate brokerage regulations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Long-Term Property Goals</h3>
                      <p className="text-muted-foreground">
                        Interest in long-term property ownership for potential capital appreciation and personal use.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Global Property Interests</h3>
                      <p className="text-muted-foreground">
                        Interest in acquiring properties in multiple international locations for geographic diversification of assets.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-2">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Explore Exclusive Opportunities?</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Schedule a confidential consultation with our specialists to discuss your property objectives.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                    Schedule Consultation
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="lg" variant="outline">
                    Browse Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cross-linking to other investor types */}
      <InvestorTypesLinks currentType="uhnwi" />
    </Layout>
  );
}
