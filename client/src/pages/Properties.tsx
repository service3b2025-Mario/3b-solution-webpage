import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Search, Grid3X3, List, MapPin, Building2, Filter, ChevronDown, Map, Scale, Heart } from "lucide-react";
import PropertyDetailModal from "@/components/PropertyDetailModal";
import PropertyMap from "@/components/PropertyMap";
import { ImageGallery } from "@/components/ImageGallery";
import { PropertyComparisonModal } from "@/components/PropertyComparisonModal";
import { Checkbox } from "@/components/ui/checkbox";
import { WishlistButton } from "@/components/WishlistButton";
import { SavedSearchModal } from "@/components/SavedSearchModal";
import { AdvancedFilters } from "@/components/AdvancedFilters";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Bookmark } from "lucide-react";
import { QuickFilterChips } from "@/components/QuickFilterChips";
import { LocationHierarchyDropdown } from "@/components/LocationHierarchyDropdown";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { InteractiveWorldMap } from "@/components/InteractiveWorldMap";
import { Breadcrumb } from "@/components/Breadcrumb";

const regions = [
  { value: "all", label: "All Regions" },
  { value: "Philippines", label: "Philippines" },
  { value: "SouthEastAsia", label: "South East Asia" },
  { value: "Maldives", label: "Maldives" },
  { value: "Europe", label: "Europe" },
  { value: "NorthAmerica", label: "North America" },
  { value: "Caribbean", label: "Caribbean" },
];

const propertyTypes = [
  { value: "all", label: "All Types" },
  { value: "Hospitality", label: "Hospitality" },
  { value: "Island", label: "Island" },
  { value: "Resort", label: "Resort" },
  { value: "CityHotel", label: "City Hotel" },
  { value: "CountrysideHotel", label: "Countryside Hotel" },
  { value: "MixedUse", label: "Mixed-Use" },
  { value: "Office", label: "Office" },
  { value: "CityLand", label: "City Land" },
  { value: "Land", label: "Land" },
  { value: "Residential", label: "Residential" },
  { value: "Retail", label: "Retail" },
  { value: "Commercial", label: "Commercial" },
  { value: "Lot", label: "Lot" },
  { value: "HouseAndLot", label: "House & Lot" },
];

const priceRanges = [
  { value: "all", label: "All Prices" },
  { value: "0-5000000", label: "Under $5M" },
  { value: "5000000-15000000", label: "$5M - $15M" },
  { value: "15000000-50000000", label: "$15M - $50M" },
  { value: "50000000-100000000", label: "$50M - $100M" },
  { value: "100000000-999999999", label: "$100M+" },
];

