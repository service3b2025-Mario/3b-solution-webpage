import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Mail, MapPin, Clock, Globe, Linkedin, Check, Users } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { BookingSelector } from "@/components/BookingSelector";

export default function Contact() {
  const { data: experts } = trpc.team.experts.useQuery();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Contact" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-white/80">
              Connect with our expert team for personalized investment guidance
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-background pb-32">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Consultation Booking */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Schedule a Consultation</CardTitle>
                  <p className="text-muted-foreground">
                    Choose how you'd like to connect with our team
                  </p>
                </CardHeader>
                <CardContent>
                  <BookingSelector />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">3B SolutionPH Corp.</p>
                      <p className="text-sm text-muted-foreground">7th Floor Unit 710, High Street South Corporate Plaza, Tower 2</p>
                      <p className="text-sm text-muted-foreground">26th Street Corner 11th Ave., Bonifacio Global City</p>
                      <p className="text-sm text-muted-foreground">1630 Taguig City, Philippines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">3B SolutionDE</p>
                      <p className="text-sm text-muted-foreground">Weidenweg 17, 15806 Zossen, Germany</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:info@3bsolution.de" className="text-sm text-muted-foreground hover:text-foreground">
                        info@3bsolution.de
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Website</p>
                      <a href="https://www.3bsolution.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                        www.3bsolution.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">Mon - Sat: 8:00 AM - 8:00 PM</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Team */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Our Experts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(experts || []).map((expert) => {
                    // Determine timezone based on expert name
                    const getTimezone = (name: string) => {
                      if (name.toLowerCase().includes('georg')) return 'CET (German Time)';
                      if (name.toLowerCase().includes('engela')) return 'GMT+8 (Philippine Time)';
                      if (name.toLowerCase().includes('bibian')) return 'GMT+8 (Chinese Time)';
                      return 'GMT+8';
                    };
                    
                    return (
                      <div key={expert.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        {expert.photo ? (
                          <img 
                            src={expert.photo} 
                            alt={expert.name}
                            className="w-12 h-12 rounded-full object-cover object-top"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium">{expert.name}</p>
                          <p className="text-sm text-muted-foreground">{expert.role}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3" />
                            Mon-Sat 8AM-8PM {getTimezone(expert.name)}
                          </p>
                        </div>
                        {expert.linkedIn && (
                          <a href={expert.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary">
                            <Linkedin className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Why Contact Us */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Why Contact Us?</h3>
                  <ul className="space-y-3">
                    {[
                      "Free consultation with no obligation",
                      "Personalized investment recommendations",
                      "Access to exclusive opportunities",
                      "Expert guidance from industry experts",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
