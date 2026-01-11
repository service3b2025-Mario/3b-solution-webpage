import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { ArrowRight, TrendingUp, Globe, Building2, Users, MapPin, Calculator, ChevronRight, Lightbulb, Key, LineChart, Hammer, Briefcase, Landmark, Download } from "lucide-react";
import InvestmentCalculatorLazy from "@/components/InvestmentCalculatorLazy";
import { PropertyDetailModal } from "@/components/PropertyDetailModal";
import { ImageGallery } from "@/components/ImageGallery";
import { WishlistButton } from "@/components/WishlistButton";
import { SEO } from "@/components/SEO";
import { OrganizationSchema, InvestmentProductSchema, FAQSchema } from "@/components/StructuredData";
import { ValueCreationSection } from "@/components/ValueCreationSection";
import { DownloadResourceModal } from "@/components/DownloadResourceModal";
import { GlobalProjectPortfolio } from "@/components/GlobalProjectPortfolio";
import { useState } from "react";

export default function Home() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  
  const { data: properties } = trpc.properties.list.useQuery({ featured: true, limit: 6 });
  const { data: locations } = trpc.locations.list.useQuery();
  const { data: stats } = trpc.stats.list.useQuery();
  const { data: services } = trpc.services.list.useQuery();

  return (
    <Layout>
      <SEO 
        title="Luxury Real Estate Investment | 5-Star Hotels & Resorts | 15-30% Returns | 3B Solution"
        description="Premium real estate investment opportunities in 5-star hotels, luxury resorts, and commercial properties across Southeast Asia, Maldives, Europe, USA. UHNWI & institutional investors. $750M+ portfolio."
        keywords="luxury real estate investment, 5-star hotel investment, resort investment, UHNWI real estate, institutional investors, Southeast Asia property, Maldives resort, hospitality real estate"
        canonical="https://www.3bsolution.com/"
        ogImage="https://www.3bsolution.com/hero-background.jpg"
      />
      <OrganizationSchema />
      <InvestmentProductSchema />
      <FAQSchema faqs={[
        { question: "What is the minimum investment amount?", answer: "The minimum investment varies by project, typically starting at $100,000 USD for individual properties and $1,000,000 USD for fund participation." },
        { question: "What types of properties do you invest in?", answer: "We specialize in luxury hospitality real estate including 5-star hotels, ultra-luxury island resorts, premium city hotels, and high-end commercial properties." },
        { question: "What are the expected returns?", answer: "Our historical performance shows 15-30% annual returns across our portfolio. Returns vary by property type, location, and market conditions." },
        { question: "What is the typical investment horizon?", answer: "Most investments have a 5-7 year hold period, though this can vary based on the specific opportunity." },
        { question: "How do you manage currency risk?", answer: "We employ sophisticated hedging strategies and structure deals in major currencies (USD, EUR). Our global portfolio provides natural diversification." },
        { question: "What makes Southeast Asia and Maldives attractive markets?", answer: "These regions offer strong GDP growth, rising middle class, increasing tourism, and limited supply of luxury hospitality assets." },
        { question: "Do you offer co-investment opportunities?", answer: "Yes, we structure deals for both direct property co-investment and fund participation for family offices and institutional investors." },
        { question: "What due diligence do you conduct?", answer: "We perform comprehensive due diligence including third-party valuations, environmental assessments, legal review, market analysis, and financial modeling." },
        { question: "How are properties managed?", answer: "We partner with internationally recognized hotel operators (Marriott, Hilton, Accor) and boutique luxury brands with professional asset management." },
        { question: "How do I get started?", answer: "Schedule a private consultation with our investment team to discuss your objectives and complete the investor qualification process." }
      ]} />
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img src="/hero-background.jpg" alt="" className="w-full h-full object-cover" />
          {/* Dark overlay for text readability */}
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center pb-32">
            {/* Investor Badge */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/20 backdrop-blur-sm border-2 border-secondary/40 rounded-full">
                <span className="text-white font-semibold text-lg">🏆 UHNWI, Institutional & Individual Investors</span>
              </div>
            </div>
            
            {/* Text Content */}
            <div className="max-w-5xl">
              {/* 3B Solution Logo */}
              <div className="mb-4 flex justify-center">
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 border-2 border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-300 animate-fade-in-scale">
                  <img 
                    src="/3b-logo.png" 
                    alt="3B Solution" 
                    style={{ width: '345px', height: 'auto' }}
                    className="object-contain"
                  />
                </div>
              </div>
              
              <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-4 leading-tight">
                Premium Real Estate <span className="text-secondary">Solution</span>
              </h1>
            
              <p className="text-2xl md:text-3xl lg:text-4xl text-white/90 mb-3 font-light">
                Exclusive Access to High-Yield Real Estate Investments
              </p>
              
              <p className="text-xl md:text-2xl text-white/70 mb-4 mx-auto max-w-3xl">
                Anchored in the Philippines, Diversified Globally (Europe, USA).
                <span className="block mt-2 text-secondary font-bold text-2xl md:text-3xl">15-30% Annual Returns Backed by Global Expertise</span>
              </p>
              
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <Link href="/contact">
                  <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-bold px-10 h-16 text-xl shadow-lg hover:shadow-xl transition-all">
                    Schedule Consultation
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Button>
                </Link>
                <a href="#calculator">
                  <Button size="lg" variant="outline" className="border-white/40 border-2 text-white hover:bg-white/10 font-bold px-10 h-16 text-xl">
                    <Calculator className="mr-3 h-6 w-6" />
                    Investment Calculator
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Stats Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-sm py-8">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">$750M+</div>
                <div className="text-sm text-muted-foreground">Portfolio</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">70+</div>
                <div className="text-sm text-muted-foreground">Projects in Pipeline</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">95%</div>
                <div className="text-sm text-muted-foreground">Client Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">3</div>
                <div className="text-sm text-muted-foreground">Global Locations</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Expertise Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">
              Global Real Estate Expertise
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Operating across three strategic locations with specialized focus on luxury hospitality and commercial developments
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {/* Germany */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Germany</h3>
                <p className="text-lg font-semibold text-foreground mb-4">10+ European Projects</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold">3B SolutionDE</p>
                  <p>Weidenweg 17</p>
                  <p>15806 Zossen</p>
                  <p>Germany</p>
                </div>
              </CardContent>
            </Card>

            {/* Philippines - Highlighted */}
            <Card className="group hover:shadow-xl transition-all duration-300 border-4 border-secondary bg-card shadow-lg">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">Philippines</h3>
                <p className="text-lg font-semibold text-foreground mb-4">60+ Projects Focus</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold">3B SolutionPH Corp</p>
                  <p>7th Floor, Unit 710</p>
                  <p>High Street South Corporate Plaza Tower 2</p>
                  <p>26th Street Corner 11th Avenue</p>
                  <p>Bonifacio Global City, Taguig City</p>
                  <p>Philippines 1630</p>
                </div>
              </CardContent>
            </Card>

            {/* China */}
            <Card className="group hover:shadow-xl transition-all duration-300 border border-border bg-card">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-primary mb-2">China</h3>
                <p className="text-lg font-semibold text-foreground mb-4">Operations Center</p>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p className="font-semibold">Strategic Operations</p>
                  <p>Creative & Operational Hub</p>
                  <p>Under Bibian Pacayra Bock's Leadership</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Portfolio Stats Section */}
      <GlobalProjectPortfolio />

      {/* Featured Properties Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">Featured Properties</h2>
              <p className="text-muted-foreground">Exclusive investment opportunities handpicked by our experts</p>
            </div>
            <Link href="/properties">
              <Button variant="outline" className="font-medium">
                View All Properties
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(properties?.items || []).slice(0, 3).map((property) => (
              <div 
                key={property.id} 
                onClick={() => {
                  setSelectedProperty(property);
                  setIsModalOpen(true);
                }}
              >
                <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0">
                  <div 
                    className="h-56 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden"
                    onClick={(e) => {
                      if (property.images && property.images.length > 0) {
                        e.stopPropagation();
                        setGalleryImages(property.images);
                        setGalleryIndex(0);
                        setIsGalleryOpen(true);
                      }
                    }}
                  >
                    {property.mainImage ? (
                      <img 
                        src={property.mainImage} 
                        alt={property.title}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-primary/30" />
                      </div>
                    )}
                    {/* Wishlist Button */}
                    <WishlistButton propertyId={property.id} />
                    {property.featured && (
                      <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg z-10">
                        Featured
                      </div>
                    )}
                    {property.status === 'offMarket' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                        <div className="text-white text-3xl font-bold tracking-wider transform -rotate-12 opacity-90">
                          OFF-MARKET
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-primary">
                      {property.propertyType}
                    </div>
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <MapPin className="w-4 h-4" />
                      {property.city}, {property.country}
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {property.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {property.shortDescription}
                    </p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedProperty(null);
        }}
        similarProperties={(properties?.items || []).filter(p => p.id !== selectedProperty?.id).slice(0, 2) as any[]}
      />

      {/* Image Gallery Lightbox */}
      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Traditional Investments Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Traditional Investments Are Failing You
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                While inflation erodes your wealth, traditional investments deliver disappointing returns. 
                Real estate in emerging markets offers a proven alternative.
              </p>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-destructive" />
                  </div>
                  <div>
                    <div className="font-semibold">Savings Accounts</div>
                    <div className="text-sm text-muted-foreground">0.5-2% average returns</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-secondary" />
                  </div>
                  <div>
                    <div className="font-semibold">3B Solution Properties</div>
                    <div className="text-sm text-muted-foreground">15-30% projected returns</div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button className="bg-secondary hover:bg-secondary/90 text-white">
                    Start Investing Today
                  </Button>
                </Link>
                <Link href="/market-insights">
                  <Button variant="outline">
                    View Market Insights
                  </Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-muted-foreground">Traditional Bonds</span>
                  <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="w-1/5 h-full bg-muted-foreground/50" />
                  </div>
                  <span className="font-semibold">3%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm">
                  <span className="text-muted-foreground">Stock Market Avg</span>
                  <div className="w-24 h-3 bg-muted rounded-full overflow-hidden">
                    <div className="w-2/5 h-full bg-muted-foreground/50" />
                  </div>
                  <span className="font-semibold">8%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg shadow-sm border-2 border-secondary">
                  <span className="font-semibold text-secondary">3B Solution</span>
                  <div className="w-24 h-3 bg-secondary/20 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-secondary" />
                  </div>
                  <span className="font-bold text-secondary">15-30%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar Section */}
      <section className="py-12 bg-white border-y border-border">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="text-center">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Regulated by</div>
              <div className="text-lg font-bold text-primary">SEC and BIR Philippines</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Member of</div>
              <div className="text-sm font-bold text-primary">German Philippine Chamber of Commerce</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Member of</div>
              <div className="text-sm font-bold text-primary">CCI Chamber of Industry and Commerce</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-semibold text-muted-foreground mb-1">Track Record</div>
              <div className="text-lg font-bold text-primary">8+ Years</div>
            </div>
          </div>
        </div>
      </section>

      {/* Investor Qualification Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Who We Serve</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Exclusive opportunities for qualified investors
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
                    <p>• Accredited investor status</p>
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
                    <p>• Risk-adjusted returns</p>
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
            <Link href="/investors">
              <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white">
                Qualify as an Investor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why 3B Solution Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why 3B Solution</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Competitive advantages that set us apart
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-primary/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Proven Track Record</h3>
                <p className="text-muted-foreground">8+ years delivering 15-30% annual returns across 70+ projects in 3 continents</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-secondary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Luxury Hospitality Focus</h3>
                <p className="text-muted-foreground">Specialized in 5-star hotels and ultra-luxury resorts with strong operator partnerships</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Globe className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Global Diversification</h3>
                <p className="text-muted-foreground">Strategic presence in the Philippines, Southeast Asia, Maldives, Europe, USA, and Caribbean markets</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-chart-1" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Institutional-Grade Due Diligence</h3>
                <p className="text-muted-foreground">Rigorous underwriting process with third-party valuations and legal review</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-chart-2" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Local Market Expertise</h3>
                <p className="text-muted-foreground">On-ground teams in Philippines, Germany, and China with deep local knowledge</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="w-12 h-12 mb-4 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-chart-3" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">Transparent Reporting</h3>
                <p className="text-muted-foreground">Quarterly performance reports and annual audited financials for all investors</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Creation Framework Section */}
      <ValueCreationSection />

      {/* Downloadable Investment Guide Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary/80 text-white">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Download Our Investment Guide</h2>
            <p className="text-xl text-white/90 mb-8">
              Get exclusive access to our comprehensive guide on luxury hospitality real estate investment. Learn our strategies, market insights, and investment criteria.
            </p>
            
            <Card className="border-0 shadow-2xl">
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground mb-2">What's Inside:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Market analysis for 5 key regions</li>
                      <li>✓ Investment structures explained</li>
                      <li>✓ Due diligence checklist</li>
                      <li>✓ Risk mitigation strategies</li>
                      <li>✓ Case studies with ROI breakdown</li>
                    </ul>
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold text-foreground mb-2">Who Should Read:</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>✓ Ultra-high-net-worth individuals</li>
                      <li>✓ Family offices</li>
                      <li>✓ Institutional investors</li>
                      <li>✓ Individual & first-time investors</li>
                      <li>✓ Real estate fund managers</li>
                      <li>✓ Accredited investors</li>
                    </ul>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setGuideModalOpen(true)}
                  size="lg" 
                  className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold"
                >
                  <Download className="mr-2 h-5 w-5" />
                  Download Investment Guide
                </Button>
                <p className="text-xs text-muted-foreground mt-4">
                  By downloading, you agree to receive occasional updates about investment opportunities. Unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="container max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about investing with 3B Solution
            </p>
          </div>
          
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What is the minimum investment amount?</h3>
                <p className="text-muted-foreground">The minimum investment varies by project, typically starting at $100,000 USD for individual properties and $10,000,000 USD for fund participation. We work with qualified investors to find opportunities that match their investment criteria.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What types of properties do you invest in?</h3>
                <p className="text-muted-foreground">We specialize in luxury hospitality real estate including 5-star hotels, ultra-luxury island resorts, premium city hotels, and high-end commercial properties. Our focus is on assets with strong operator partnerships and proven revenue models.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What are the expected returns?</h3>
                <p className="text-muted-foreground">Our historical performance shows 15-30% annual returns across our portfolio. Returns vary by property type, location, and market conditions. We provide detailed pro forma projections for each investment opportunity.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What is the typical investment horizon?</h3>
                <p className="text-muted-foreground">Most investments have a 5-7 year hold period, though this can vary based on the specific opportunity. We focus on value-add strategies with clear exit paths through sale to institutional buyers or hotel operators.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">How do you manage currency risk?</h3>
                <p className="text-muted-foreground">Currency risk is managed through structural alignment, diversification, and long-term investment planning, rather than financial hedging.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What makes Southeast Asia and Maldives attractive markets?</h3>
                <p className="text-muted-foreground">These regions offer strong GDP growth, rising middle class, increasing tourism, and limited supply of luxury hospitality assets. The Maldives specifically has government restrictions on new resort development, creating scarcity value.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">Do you offer co-investment opportunities?</h3>
                <p className="text-muted-foreground">Yes, we structure deals for both direct property co-investment and fund participation. Family offices and institutional investors can invest on specific assets.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">What due diligence do you conduct?</h3>
                <p className="text-muted-foreground">We perform comprehensive due diligence including third-party property valuations, environmental assessments, legal title review, market analysis, operator background checks, and financial modeling. All reports are shared with investors.</p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">How are properties managed?</h3>
                <p className="text-muted-foreground">We partner with internationally recognized hotel operators and boutique luxury brands. </p>
              </CardContent>
            </Card>
            
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-foreground mb-3">How do I get started?</h3>
                <p className="text-muted-foreground">Schedule a private consultation with our investment team to discuss your objectives, review current opportunities, and complete the investor qualification process. We'll provide a detailed investment memorandum for properties that match your criteria.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Market Reports Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investment Guides & Market Reports
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Access exclusive insights and comprehensive guides on global real estate markets
            </p>
          </div>
          
          {(() => {
            const { data: reports } = trpc.marketReports.list.useQuery();
            const featuredReports = (reports || []).slice(0, 3);
            
            return (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  {featuredReports.map((report) => (
                    <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 border-0 overflow-hidden">
                      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                        {report.thumbnailUrl ? (
                          <img 
                            src={report.thumbnailUrl} 
                            alt={report.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Download className="w-12 h-12 text-secondary/40" />
                        )}
                      </div>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded text-xs">
                            {report.category?.replace("_", " ") || "Report"}
                          </span>
                          {report.region && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {report.region}
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">{report.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report.description}</p>
                        <Button 
                          size="sm" 
                          className="w-full bg-secondary hover:bg-secondary/90 text-white"
                          onClick={() => setGuideModalOpen(true)}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download Free
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center">
                  <Link href="/market-insights">
                    <Button variant="outline" size="lg" className="font-medium">
                      View All Reports
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </>
            );
          })()}
        </div>
      </section>

      {/* Investment Calculator Section */}
      <section id="calculator" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Investment Calculator
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Visualize your potential returns with our interactive investment calculator
            </p>
          </div>
          <InvestmentCalculatorLazy />
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-background">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Services</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive investment solutions tailored to your goals
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(services || []).slice(0, 4).map((service, index) => {
              // Map different icons for each service
              const iconMap: Record<number, any> = {
                0: Lightbulb,  // Investment Advisory
                1: Key,         // Property Acquisition
                2: LineChart,   // Asset Management
                3: Hammer       // Development Consulting
              };
              const IconComponent = iconMap[index] || TrendingUp;
              
              return (
                <Link key={service.id} href={`/services#service-${service.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card cursor-pointer h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-secondary/10 rounded-xl flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <IconComponent className="w-8 h-8 text-secondary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{service.title}</h3>
                      <p className="text-sm text-muted-foreground">{service.shortDescription}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          
          <div className="text-center mt-10">
            <Link href="/services">
              <Button variant="outline" size="lg" className="font-medium">
                Explore All Services
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Download Resource Modal */}
      <DownloadResourceModal
        open={guideModalOpen}
        onOpenChange={setGuideModalOpen}
      />
    </Layout>
  );
}