export default function Properties() {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map" | "worldmap">("grid");
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [locationType, setLocationType] = useState<"country" | "region" | "continent">("country");
  const [propertyType, setPropertyType] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedProperty, setSelectedProperty] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [comparisonProperties, setComparisonProperties] = useState<any[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isSaveSearchOpen, setIsSaveSearchOpen] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState<{
    priceRange: [number, number];
    amenities: string[];
    bedrooms?: number;
  }>({ priceRange: [0, 10000000], amenities: [] });
  const [currentLimit, setCurrentLimit] = useState(20);
  const [isFilterSticky, setIsFilterSticky] = useState(false);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isPortrait, setIsPortrait] = useState(true);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const { user } = useAuth();

  // Temporary filter state (only applied when user taps "Apply Filters")
  const [tempSearch, setTempSearch] = useState("");
  const [tempSelectedLocation, setTempSelectedLocation] = useState<string>("");
  const [tempLocationType, setTempLocationType] = useState<"country" | "region" | "continent">("country");
  const [tempPropertyType, setTempPropertyType] = useState("all");
  const [tempPriceRange, setTempPriceRange] = useState("all");

  // Calculate active filter count
  const activeFilterCount = [
    selectedLocation !== "",
    propertyType !== "all",
    priceRange !== "all",
    search !== ""
  ].filter(Boolean).length;

  // Track scroll position for sticky filter shadow and auto-hide behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const landscapeMode = window.innerWidth > window.innerHeight;
      const isDesktop = window.innerWidth >= 768; // md breakpoint
      
      // Update landscape state
      setIsLandscape(landscapeMode);
      
      // Update sticky shadow effect
      setIsFilterSticky(currentScrollY > 200);
      
      // Auto-hide logic for desktop only (not mobile)
      if (isDesktop && !isMobileDevice) {
        // Scrolling up - hide filter bar
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setIsFilterVisible(false);
        }
        // Scrolling down - show filter bar
        else if (currentScrollY < lastScrollY) {
          setIsFilterVisible(true);
        }
      } else {
        // Always show filter bar on mobile devices
        setIsFilterVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, isMobileDevice]);

  // Initialize temp filters when modal opens
  useEffect(() => {
    if (isMobileFilterOpen) {
      setTempSearch(search);
      setTempSelectedLocation(selectedLocation);
      setTempLocationType(locationType);
      setTempPropertyType(propertyType);
      setTempPriceRange(priceRange);
    }
  }, [isMobileFilterOpen]);

  // Apply temporary filters to actual filters
  const applyFilters = () => {
    setSearch(tempSearch);
    setSelectedLocation(tempSelectedLocation);
    setLocationType(tempLocationType);
    setPropertyType(tempPropertyType);
    setPriceRange(tempPriceRange);
    setIsMobileFilterOpen(false);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setTempSearch("");
    setTempSelectedLocation("");
    setTempLocationType("country");
    setTempPropertyType("all");
    setTempPriceRange("all");
  };

  // Lock body scroll when mobile filter modal is open
  useEffect(() => {
    if (isMobileFilterOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore body scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileFilterOpen]);

    // Read URL parameters on mount to set initial filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const regionParam = params.get('region');
    const locationParam = params.get('location');
    const typeParam = params.get('type');
    const priceParam = params.get('price');
    
    // Keep the original region state assignment
    if (regionParam) setRegion(regionParam);
    
    // ALSO map region parameter to selectedLocation for the LocationHierarchyDropdown
    if (regionParam) {
      setSelectedLocation(regionParam);
      // Determine location type based on region value
      if (regionParam === 'Philippines' || regionParam === 'Maldives') {
        setLocationType('country');
      } else if (regionParam === 'NorthAmerica' || regionParam === 'SouthEastAsia' || regionParam === 'Caribbean' || regionParam === 'Europe') {
        setLocationType('region');
      }
    }
    if (locationParam) setSelectedLocation(locationParam);
    if (typeParam) setPropertyType(typeParam);
    if (priceParam) setPriceRange(priceParam);
  }, []);
  
  // Detect orientation changes
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      setIsPortrait(portrait);
      setIsLandscape(!portrait);
    };
    
    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  // Lock background scroll when filter modal is open (BOTH portrait AND landscape)
  useEffect(() => {
    if (isMobileFilterOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;
      setScrollPosition(scrollY);
      
      // Lock body scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.overflow = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isMobileFilterOpen]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileFilterOpen) {
        setIsMobileFilterOpen(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobileFilterOpen]);

  // Handle orientation changes to stabilize modal (removed to prevent auto-scrolling)
  // The modal now uses CSS-only stabilization with touchAction and overscrollBehavior

  // Fetch property counts by region
  const { data: propertyCounts } = trpc.properties.countsByRegion.useQuery();
  const { data: typeCounts } = trpc.properties.countsByType.useQuery();

  const handlePropertyClick = (property: any, e: React.MouseEvent) => {
    e.preventDefault();
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const toggleComparison = (property: any) => {
    setComparisonProperties(prev => {
      const exists = prev.find(p => p.id === property.id);
      if (exists) {
        return prev.filter(p => p.id !== property.id);
      } else if (prev.length < 3) {
        return [...prev, property];
      }
      return prev;
    });
  };

  const removeFromComparison = (id: number) => {
    setComparisonProperties(prev => prev.filter(p => p.id !== id));
  };

  const clearComparison = () => {
    setComparisonProperties([]);
  };

  const filters: any = { limit: currentLimit };
  // Region filter removed - using only selectedLocation to fix region switching issue
  if (selectedLocation) {
    filters.location = selectedLocation;
    filters.locationType = locationType;
  }
  if (propertyType !== "all") filters.propertyType = propertyType;
  if (search) filters.search = search;
  if (priceRange !== "all") {
    const [min, max] = priceRange.split("-").map(Number);
    filters.minPrice = min;
    filters.maxPrice = max;
  }

  const { data: properties, isLoading } = trpc.properties.list.useQuery(filters);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Properties" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Investment Properties
            </h1>
            <p className="text-xl text-white/80">
              Discover exclusive real estate opportunities across our global portfolio
            </p>
          </div>
        </div>
      </section>

      {/* Filters Section */}
      <section className={`bg-card border-b border-border sticky top-0 md:top-20 z-40 transition-all duration-300 ${isFilterSticky ? 'shadow-lg' : ''} ${!isFilterVisible && !isMobileDevice && (typeof window === 'undefined' || window.innerWidth >= 768) ? 'md:-translate-y-full md:opacity-0' : 'md:translate-y-0 md:opacity-100'}`}>
        {/* Mobile Filter Bar - Horizontal with Active Filters - ALWAYS SHOW ON MOBILE DEVICES (portrait AND landscape) */}
        <div className={`py-3 px-4 border-b border-border bg-background ${isMobileDevice || typeof window !== 'undefined' && window.innerWidth < 1024 ? 'block' : 'hidden'}`}>
          <div className="flex items-center gap-2">
            {/* Active Filters Display */}
            {(selectedLocation || propertyType !== "all" || priceRange !== "all" || search) && (
              <div className="flex items-center gap-2 flex-1 min-w-0 overflow-x-auto scrollbar-hide">
                <span className="text-xs font-medium text-muted-foreground whitespace-nowrap flex-shrink-0">Filters:</span>
                <div className="flex gap-2">
                  {selectedLocation && (
                    <Badge variant="secondary" className="gap-1 whitespace-nowrap flex-shrink-0">
                      {selectedLocation}
                      <button
                        onClick={() => setSelectedLocation("")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {propertyType !== "all" && (
                    <Badge variant="secondary" className="gap-1 whitespace-nowrap flex-shrink-0">
                      {propertyTypes.find(t => t.value === propertyType)?.label}
                      <button
                        onClick={() => setPropertyType("all")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {priceRange !== "all" && (
                    <Badge variant="secondary" className="gap-1 whitespace-nowrap flex-shrink-0">
                      {priceRanges.find(p => p.value === priceRange)?.label}
                      <button
                        onClick={() => setPriceRange("all")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {search && (
                    <Badge variant="secondary" className="gap-1 whitespace-nowrap flex-shrink-0">
                      Search: {search}
                      <button
                        onClick={() => setSearch("")}
                        className="ml-1 hover:bg-muted rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              </div>
            )}
            
            {/* Filters Button - Right Aligned */}
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsMobileFilterOpen(true)}
              className="relative flex-shrink-0 ml-auto"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilterCount > 0 && (
                <span className="ml-1.5 bg-white text-primary font-semibold text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Filter Modal Overlay - Portrait Mode */}
        {isMobileFilterOpen && isPortrait && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 w-full bg-black/50 backdrop-blur-sm z-[9998]"
              style={{ 
                height: '100dvh',
                width: '100vw',
                touchAction: 'none',
                WebkitOverflowScrolling: 'auto',
                position: 'fixed',
                top: 0,
                left: 0
              }}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            
            {/* Modal Content - Portrait Full Screen Overlay */}
            <div 
              className="fixed inset-0 w-full bg-background z-[9999] flex flex-col" 
              style={{ 
                height: '100dvh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Modal Header - Fixed */}
              <div className="flex-shrink-0 bg-background border-b border-border px-4 py-4 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5" />
                  <h2 className="text-lg font-semibold">Filter Properties</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Filter Content - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto px-4 space-y-6 py-6" 
                style={{ 
                  minHeight: 0,
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
              >
                {/* Quick Filter Chips */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Popular Destinations</h3>
                  <QuickFilterChips
                    selectedLocation={tempSelectedLocation}
                    onLocationSelect={(location, type) => {
                      setTempSelectedLocation(location);
                      setTempLocationType(type);
                    }}
                    propertyCounts={propertyCounts}
                  />
                </div>

                {/* Advanced Filters */}
                <div className="space-y-5 pt-4 border-t border-border">
                  {/* Search */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search properties..."
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        className="pl-10 h-12"
                      />
                    </div>
                  </div>

                  {/* Location Dropdown */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Location</label>
                    <LocationHierarchyDropdown
                      selectedLocation={tempSelectedLocation}
                      onLocationSelect={(location, type) => {
                        setTempSelectedLocation(location);
                        setTempLocationType(type);
                      }}
                      propertyCounts={propertyCounts}
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Property Type</label>
                    <Select value={tempPropertyType} onValueChange={setTempPropertyType}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="All Property Types" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        {propertyTypes.map((t) => {
                          const count = t.value === "all" ? null : typeCounts?.[t.value] || 0;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}{count !== null && ` (${count})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-sm font-semibold mb-2 block">Price Range</label>
                    <Select value={tempPriceRange} onValueChange={setTempPriceRange}>
                      <SelectTrigger className="w-full h-12">
                        <SelectValue placeholder="All Price Ranges" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        {priceRanges.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom */}
              <div className="flex-shrink-0 bg-background border-t border-border p-4 shadow-lg space-y-3">
                <Button
                  onClick={applyFilters}
                  className="w-full"
                  size="lg"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}

        {/* Mobile Filter Modal Overlay - Landscape Mode */}
        {isMobileFilterOpen && isLandscape && createPortal(
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 w-full bg-black/50 backdrop-blur-sm z-[9998]"
              style={{ 
                height: '100dvh',
                width: '100vw',
                touchAction: 'none',
                position: 'fixed',
                top: 0,
                left: 0
              }}
              onClick={() => setIsMobileFilterOpen(false)}
            />
            
            {/* Modal Content - Landscape Compact View */}
            <div 
              className="fixed inset-0 w-full bg-background z-[9999] flex flex-col" 
              style={{ 
                height: '100dvh',
                width: '100vw',
                position: 'fixed',
                top: 0,
                left: 0,
                touchAction: 'pan-y',
                WebkitOverflowScrolling: 'touch',
                overscrollBehavior: 'contain'
              }}
            >
              {/* Modal Header - Fixed */}
              <div className="flex-shrink-0 bg-background border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <h2 className="text-base font-semibold">Filter Properties</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Filter Content - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto px-4 space-y-4 py-4" 
                style={{ 
                  minHeight: 0,
                  WebkitOverflowScrolling: 'touch',
                  overscrollBehavior: 'contain'
                }}
              >
                {/* Quick Filter Chips */}
                <div>
                  <h3 className="text-xs font-semibold mb-2">Popular Destinations</h3>
                  <QuickFilterChips
                    selectedLocation={tempSelectedLocation}
                    onLocationSelect={(location, type) => {
                      setTempSelectedLocation(location);
                      setTempLocationType(type);
                    }}
                    propertyCounts={propertyCounts}
                  />
                </div>

                {/* Advanced Filters - Compact Grid */}
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                  {/* Search */}
                  <div className="col-span-2">
                    <label className="text-xs font-semibold mb-1.5 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="Search properties..."
                        value={tempSearch}
                        onChange={(e) => setTempSearch(e.target.value)}
                        className="pl-9 h-10 text-sm"
                      />
                    </div>
                  </div>

                  {/* Location Dropdown */}
                  <div className="col-span-2">
                    <label className="text-xs font-semibold mb-1.5 block">Location</label>
                    <LocationHierarchyDropdown
                      selectedLocation={tempSelectedLocation}
                      onLocationSelect={(location, type) => {
                        setTempSelectedLocation(location);
                        setTempLocationType(type);
                      }}
                      propertyCounts={propertyCounts}
                    />
                  </div>

                  {/* Property Type */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Property Type</label>
                    <Select value={tempPropertyType} onValueChange={setTempPropertyType}>
                      <SelectTrigger className="w-full h-10 text-sm">
                        <SelectValue placeholder="All Types" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        {propertyTypes.map((t) => {
                          const count = t.value === "all" ? null : typeCounts?.[t.value] || 0;
                          return (
                            <SelectItem key={t.value} value={t.value}>
                              {t.label}{count !== null && ` (${count})`}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="text-xs font-semibold mb-1.5 block">Price Range</label>
                    <Select value={tempPriceRange} onValueChange={setTempPriceRange}>
                      <SelectTrigger className="w-full h-10 text-sm">
                        <SelectValue placeholder="All Prices" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000]">
                        {priceRanges.map((p) => (
                          <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Fixed at Bottom - Compact */}
              <div className="flex-shrink-0 bg-background border-t border-border p-3 shadow-lg flex gap-3">
                <Button
                  onClick={applyFilters}
                  className="flex-1"
                  size="default"
                >
                  Apply Filters
                </Button>
                <Button
                  onClick={clearAllFilters}
                  variant="outline"
                  className="flex-1"
                  size="default"
                >
                  Clear All
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}

        {/* Filter Content - Desktop Only (Always Visible) - ONLY on desktop devices with large screens, NOT on mobile devices */}
        <div className={`container space-y-4 md:py-6 ${!isMobileDevice && (typeof window === 'undefined' || window.innerWidth >= 1024) ? 'block' : 'hidden'}`}>
          {/* Quick Filter Chips */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Destinations</h3>
            <QuickFilterChips
              selectedLocation={selectedLocation}
              onLocationSelect={(location, type) => {
                setSelectedLocation(location);
                setLocationType(type);
              }}
              propertyCounts={propertyCounts}
            />
          </div>

          {/* Advanced Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center pt-4 border-t border-border">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search properties..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <LocationHierarchyDropdown
                selectedLocation={selectedLocation}
                onLocationSelect={(location, type) => {
                  setSelectedLocation(location);
                  setLocationType(type);
                }}
                propertyCounts={propertyCounts}
              />

              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((t) => {
                    const count = t.value === "all" ? null : typeCounts?.[t.value] || 0;
                    return (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}{count !== null && ` (${count})`}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Save Search Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!user) {
                  toast.error("Please sign in to save searches", {
                    action: {
                      label: "Sign In",
                      onClick: () => window.location.href = getLoginUrl(),
                    },
                  });
                  return;
                }
                setIsSaveSearchOpen(true);
              }}
              className="whitespace-nowrap"
            >
              <Bookmark className="w-4 h-4 mr-2" />
              Save Search
            </Button>

            {/* View Toggle */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("map")}
                title="Map View"
              >
                <MapPin className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "worldmap" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("worldmap")}
                title="World Map"
              >
                <Map className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Active Filters Display */}
          {(selectedLocation || propertyType !== "all" || priceRange !== "all" || search) && (
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {selectedLocation && (
                <Badge variant="secondary" className="gap-1">
                  {selectedLocation}
                  <button
                    onClick={() => setSelectedLocation("")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {propertyType !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {propertyTypes.find(t => t.value === propertyType)?.label}
                  <button
                    onClick={() => setPropertyType("all")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {priceRange !== "all" && (
                <Badge variant="secondary" className="gap-1">
                  {priceRanges.find(p => p.value === priceRange)?.label}
                  <button
                    onClick={() => setPriceRange("all")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="gap-1">
                  Search: {search}
                  <button
                    onClick={() => setSearch("")}
                    className="ml-1 hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedLocation("");
                  setPropertyType("all");
                  setPriceRange("all");
                  setSearch("");
                }}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Properties Grid */}
      <section className="py-12 pb-96 md:pb-12 bg-muted/30">
        <div className="container">
          {/* Results Count */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-muted-foreground">
              {properties?.total || 0} properties found
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-56 bg-muted" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2" />
                    <div className="h-6 bg-muted rounded w-3/4 mb-4" />
                    <div className="h-4 bg-muted rounded w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : viewMode === "worldmap" ? (
            <div className="mb-8">
              <InteractiveWorldMap
                selectedLocation={selectedLocation}
                onLocationSelect={(location, type) => {
                  setSelectedLocation(location);
                  setLocationType(type);
                }}
                propertyCounts={propertyCounts}
              />
              
              {/* Show filtered properties below the map */}
              {selectedLocation && (
                <div className="mt-8">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">
                      Properties in {selectedLocation}
                    </h3>
                    <p className="text-muted-foreground">
                      {properties?.total || 0} {properties?.total === 1 ? 'property' : 'properties'} found
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(properties?.items || []).slice(0, 6).map((property) => (
                      <div key={property.id} onClick={(e) => handlePropertyClick(property, e)}>
                        <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 h-full">
                          <div 
                            className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 relative overflow-hidden"
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
                                loading={index < 6 ? "eager" : "lazy"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Building2 className="w-12 h-12 text-primary/30" />
                              </div>
                            )}
                            <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary">
                              {property.propertyType}
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <MapPin className="w-3 h-3" />
                              {property.city}, {property.country}
                            </div>
                            <h3 className="text-base font-semibold text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                              {property.title}
                            </h3>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                  {(properties?.total || 0) > 6 && (
                    <div className="mt-6 text-center">
                      <Button
                        variant="outline"
                        onClick={() => setViewMode("grid")}
                      >
                        View All {properties?.total} Properties
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : viewMode === "map" ? (
            <PropertyMap
              properties={(properties?.items || []).map(p => ({
                id: p.id,
                title: p.title,
                region: p.region,
                country: p.country,
                city: p.city,
                latitude: p.latitude ? parseFloat(String(p.latitude)) : 0,
                longitude: p.longitude ? parseFloat(String(p.longitude)) : 0,
                propertyType: p.propertyType,
                priceMin: p.priceMin ? String(p.priceMin) : null,
                expectedReturn: p.expectedReturn ? String(p.expectedReturn) : null,
                offMarket: p.offMarket || false,
              })).filter(p => p.offMarket || (p.latitude !== 0 && p.longitude !== 0))}
              onPropertyClick={(property) => {
                const fullProperty = properties?.items.find(p => p.id === property.id);
                if (fullProperty) {
                  setSelectedProperty(fullProperty);
                  setIsModalOpen(true);
                }
              }}
              className="mb-8"
            />
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(properties?.items || []).map((property) => (
                <div key={property.id} onClick={(e) => handlePropertyClick(property, e)}>
                  <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 overflow-hidden border-0 h-full">
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
                      {/* Comparison Checkbox */}
                      <div 
                        className="absolute top-3 left-3 z-10 bg-white rounded-md p-2 shadow-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Checkbox
                          checked={comparisonProperties.some(p => p.id === property.id)}
                          onCheckedChange={() => toggleComparison(property)}
                          disabled={comparisonProperties.length >= 3 && !comparisonProperties.some(p => p.id === property.id)}
                        />
                      </div>
                      {/* Wishlist Button */}
                      <WishlistButton propertyId={property.id} />
                      {property.mainImage ? (
                        <img 
                          src={property.mainImage} 
                          alt={property.title}
                          loading={index < 6 ? "eager" : "lazy"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-16 h-16 text-primary/30" />
                        </div>
                      )}
                      {property.featured && (
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                          Featured
                        </div>
                      )}
                      {/* Status Watermarks */}
                      {property.status === 'offMarket' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-white text-4xl font-bold tracking-[0.3em] transform -rotate-12 opacity-80 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                            OFF-MARKET
                          </div>
                        </div>
                      )}
                      {property.status === 'reserved' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-yellow-400 text-4xl font-bold tracking-[0.3em] transform -rotate-12 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                            RESERVED
                          </div>
                        </div>
                      )}
                      {property.status === 'sold' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="text-red-500 text-4xl font-bold tracking-[0.3em] transform -rotate-12 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                            SOLD
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
          ) : (
            <div className="space-y-4">
              {(properties?.items || []).map((property) => (
                <div key={property.id} onClick={(e) => handlePropertyClick(property, e)}>
                  <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0">
                    <div className="flex flex-col md:flex-row">
                      <div 
                        className="w-full md:w-72 h-48 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20 relative flex-shrink-0"
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
                            loading={index < 6 ? "eager" : "lazy"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-12 h-12 text-primary/30" />
                          </div>
                        )}
                        {property.featured && (
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-secondary text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                            Featured
                          </div>
                        )}
                        {/* Status Watermarks */}
                        {property.status === 'offMarket' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-white text-3xl font-bold tracking-[0.3em] transform -rotate-12 opacity-80 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                              OFF-MARKET
                            </div>
                          </div>
                        )}
                        {property.status === 'reserved' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-yellow-400 text-3xl font-bold tracking-[0.3em] transform -rotate-12 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                              RESERVED
                            </div>
                          </div>
                        )}
                        {property.status === 'sold' && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="text-red-500 text-3xl font-bold tracking-[0.3em] transform -rotate-12 opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)]">
                              SOLD
                            </div>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-6 flex-1">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <MapPin className="w-4 h-4" />
                              {property.city}, {property.country}
                              <span className="px-2 py-0.5 bg-muted rounded text-xs">{property.propertyType}</span>
                            </div>
                            <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                              {property.title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2">
                              {property.shortDescription}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {properties && properties.items.length < properties.total && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setCurrentLimit(prev => prev + 20)}
              >
                Load More Properties
                <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </section>
      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty ? {
          ...selectedProperty,
          location: `${selectedProperty.city || ''}, ${selectedProperty.country || ''}`,
          description: selectedProperty.description || selectedProperty.shortDescription,
          price: selectedProperty.priceMin || 0,
        } : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        similarProperties={(properties?.items || []).filter(p => p.id !== selectedProperty?.id).slice(0, 3) as any}
      />
      {comparisonProperties.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-white shadow-2xl rounded-lg border-2 border-primary p-4 w-[320px] max-w-[90vw]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm">Compare Properties ({comparisonProperties.length}/3)</span>
            </div>
            <Button variant="ghost" size="sm" onClick={clearComparison} className="text-xs px-2 h-7">
              Clear All
            </Button>
          </div>
          <div className="flex flex-col gap-2 mb-3 max-h-[180px] overflow-y-auto">
            {comparisonProperties.map((property) => (
              <div key={property.id} className="flex items-center justify-between bg-muted rounded p-2 text-sm">
                <div className="flex-1 min-w-0 mr-2">
                  <div className="font-medium truncate text-xs">{property.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{property.region}</div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 flex-shrink-0"
                  onClick={() => removeFromComparison(property.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
          <Button 
            className="w-full" 
            onClick={() => setIsComparisonOpen(true)}
            disabled={comparisonProperties.length < 2}
          >
            Compare Now
          </Button>
        </div>
      )}

      {/* Image Gallery Lightbox */}
      <ImageGallery
        images={galleryImages}
        initialIndex={galleryIndex}
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      {/* Floating Comparison Bar */}
      

      {/* Property Comparison Modal */}
      <PropertyComparisonModal
        properties={comparisonProperties}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        onRemove={removeFromComparison}
      />

      {/* Saved Search Modal */}
      <SavedSearchModal
        open={isSaveSearchOpen}
        onOpenChange={setIsSaveSearchOpen}
        filters={{
          region: region !== "all" ? region : undefined,
          propertyType: propertyType !== "all" ? propertyType : undefined,
          priceMin: priceRange !== "all" ? parseInt(priceRange.split("-")[0]) : undefined,
          priceMax: priceRange !== "all" ? parseInt(priceRange.split("-")[1]) : undefined,
        }}
      />
    </Layout>
  );
}
