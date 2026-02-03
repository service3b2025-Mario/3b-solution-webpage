import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Phone, Mail, MapPin, Linkedin, Facebook, User, Heart, Bookmark, LogOut, Calendar, Home, Building2, Briefcase, Info, Users, TrendingUp, Trophy, MessageSquare, Globe } from "lucide-react";
import { Instagram } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { ChatWidget } from "@/components/ChatWidget";
import { MobileContactMenu } from "@/components/MobileContactMenu";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/services", label: "Services", icon: Briefcase },
  { href: "/about", label: "About", icon: Info },
  { href: "/team", label: "Team", icon: Users },
  { href: "/market-insights", label: "Insights", icon: TrendingUp },
  { href: "/success-stories", label: "Stories", icon: Trophy },
  { href: "/contact", label: "Contact", icon: MessageSquare },
];

export function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { user } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-border/50 shadow-sm transition-all duration-300 ${
        isScrolled ? "py-0" : ""
      }`}>
      <div className="container">
        <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? "h-16" : "h-20"
          }`}>
          {/* Logo - OPTIMIZED with dimensions for CLS prevention */}
          <Link href="/" className="flex items-center">
            <img 
              src="https://cdn.3bsolution.com/assets/3b-logo-header.webp" 
              alt="3B Solution - Premium Real Estate" 
              width={140}
              height={40}
              className={`w-auto object-contain transition-all duration-300 ${
                isScrolled ? "h-10" : "h-14"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`px-5 py-2.5 rounded-lg text-base font-semibold transition-colors ${
                    location === link.href
                      ? "bg-primary/10 text-[#003366]"
                      : "text-[#003366]/80 hover:text-[#003366] hover:bg-muted"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </nav>

          {/* User Menu & CTA Button */}
          <div className="flex items-center gap-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  {/* FIXED: Added aria-label for accessibility */}
                  <Button variant="ghost" size="icon" className="rounded-full" aria-label="Open user menu">
                    <User className="h-5 w-5" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name || 'User'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/my-wishlist" className="flex items-center cursor-pointer">
                      <Heart className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>My Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-saved-searches" className="flex items-center cursor-pointer">
                      <Bookmark className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>My Saved Searches</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-tours" className="flex items-center cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
                      <span>My Tours</span>
                    </Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center cursor-pointer">
                          <span>Admin Panel</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href="/admin" className="hidden md:block">
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" aria-hidden="true" />
                  Sign In
                </Button>
              </a>
            )}
            <Link href="/contact" className="hidden md:block">
              <Button className="bg-secondary hover:bg-secondary/90 text-white font-bold text-base px-6 py-6 shadow-lg hover:shadow-xl transition-all">
                Schedule Consultation
              </Button>
            </Link>

            {/* Mobile Menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="lg:hidden">
                {/* FIXED: Added aria-label for accessibility */}
                <Button variant="ghost" size="icon" aria-label="Open navigation menu">
                  <Menu className="h-6 w-6" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-2 mt-8" role="navigation" aria-label="Mobile navigation">
                  {navLinks.map((link) => {
                    const IconComponent = link.icon;
                    return (
                      <Link key={link.href} href={link.href} onClick={() => setMobileMenuOpen(false)}>
                        <span
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                            location === link.href
                              ? "bg-primary/10 text-primary"
                              : "text-foreground/70 hover:text-foreground hover:bg-muted"
                          }`}
                        >
                          <IconComponent className="w-5 h-5" aria-hidden="true" />
                          {link.label}
                        </span>
                      </Link>
                    );
                  })}
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full mt-4 bg-secondary hover:bg-secondary/90 text-white">
                      Schedule Consultation
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  // Fetch social media links from settings
  const { data: socialSettings } = trpc.settings.getByCategory.useQuery("social");
  
  // Extract social links from settings
  const getSocialLink = (key: string) => {
    if (!socialSettings || !Array.isArray(socialSettings)) return "";
    const setting = socialSettings.find((s: any) => s.key === key);
    return setting?.value || "";
  };
  
  const linkedinUrl = getSocialLink("social_linkedin");
  const facebookUrl = getSocialLink("social_facebook");
  const instagramUrl = getSocialLink("social_instagram");
  const tiktokUrl = getSocialLink("social_tiktok");

  return (
    <footer className="bg-primary text-primary-foreground" role="contentinfo">
      {/* CTA Section */}
      <div className="bg-secondary py-12">
        <div className="container text-center">
          {/* FIXED: Changed from h3 to h2 for proper heading hierarchy */}
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Start Your Property Journey?
          </h2>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Connect with our expert team for personalized property guidance and exclusive real estate access.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-white text-secondary hover:bg-white/90 font-medium px-8">
              Schedule Free Consultation
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                {/* OPTIMIZED: Added dimensions and lazy loading to footer logo */}
                <img 
                  src="https://cdn.3bsolution.com/assets/3b-logo-header.webp" 
                  alt="3B Solution" 
                  width={120}
                  height={40}
                  loading="lazy"
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
                Premium real estate brokerage and services anchored in the Philippines, diversified globally. 
                Targeting 15-30% yields based on developer projections.
              </p>
              {/* Social Media Icons */}
              <div className="flex gap-4 mb-4">
                {linkedinUrl && (
                  <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on LinkedIn" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Linkedin className="w-5 h-5" aria-hidden="true" />
                  </a>
                )}
                {facebookUrl && (
                  <a href={facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Facebook" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Facebook className="w-5 h-5" aria-hidden="true" />
                  </a>
                )}
                {instagramUrl && (
                  <a href={instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <Instagram className="w-5 h-5" aria-hidden="true" />
                  </a>
                )}
                {tiktokUrl && (
                  <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="Follow us on TikTok" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </a>
                )}
                {/* Show placeholder icons if no social links are configured */}
                {!linkedinUrl && !facebookUrl && !instagramUrl && !tiktokUrl && (
                  <>
                    <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-50" aria-hidden="true">
                      <Linkedin className="w-5 h-5" />
                    </span>
                    <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-50" aria-hidden="true">
                      <Facebook className="w-5 h-5" />
                    </span>
                    <span className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center opacity-50" aria-hidden="true">
                      <Instagram className="w-5 h-5" />
                    </span>
                  </>
                )}
              </div>
              
              {/* Legal Links - Below Social Media Icons, Highlighted */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                <Link href="/legal/terms-of-service" className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors">
                  Terms
                </Link>
                <span className="text-white/30">|</span>
                <Link href="/legal/privacy-policy" className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors">
                  Privacy
                </Link>
                <span className="text-white/30">|</span>
                <Link href="/legal/cookie-policy?lang=en" className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors">
                  Cookies
                </Link>
                <span className="text-white/30">|</span>
                <Link href="/legal/imprint" className="text-secondary hover:text-secondary/80 text-sm font-medium transition-colors">
                  Imprint
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              {/* FIXED: Changed from h4 to h3 for proper heading hierarchy */}
              <h3 className="font-semibold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-primary-foreground/70 hover:text-white transition-colors text-sm">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold mb-6">Our Services</h3>
              <ul className="space-y-3">
                <li><Link href="/services" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Service Advisory</Link></li>
                <li><Link href="/services" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Property Acquisition</Link></li>
                <li><Link href="/services" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Real Estate Services</Link></li>
                <li><Link href="/services" className="text-primary-foreground/70 hover:text-white transition-colors text-sm">Development Consulting</Link></li>
              </ul>
            </div>


            {/* Contact */}
            <div>
              <h3 className="font-semibold mb-6">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <address className="text-primary-foreground/70 text-sm not-italic">
                    <p className="font-medium text-white">3B SolutionPH Corp.</p>
                    <p>7th Floor Unit 710, High Street South Corporate Plaza, Tower 2</p>
                    <p>26th Street Corner 11th Ave., Bonifacio Global City</p>
                    <p>1630 Taguig City, Philippines</p>
                  </address>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <address className="text-primary-foreground/70 text-sm not-italic">
                    <p className="font-medium text-white">3B SolutionDE</p>
                    <p>Weidenweg 17, 15806 Zossen, Germany</p>
                  </address>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
                  <a href="mailto:info@3bsolution.de" className="text-primary-foreground/70 hover:text-white text-sm">
                    info@3bsolution.de
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-secondary flex-shrink-0" aria-hidden="true" />
                  <a href="https://www.3bsolution.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-white text-sm">
                    www.3bsolution.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Disclaimer Section */}
      <div className="border-t-2 border-secondary py-6">
        <div className="container">
          <p className="text-sm text-primary-foreground/70 leading-relaxed mb-3">
            <strong className="text-primary-foreground/90">Important Legal Notice:</strong> 3B Solution provides real estate brokerage 
            (Germany, licensed) and referral/management services (Philippines, SEC-registered). 
            We are not an investment firm, fund manager, or financial advisor. Any projected 
            returns (15-30%) represent developer estimates or market analyses and do not 
            constitute guaranteed performance. Real estate investments involve risks including 
            illiquidity, market fluctuations, and total loss of capital.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-primary-foreground/60">
            <span><strong className="text-secondary">Germany:</strong> Licensed broker §34c GewO</span>
            <span><strong className="text-secondary">Philippines:</strong> SEC 2023100119302-12 (not PRC-licensed broker)</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar - Copyright */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="flex flex-col items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {new Date().getFullYear()} 3B Solution. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-20">
        {children}
      </main>
      <Footer />
      <BackToTop />
      <ChatWidget />
      <MobileContactMenu />
    </div>
  );
}
