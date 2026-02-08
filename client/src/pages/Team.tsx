import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";
import { OptimizedImage } from "@/components/OptimizedImage";
import { Mail, Linkedin, MapPin, MessageCircle, Calendar, Users } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

// Using database team member type
type TeamMember = {
  id: number;
  name: string;
  role: string;
  location?: string | null;
  photo?: string | null;
  bio?: string | null;
  shortBio?: string | null;
  email?: string | null;
  linkedIn?: string | null;
  phone?: string | null;
  isActive: boolean | null;
  isExpert: boolean | null;
  order: number | null;
};

// Person Schema for each team member
function PersonSchema({ member }: { member: TeamMember }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": member.name,
    "jobTitle": member.role,
    "email": member.email || undefined,
    "worksFor": {
      "@type": "Organization",
      "name": "3B Solution"
    },
    "address": member.location ? {
      "@type": "PostalAddress",
      "addressLocality": member.location
    } : undefined,
    "sameAs": member.linkedIn ? [member.linkedIn] : [],
    "description": member.bio || undefined
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function Team() {
  const [location] = useLocation();
  const [highlightedMember, setHighlightedMember] = useState<number | null>(null);
  const memberRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  
  // Fetch team members from database
  const { data: teamMembers, isLoading } = trpc.team.list.useQuery();

  useEffect(() => {
    // Get member ID from URL parameter
    const params = new URLSearchParams(window.location.search);
    const memberIdStr = params.get('member');
    
    if (memberIdStr && teamMembers) {
      const memberId = parseInt(memberIdStr, 10);
      
      if (memberRefs.current[memberId]) {
        // Scroll to the member card with smooth behavior
        setTimeout(() => {
          memberRefs.current[memberId]?.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          // Highlight the member card
          setHighlightedMember(memberId);
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedMember(null);
          }, 3000);
        }, 300);
      }
    }
  }, [location, teamMembers]);

  return (
    <Layout>
      {/* Add Person schema for each team member */}
      {teamMembers?.map(member => (
        <PersonSchema key={member.id} member={member} />
      ))}
      
      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white py-20">
          <div className="container">
            <Breadcrumb 
              items={[
                { label: 'Home', href: '/' },
                { label: 'Our Team' }
              ]} 
            />
            
            <div className="max-w-3xl mt-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Meet Our Team
              </h1>
              <p className="text-xl text-blue-100">
                Experienced professionals dedicated to delivering exceptional real estate opportunities and superior client service. Our team combines deep market knowledge, institutional-grade analysis, and hands-on operational expertise.
              </p>
            </div>
          </div>
        </section>

        {/* Team Members Grid */}
        <section className="py-20 bg-slate-50">
          <div className="container">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading team members...</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-1 lg:grid-cols-1 gap-12 max-w-5xl mx-auto">
                {(teamMembers || []).map((member) => (
                  <Card 
                    key={member.id} 
                    ref={(el) => { memberRefs.current[member.id] = el; }}
                    className={`overflow-hidden hover:shadow-xl transition-all duration-500 ${
                      highlightedMember === member.id 
                        ? 'ring-4 ring-secondary shadow-2xl scale-[1.02]' 
                        : ''
                    }`}
                  >
                    <div className="grid md:grid-cols-5 gap-6 p-8">
                      {/* Photo Column */}
                      <div className="md:col-span-2">
                        {member.photo ? (
                          <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-slate-200">
                            <OptimizedImage
                              src={member.photo}
                              alt={member.name}
                              className="w-full h-full object-cover"
                              priority={member.order === 0}
                            />
                          </div>
                        ) : (
                          <div className="aspect-[3/4] relative rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                            <Users className="w-20 h-20 text-primary/30" />
                          </div>
                        )}
                        
                        {/* Contact Buttons */}
                        <div className="mt-4 space-y-2">
                          {member.email && (
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              asChild
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
                            >
                              <a 
                                href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(member.name)}%2C%20I%20would%20like%20to%20discuss%20property%20opportunities%20with%203B%20Solution.`}
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
                            >
                              <a href={member.linkedIn} target="_blank" rel="noopener noreferrer">
                                <Linkedin className="h-4 w-4 mr-2" />
                                LinkedIn
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Info Column */}
                      <div className="md:col-span-3 space-y-6">
                        <div>
                          <h2 className="text-3xl font-bold text-slate-900 mb-2">
                            {member.name}
                          </h2>
                          <p className="text-lg text-blue-600 font-semibold mb-2">
                            {member.role}
                          </p>
                          {member.location && (
                            <p className="text-sm text-slate-600 flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {member.location}
                            </p>
                          )}
                        </div>

                        {member.bio && (
                          <div>
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-2">
                              About
                            </h3>
                            <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                              {member.bio}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary to-primary/90 text-white">
          <div className="container text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Discuss Your Investment Goals?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Schedule a consultation with our team to explore premium real estate opportunities tailored to your investment objectives.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/contact">
                Schedule Consultation
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </Layout>
  );
}
