import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Building2, Users, Globe, Shield, BarChart3, Briefcase, Target, Check, ArrowRight, Landmark } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";

const iconMap: Record<string, any> = {
  TrendingUp, Building2, Users, Globe, Shield, BarChart3, Briefcase, Target
};

export default function Services() {
  const { data: services } = trpc.services.list.useQuery();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Services" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Our Services
            </h1>
            <p className="text-xl text-white/80">
              Comprehensive investment solutions designed to optimize your real estate portfolio performance
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(services || []).map((service, index) => {
              const IconComponent = iconMap[service.icon || "TrendingUp"] || TrendingUp;
              const features = service.features as string[] || [];
              
              return (
                <Card id={`service-${service.id}`} key={service.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group scroll-mt-24">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <IconComponent className="w-7 h-7 text-secondary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{service.title}</CardTitle>
                        <p className="text-muted-foreground">{service.shortDescription}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {service.fullDescription && (
                      <p className="text-muted-foreground mb-6">{service.fullDescription}</p>
                    )}
                    {features.length > 0 && (
                      <ul className="space-y-3">
                        {features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="w-5 h-5 bg-secondary/10 rounded-full flex items-center justify-center mt-0.5">
                              <Check className="w-3 h-3 text-secondary" />
                            </div>
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Transaction Process
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A structured approach to help you achieve your real estate goals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { step: "01", title: "Discovery", desc: "Understanding your investment goals, risk tolerance, and timeline" },
              { step: "02", title: "Analysis", desc: "Comprehensive market research and property due diligence" },
              { step: "03", title: "Selection", desc: "Curated property recommendations matching your criteria" },
              { step: "04", title: "Execution", desc: "Seamless acquisition and ongoing asset management" },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-secondary text-white rounded-full flex items-center justify-center text-2xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose 3B Solution?
              </h2>
              <p className="text-primary-foreground/80 mb-8">
                With decades of combined experience in global real estate markets, our team delivers 
                exceptional results through deep market knowledge and personalized service.
              </p>
              <div className="space-y-4">
                {[
                  "Target returns: 15-30% (projected)",
                  "Global portfolio diversification",
                  "Expert team with local market knowledge",
                  "End-to-end investment management",
                  "Transparent reporting and communication",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { value: "70+", label: "Projects" },
                { value: "$750M+", label: "Assets Managed" },
                { value: "8+", label: "Years Experience" },
                { value: "95%", label: "Client Satisfaction" },
              ].map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <div className="text-3xl font-bold text-secondary mb-2">{stat.value}</div>
                  <div className="text-sm text-primary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start Your Investment Journey?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Schedule a consultation with our experts to discuss your investment goals and explore opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-medium px-8">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="font-medium px-8">
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Investor Profiles Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Who We Serve
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tailored investment solutions for diverse investor profiles
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/investors/uhnwi">
              <Card className="border-2 border-primary/20 hover:border-primary/40 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">UHNWI</h3>
                  <p className="text-sm text-muted-foreground mb-3">Ultra High Net Worth Individuals</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• $30M+ net worth</p>
                    <p>• Qualified client status</p>
                    <p>• Global portfolio diversification</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/investors/institutional">
              <Card className="border-2 border-secondary/20 hover:border-secondary/40 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-secondary/10 rounded-full flex items-center justify-center">
                    <Landmark className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Institutional Investors</h3>
                  <p className="text-sm text-muted-foreground mb-3">Pension Funds, Insurance, Endowments</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• $50M+ AUM</p>
                    <p>• Long-term horizon</p>
                    <p>• Risk-adjusted performance</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/investors/family-offices">
              <Card className="border-2 border-accent/20 hover:border-accent/40 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-accent/10 rounded-full flex items-center justify-center">
                    <Briefcase className="w-7 h-7 text-accent" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Family Offices</h3>
                  <p className="text-sm text-muted-foreground mb-3">Multi-generational wealth management</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• $100M+ family wealth</p>
                    <p>• Legacy planning</p>
                    <p>• Exclusive deal flow</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/investors/individual">
              <Card className="border-2 border-chart-2/20 hover:border-chart-2/40 hover:shadow-lg transition-all cursor-pointer h-full">
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 mx-auto mb-4 bg-chart-2/10 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-7 h-7 text-chart-2" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">Individual & First-Time Investors</h3>
                  <p className="text-sm text-muted-foreground mb-3">Building wealth through real estate</p>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• $100K+ investment capacity</p>
                    <p>• Portfolio diversification</p>
                    <p>• Expert guidance & support</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
          
          <div className="text-center mt-10">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                Schedule a Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
