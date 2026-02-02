import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Globe, Users, Target, Award, MapPin, Linkedin, Mail, Phone, ArrowRight, MessageCircle, Calendar } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GlobalProjectPortfolio } from "@/components/GlobalProjectPortfolio";

export default function About() {
  const { data: teamMembers } = trpc.team.list.useQuery();
  const { data: locations } = trpc.locations.list.useQuery();
  const { data: stats } = trpc.stats.list.useQuery();
  const [, setLocation] = useLocation();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "About" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              About 3B Solution
            </h1>
            <p className="text-xl text-white/80">
              Premium real estate brokerage and services anchored in the Philippines, diversified globally
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <div className="inline-flex items-center gap-2 bg-secondary/10 px-4 py-2 rounded-full mb-6">
                <Target className="w-4 h-4 text-secondary" />
                <span className="text-sm font-medium text-secondary">Our Mission</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-6">
                Democratizing Access to Premium Real Estate Investments
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                At 3B Solution, we believe that exceptional real estate opportunities 
                should be accessible to discerning investors worldwide. Our mission is to bridge 
                the gap between global capital and high-yield real estate assets in emerging markets.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                With a focus on hospitality, commercial, and mixed-use developments, we deliver 
                15-30% annual returns backed by deep market expertise and rigorous due diligence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Globe, title: "Global Reach", desc: "Operating across 4 continents with local expertise" },
                { icon: Users, title: "Expert Team", desc: "Decades of combined real estate experience" },
                { icon: Target, title: "Focused Strategy", desc: "Specializing in high-growth hospitality sector" },
                { icon: Award, title: "Proven Results", desc: "Consistent 15-30% annual returns" },
              ].map((item, index) => (
                <Card key={index} className="border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center mb-4">
                      <item.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <h3 className="font-semibold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Portfolio */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Global Portfolio
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Strategic presence across key markets with specialized focus on luxury hospitality
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {(stats || []).map((stat, index) => (
              <div key={stat.id || index} className="text-center p-6 bg-card rounded-xl shadow-lg">
                <div className="text-4xl font-bold text-secondary mb-2">
                  {stat.value}{stat.suffix}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Global Presence */}
      <GlobalProjectPortfolio />
      {/* Leadership Team */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Leadership Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Meet the experts driving exceptional returns for our investors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(teamMembers || []).map((member) => (
                <Card 
                  key={member.id}
                  onClick={() => setLocation(`/team?member=${member.id}`)}
                  className="border-0 shadow-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition-shadow duration-300"
                >
                  {member.photo ? (
                  <div className="h-80 overflow-hidden">
                    <img 
                      src={member.photo} 
                      alt={member.name} 
                      className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="h-80 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    <Users className="w-20 h-20 text-primary/30" />
                  </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
                    <p className="text-secondary font-medium mb-4">{member.role}</p>
                    <p className="text-sm text-muted-foreground mb-4">{member.shortBio || member.bio}</p>

                    <div className="space-y-2 pt-4 border-t border-border" onClick={(e) => e.stopPropagation()}>
                      {member.email && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={`mailto:${member.email}`}>
                            <Mail className="h-4 w-4 mr-2" />
                            Email
                          </a>
                        </Button>
                      )}
                      
                      {member.phone && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a 
                            href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(member.name)}%2C%20I%20would%20like%20to%20discuss%20real%20estate%20opportunities%20with%203B%20Solution.`}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            WhatsApp
                          </a>
                        </Button>
                      )}
                      
                      <Button 
                        variant="default" 
                        className="w-full justify-start bg-secondary hover:bg-secondary/90"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href="/contact">
                          <Calendar className="h-4 w-4 mr-2" />
                          Book Appointment
                        </Link>
                      </Button>
                      
                      {member.linkedIn && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <a href={member.linkedIn} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="h-4 w-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Partner With Us
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Whether you're an investor seeking exceptional returns or a developer looking for strategic partnerships, 
            we're here to help you achieve your goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-medium px-8">
                Schedule Consultation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/properties">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-medium px-8">
                Explore Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
