import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, GraduationCap, Users, Shield, Building, Award, ArrowRight } from "lucide-react";
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
              <Home className="w-10 h-10 text-chart-1" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Individual & First-Time Buyers
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Your partner in property ownership with expert guidance, curated property selection, and end-to-end support for your real estate journey.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  Start Your Property Journey
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
              Comprehensive support and education for individual buyers seeking premium real estate opportunities.
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
                  Comprehensive buyer education, market insights, and personalized guidance from experienced real estate professionals throughout your journey.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Building className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Property Selection</h3>
                <p className="text-muted-foreground">
                  Strategic property selection across different types and locations to help you find properties that match your goals and preferences.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-chart-1 transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Accessible Entry Points</h3>
                <p className="text-muted-foreground">
                  Property opportunities at various price points with flexible financing options and co-ownership structures available.
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
                  End-to-end support including property selection, due diligence coordination, financing assistance, and property management referrals.
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
                  Join a community of like-minded buyers, attend educational workshops, and access networking events with industry experts.
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
                  Clear fee structures, detailed property information, and regular updates with no hidden costs or surprises.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Property Journey */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Your Property Journey</h2>
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
                        Meet with our property advisors to discuss your property goals and timeline. We'll understand your preferences and create a personalized search strategy.
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
                        Review curated property options matching your criteria. Our team coordinates comprehensive due diligence including market analysis and legal review.
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
                        Access our network of preferred lenders for financing options. We guide you through the acquisition process, negotiation, and closing procedures.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-chart-1/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-chart-1 font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ongoing Support</h3>
                      <p className="text-muted-foreground">
                        Receive ongoing property management referrals, market updates, and support as you continue your real estate journey.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Getting Started */}
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
                      <h3 className="text-lg font-semibold mb-2">Acquisition Capacity</h3>
                      <p className="text-muted-foreground">
                        Available capital or financing capacity to acquire premium real estate properties.
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
                        Interest in long-term property ownership for personal use, rental income, or potential appreciation.
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
                        Willingness to learn about real estate markets, property dynamics, and ownership considerations.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-semibold">✓</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Property Ownership Goals</h3>
                      <p className="text-muted-foreground">
                        Interest in adding real estate to your assets for personal use, rental income, or geographic diversification.
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Your Property Journey Today</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Schedule a complimentary consultation to discuss your property goals and explore available opportunities.
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
      <InvestorTypesLinks currentType="individual" />
    </Layout>
  );
}
