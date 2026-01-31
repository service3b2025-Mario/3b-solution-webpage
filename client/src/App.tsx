import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation } from "wouter";
import { useEffect } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Properties from "./pages/Properties";
import PropertyDetail from "./pages/PropertyDetail";
import Services from "./pages/Services";
import About from "./pages/About";
import MarketInsights from "./pages/MarketInsights";
import SuccessStories from "./pages/SuccessStories";
import Contact from "./pages/Contact";
import Admin from "./pages/Admin";
import LegalPage from "./pages/LegalPage";
import Investors from "./pages/Investors";
import SoutheastAsia from "./pages/investments/SoutheastAsia";
import Philippines from "./pages/investments/Philippines";
import Maldives from "./pages/investments/Maldives";
import Europe from "./pages/investments/Europe";
import USA from "./pages/investments/USA";
import Caribbean from "./pages/investments/Caribbean";
import MyWishlist from "./pages/MyWishlist";
import MySavedSearches from "./pages/MySavedSearches";
import MyTours from "./pages/MyTours";
import UHNWIPage from "./pages/investors/UHNWI";
import InstitutionalPage from "./pages/investors/Institutional";
import FamilyOfficesPage from "./pages/investors/FamilyOffices";
import IndividualPage from "./pages/investors/Individual";
import Team from "./pages/Team";
import NotFound from "@/pages/NotFound";
import { MobileContactMenu } from "@/components/MobileContactMenu";
import { PageTransition } from "@/components/PageTransition";
import { CookieLanguageSelector } from "./components/CookieLanguageSelector";

function Router() {
  const [location] = useLocation();
  
  // Scroll to top whenever route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
  return (
    <PageTransition>
      <Switch>
        <Route path="/" component={Home} />
      <Route path="/properties" component={Properties} />
      <Route path="/properties/:slug" component={PropertyDetail} />
      <Route path="/services" component={Services} />
      <Route path="/about" component={About} />
      <Route path="/team" component={Team} />
      <Route path="/market-insights" component={MarketInsights} />
      <Route path="/success-stories" component={SuccessStories} />
      <Route path="/contact" component={Contact} />
      <Route path="/investors" component={Investors} />
      <Route path="/investors/uhnwi" component={UHNWIPage} />
      <Route path="/investors/institutional" component={InstitutionalPage} />
      <Route path="/investors/family-offices" component={FamilyOfficesPage} />
      <Route path="/investors/individual" component={IndividualPage} />
      <Route path="/investors/private" component={IndividualPage} />
      <Route path="/investments/southeast-asia" component={SoutheastAsia} />
      <Route path="/investments/philippines" component={Philippines} />
      <Route path="/investments/maldives" component={Maldives} />
      <Route path="/investments/europe" component={Europe} />
      <Route path="/investments/usa" component={USA} />
      <Route path="/investments/caribbean" component={Caribbean} />
      <Route path="/my-wishlist" component={MyWishlist} />
        <Route path="/my-saved-searches" component={MySavedSearches} />
        <Route path="/my-tours" component={MyTours} />
      <Route path="/admin/:section?" component={Admin} />
      <Route path="/legal/:slug" component={LegalPage} />
      <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </PageTransition>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <MobileContactMenu />
          <Router />
          <CookieLanguageSelector />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
