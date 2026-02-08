import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Users, Shield, Building, FileText, Globe, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InvestorTypesLinks } from "@/components/InvestorTypesLinks";

export default function FamilyOfficesPage() {
  return (
    <Layout>
      <div className="container py-6">
        <Breadcrumb 
          items={[
            { label: "Investors", href: "/investors" },
            { label: "Family Offices" }
          ]} 
        />
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-accent/10 via-background to-primary/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-10 h-10 text-accent" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Family Offices
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Tailored real estate brokerage services for family offices with focus on legacy properties and exclusive property access.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  Explore Properties
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Schedule Family Office Consultation
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Family Office Real Estate Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Bespoke real estate brokerage services tailored to multi-generational property ownership and family governance structures.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <Users className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Multi-Generational Planning</h3>
                <p className="text-muted-foreground">
                  Property sourcing that considers family structures, succession planning, and long-term ownership goals across generations.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Legacy Property Selection</h3>
                <p className="text-muted-foreground">
                  Focus on quality properties in stable markets suitable for long-term family ownership and potential generational transfer.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <Building className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Exclusive Property Access</h3>
                <p className="text-muted-foreground">
                  Priority access to off-market properties, co-ownership opportunities with other family offices, and exclusive listings.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-1/10 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Customized Documentation</h3>
                <p className="text-muted-foreground">
                  Tailored property reports, detailed documentation, and information aligned with family office requirements.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-2/10 rounded-lg flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Global Property Access</h3>
                <p className="text-muted-foreground">
                  International property sourcing across stable jurisdictions with consideration for residency and lifestyle opportunities.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-accent transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-3/10 rounded-lg flex items-center justify-center mb-6">
                  <Briefcase className="w-7 h-7 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Concierge Service</h3>
                <p className="text-muted-foreground">
                  Dedicated family office liaison, property management coordination, and lifestyle services for family members across properties.
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
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Family Office Client Profile</h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Substantial Property Portfolio</h3>
                      <p className="text-muted-foreground">
                        Established family offices with experience managing significant property holdings and formal governance structures.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Legacy Planning Focus</h3>
                      <p className="text-muted-foreground">
                        Long-term property ownership goals spanning multiple generations with emphasis on quality and stability.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Exclusive Property Interest</h3>
                      <p className="text-muted-foreground">
                        Interest in off-market opportunities, co-ownership with other family offices, and exclusive property access.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-accent font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Governance and Documentation</h3>
                      <p className="text-muted-foreground">
                        Established family governance framework with property committee oversight and customized reporting needs.
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
          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-2">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Build Your Family's Real Estate Legacy</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Connect with our family office specialists to discuss your property goals and exclusive opportunities.
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
                    View Exclusive Properties
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cross-linking to other investor types */}
      <InvestorTypesLinks currentType="family" />
    </Layout>
  );
}
