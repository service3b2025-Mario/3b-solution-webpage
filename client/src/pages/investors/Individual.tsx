import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, GraduationCap, Users, Shield, Home, Award, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InvestorTypesLinks } from "@/components/InvestorTypesLinks";

export default function IndividualPage() {
  return (
    <Layout>
      <div className="container py-6">
        <Breadcrumb 
          items={[
            { label: "Investors", href: "/investors" },
            { label: "Individual" }
          ]} 
        />
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-chart-1/10 via-background to-chart-2/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-chart-1/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-10 h-10 text-chart-1" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Individual & First-Time Investors
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Building wealth through real estate with $100K+ investment capacity, expert guidance, and portfolio diversification strategies.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  Start Your Investment Journey
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Get Expert Guidance
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose 3B Solution</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive support and education for individual investors building wealth through premium real estate.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-1/10 rounded-lg flex items-center justify-center mb-6">
                  <GraduationCap className="w-7 h-7 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Expert Guidance & Education</h3>
                <p className="text-muted-foreground">
                  Comprehensive investor education, market insights, and personalized guidance from experienced real estate professionals throughout your journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Portfolio Diversification</h3>
                <p className="text-muted-foreground">
                  Strategic property selection across asset classes and locations to build a balanced portfolio optimized for your risk tolerance and goals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lower Entry Barriers</h3>
                <p className="text-muted-foreground">
                  Accessible investment opportunities starting from $100K with flexible financing options and co-investment structures available.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <Home className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Turnkey Solutions</h3>
                <p className="text-muted-foreground">
                  End-to-end support including property selection, due diligence, financing assistance, and ongoing property management services.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-2/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Community & Networking</h3>
                <p className="text-muted-foreground">
                  Join a community of like-minded investors, attend educational workshops, and access networking events with industry experts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-3/10 rounded-lg flex items-center justify-center mb-6">
                  <Award className="w-7 h-7 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Transparent Process</h3>
                <p className="text-muted-foreground">
                  Clear fee structures, detailed investment analysis, and regular performance reporting with no hidden costs or surprises.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Journey */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Your Investment Journey</h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-chart-1 font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Initial Consultation</h3>
                      <p className="text-muted-foreground">
                        Meet with our investment advisors to discuss your financial goals, risk tolerance, and investment timeline. We'll assess your readiness and create a personalized strategy.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-chart-1 font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Property Selection & Due Diligence</h3>
                      <p className="text-muted-foreground">
                        Review curated property options matching your criteria. Our team conducts comprehensive due diligence including market analysis, legal review, and financial modeling.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-chart-1 font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Financing & Acquisition</h3>
                      <p className="text-muted-foreground">
                        Access our network of preferred lenders for competitive financing. We guide you through the acquisition process, negotiation, and closing procedures.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-chart-1 font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ongoing Support & Growth</h3>
                      <p className="text-muted-foreground">
                        Receive ongoing property management support, quarterly performance reports, and strategic advice as you grow your real estate portfolio.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Criteria */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Getting Started</h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Minimum Investment: $100K+</h3>
                      <p className="text-muted-foreground">
                        Available capital or financing capacity to invest in premium real estate opportunities.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Long-Term Perspective</h3>
                      <p className="text-muted-foreground">
                        5-10 year investment horizon for optimal wealth building and capital appreciation.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Open to Learning</h3>
                      <p className="text-muted-foreground">
                        Willingness to learn about real estate investing, market dynamics, and portfolio management strategies.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Diversification Goals</h3>
                      <p className="text-muted-foreground">
                        Interest in adding real estate to your investment portfolio for diversification and inflation protection.
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
      <section className="py-20 bg-muted/30">
        <div className="container">
          <Card className="bg-gradient-to-br from-chart-1/10 to-chart-2/10 border-2">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Building Your Real Estate Portfolio Today</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Schedule a complimentary consultation to discuss your investment goals and explore available opportunities.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                    Schedule Free Consultation
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
      <InvestorTypesLinks currentType="individual" />
    </Layout>
  );
}
