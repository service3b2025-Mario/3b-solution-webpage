import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, BarChart3, FileText, Shield, Clock, TrendingUp, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { InvestorTypesLinks } from "@/components/InvestorTypesLinks";

export default function InstitutionalPage() {
  return (
    <Layout>
      <div className="container py-6">
        <Breadcrumb 
          items={[
            { label: "Investors", href: "/investors" },
            { label: "Institutional" }
          ]} 
        />
      </div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-secondary/10 via-background to-accent/10 py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Landmark className="w-10 h-10 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Institutional Clients
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Strategic real estate solutions for pension funds, insurance companies, and endowments managing $50M+ AUM with long-term investment horizons.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/properties">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  View Portfolio Opportunities
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline">
                  Request Property Memorandum
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
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Institutional-Grade Real Estate Services</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Comprehensive real estate investment services designed for institutional fiduciary standards and compliance requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-secondary/10 rounded-lg flex items-center justify-center mb-6">
                  <BarChart3 className="w-7 h-7 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Risk-Adjusted Returns</h3>
                <p className="text-muted-foreground">
                  Sophisticated portfolio construction with quantitative risk modeling, stress testing, and scenario analysis for optimal Sharpe ratios.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Long-Term Horizon Alignment</h3>
                <p className="text-muted-foreground">
                  Investment strategies matching 10-30 year liability profiles with stable cash flows and inflation-hedging characteristics.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Comprehensive Due Diligence</h3>
                <p className="text-muted-foreground">
                  Institutional-grade research, legal review, environmental assessments, and third-party valuations for every transaction.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-1/10 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="w-7 h-7 text-chart-1" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Regulatory Compliance</h3>
                <p className="text-muted-foreground">
                  Full compliance with ERISA, SEC, and international regulatory frameworks including ESG reporting and fiduciary standards.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-2/10 rounded-lg flex items-center justify-center mb-6">
                  <TrendingUp className="w-7 h-7 text-chart-2" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Portfolio Diversification</h3>
                <p className="text-muted-foreground">
                  Strategic allocation across property types, geographies, and risk profiles to optimize portfolio-level returns and reduce correlation.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-secondary transition-colors">
              <CardContent className="p-8">
                <div className="w-14 h-14 bg-chart-3/10 rounded-lg flex items-center justify-center mb-6">
                  <Landmark className="w-7 h-7 text-chart-3" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Institutional Infrastructure</h3>
                <p className="text-muted-foreground">
                  Dedicated institutional services team, quarterly reporting, client portals, and seamless integration with custodians.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Investment Criteria */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Institutional Client Criteria</h2>
            <Card>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-semibold">1</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Minimum AUM: $50M+</h3>
                      <p className="text-muted-foreground">
                        Pension funds, insurance companies, endowments, or sovereign wealth funds with substantial assets under management.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-semibold">2</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Fiduciary Standards Compliance</h3>
                      <p className="text-muted-foreground">
                        Adherence to institutional investment policies, board approval processes, and regulatory oversight requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-semibold">3</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Long-Term Investment Horizon</h3>
                      <p className="text-muted-foreground">
                        10+ year holding periods aligned with liability matching and strategic asset allocation frameworks.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-secondary font-semibold">4</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-2">ESG and Impact Considerations</h3>
                      <p className="text-muted-foreground">
                        Commitment to environmental, social, and governance criteria with measurable sustainability metrics and reporting.
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
          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-2">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Partner with 3B Solution</h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Request a detailed property memorandum and schedule a meeting with our institutional real estate team.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                    Request Property Memorandum
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link href="/properties">
                  <Button size="lg" variant="outline">
                    View Portfolio
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Cross-linking to other investor types */}
      <InvestorTypesLinks currentType="institutional" />
    </Layout>
  );
}
