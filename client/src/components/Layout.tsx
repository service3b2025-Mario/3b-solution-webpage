import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, Phone, Mail, MapPin, Linkedin, Twitter, Facebook, User, Heart, Bookmark, LogOut, Calendar, Home, Building2, Briefcase, Info, Users, TrendingUp, Trophy, MessageSquare } from "lucide-react";
import { BackToTop } from "@/components/BackToTop";
import { ChatWidget } from "@/components/ChatWidget";
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
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img 
              src="/3b-logo.png" 
              alt="3B Solution - Premium Real Estate" 
              className={`w-auto object-contain transition-all duration-300 ${
                isScrolled ? "h-10" : "h-14"
              }`}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
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
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
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
                      <Heart className="mr-2 h-4 w-4" />
                      <span>My Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-saved-searches" className="flex items-center cursor-pointer">
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>My Saved Searches</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/my-tours" className="flex items-center cursor-pointer">
                      <Calendar className="mr-2 h-4 w-4" />
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
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <a href={getLoginUrl()} className="hidden md:block">
                <Button variant="outline" size="sm">
                  <User className="mr-2 h-4 w-4" />
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
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <nav className="flex flex-col gap-2 mt-8">
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
                          <IconComponent className="w-5 h-5" />
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
  return (
    <footer className="bg-primary text-primary-foreground">
      {/* CTA Section */}
      <div className="bg-secondary py-12">
        <div className="container text-center">
          <h3 className="text-2xl md:text-3xl font-semibold text-white mb-4">
            Ready to Start Your Investment Journey?
          </h3>
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Connect with our expert team for personalized investment guidance and exclusive property access.
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            {/* Company Info */}
            <div>
              <div className="mb-6">
                <img 
                  src="/3b-logo.png" 
                  alt="3B Solution" 
                  className="h-12 w-auto object-contain"
                />
              </div>
              <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
                Premium real estate investment solutions anchored in the Philippines, diversified globally. 
                Delivering 15-30% annual returns backed by global expertise.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {navLinks.slice(0, 4).map((link) => (
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
              <h4 className="font-semibold mb-6">Our Services</h4>
              <ul className="space-y-3">
                <li><span className="text-primary-foreground/70 text-sm">Investment Advisory</span></li>
                <li><span className="text-primary-foreground/70 text-sm">Property Acquisition</span></li>
                <li><span className="text-primary-foreground/70 text-sm">Asset Management</span></li>
                <li><span className="text-primary-foreground/70 text-sm">Development Consulting</span></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-6">Contact Us</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="text-primary-foreground/70 text-sm">
                    <p className="font-medium text-white">3B SolutionPH Corp.</p>
                    <p>7th Floor Unit 710, High Street South Corporate Plaza, Tower 2</p>
                    <p>26th Street Corner 11th Ave., Bonifacio Global City</p>
                    <p>1630 Taguig City, Philippines</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-secondary mt-0.5 flex-shrink-0" />
                  <div className="text-primary-foreground/70 text-sm">
                    <p className="font-medium text-white">3B SolutionDE</p>
                    <p>Weidenweg 17, 15806 Zossen, Germany</p>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary flex-shrink-0" />
                  <a href="mailto:info@3bsolution.de" className="text-primary-foreground/70 hover:text-white text-sm">
                    info@3bsolution.de
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-5 h-5 text-secondary flex-shrink-0 flex items-center justify-center text-xs font-bold">www</span>
                  <a href="https://www.3bsolution.com" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/70 hover:text-white text-sm">
                    www.3bsolution.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 py-6">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/60">
            <p>© {new Date().getFullYear()} 3B Solution. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/legal/terms-of-service" className="hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/legal/imprint" className="hover:text-white transition-colors">
                Imprint
              </Link>
            </div>
          </div>
          <p className="text-center text-xs text-primary-foreground/50 mt-4">
            Investment involves risk. Past performance is not indicative of future results. 
            Please consult with a qualified financial advisor before making investment decisions.
          </p>
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
    </div>
  );
}
