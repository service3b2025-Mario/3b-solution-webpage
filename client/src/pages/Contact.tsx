import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Mail, MapPin, Clock, Globe, Linkedin, Check, Users, MessageCircle } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BookingSelector } from "@/components/BookingSelector";
import { Link } from "wouter";

export default function Contact() {
  const { data: experts } = trpc.team.experts.useQuery();

  return (
    <Layout>
      {/* Breadcrumb */}
      <section className="bg-muted/30 py-4">
        <div className="container">
          <Breadcrumb items={[{ label: "Contact" }]} />
        </div>
      </section>

      {/* Page Title */}
      <section className="py-8 md:py-12">
        <div className="container text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
            Contact Us
          </h1>
          <p className="text-muted-foreground">
            Connect with our expert team for personalized investment guidance
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pb-16">
        <div className="container">
          {/* Row 1: Schedule a Consultation - Full Width */}
          <Card className="border shadow-lg mb-8">
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl md:text-2xl">Schedule a Consultation</CardTitle>
              <p className="text-muted-foreground text-sm">
                Choose how you'd like to connect with our team
              </p>
            </CardHeader>
            <CardContent>
              <BookingSelector />
            </CardContent>
          </Card>

          {/* Row 2: Get in Touch + Our Experts - 50/50 Grid on Desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Get in Touch */}
            <Card className="border shadow-lg bg-amber-50/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Get in Touch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3B SolutionPH Corp.</p>
                    <p className="text-xs text-muted-foreground">BGC, Taguig City</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">3B SolutionDE</p>
                    <p className="text-xs text-muted-foreground">Zossen, Germany</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">Email</p>
                    <a href="mailto:info@3bsolution.de" className="text-xs text-muted-foreground hover:text-foreground">
                      info@3bsolution.de
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Experts */}
            <Card className="border shadow-lg bg-amber-50/50 h-full">
              <CardHeader>
                <CardTitle className="text-lg">Our Experts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {(experts || []).map((expert) => (
                  <div key={expert.id} className="flex items-center gap-3 p-2 bg-white/60 rounded-lg">
                    {expert.photo ? (
                      <img 
                        src={expert.photo}
                        alt={expert.name}
                        className="w-10 h-10 rounded-full object-cover object-top"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{expert.name}</p>
                      <p className="text-xs text-muted-foreground">{expert.role}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {expert.phone && (
                        <a 
                          href={`https://wa.me/${expert.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(expert.name)}%2C%20I%20would%20like%20to%20discuss%20investment%20opportunities%20with%203B%20Solution.`}
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-green-600 hover:text-green-700"
                          title={`Chat with ${expert.name} on WhatsApp`}
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                      )}
                      {expert.linkedIn && (
                        <a href={expert.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary">
                          <Linkedin className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Row 3: Why Contact Us? - Full Width */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground mb-8">
            <CardContent className="p-6 md:p-8">
              <h3 className="font-semibold text-lg md:text-xl mb-4 text-center">Why Contact Us?</h3>
              <div className="flex flex-col md:flex-row md:justify-center md:gap-8 gap-3">
                {[
                  "Free consultation with no obligation",
                  "Personalized investment recommendations",
                  "Access to exclusive opportunities",
                  "Expert guidance from industry experts",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Row 4: CTA - Full Width */}
          <div className="bg-secondary rounded-xl p-8 md:p-12 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              Ready to Start Your Property Journey?
            </h2>
            <Link href="/contact">
              <Button 
                size="lg" 
                variant="outline"
                className="bg-white text-secondary hover:bg-white/90 border-white"
              >
                Schedule Consultation
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
