import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { useParams, Link } from "wouter";
import { toast } from "sonner";
import { 
  Building2, Users, FileText, BarChart3, Calendar, Mail, 
  TrendingUp, Globe, Settings, Home, LogOut, Plus, Eye, Edit, Trash2,
  ChevronRight, ChevronLeft, Bell, DollarSign, Target, X, MessageSquare, Phone, Maximize2, Minimize2,
  Linkedin, Facebook, Instagram, Save, ExternalLink, Shield, UserCog
} from "lucide-react";
import { MediaUpload } from "@/components/MediaUpload";
import { SalesFunnelDashboard } from "@/components/SalesFunnelDashboard";
import { LeadsManagement } from "@/components/LeadsManagement";
import { LeadDetailModal } from "@/components/LeadDetailModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import APICredentials from "./admin/APICredentials";
import BookingConfirmationModal from "@/components/BookingConfirmationModal";
import FeedbackAnalytics from "./admin/FeedbackAnalytics";
import ContentManagement from "./admin/ContentManagement";
import { TeamMemberEditDialog } from "@/components/TeamMemberEditDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DownloadAnalytics } from "@/components/DownloadAnalytics";
import { RealPropertyNameWidget } from "@/components/RealPropertyNameWidget";
import { AdminLoginForm } from "@/components/AdminLoginForm";
import { CRMDashboard } from "@/components/crm/CRMDashboard";
import { SalesFunnelAnalytics } from "@/components/crm/SalesFunnelAnalytics";
import { ChannelPerformance } from "@/components/crm/ChannelPerformance";
import { CustomerExpansion } from "@/components/crm/CustomerExpansion";
import { WhatsAppSettings } from "@/components/admin/WhatsAppSettings";
import { ResetDataButton } from "@/components/admin/ResetDataButton";
import { EnhancedAnalyticsDashboard } from "@/components/analytics/EnhancedAnalyticsDashboard";
import { useRBAC, type Resource } from "@/hooks/useRBAC";
import { UserManagement } from "@/components/admin/UserManagement";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";

// Sidebar items with resource mapping for RBAC
const allSidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3, resource: "dashboards" as Resource },
  { id: "crm-dashboard", label: "CRM Dashboard", icon: Target, resource: "crmDashboard" as Resource },
  { id: "sales-funnel", label: "Sales Funnel", icon: TrendingUp, resource: "crmDashboard" as Resource },
  { id: "channels", label: "Channels", icon: Globe, resource: "crmDashboard" as Resource },
  { id: "expansion", label: "Customer Expansion", icon: DollarSign, resource: "crmDashboard" as Resource },
  { id: "properties", label: "Properties", icon: Building2, resource: "properties" as Resource },
  { id: "leads", label: "Leads", icon: Mail, resource: "leads" as Resource },
  { id: "bookings", label: "Bookings", icon: Calendar, resource: "bookings" as Resource },
  { id: "downloads", label: "Downloads", icon: FileText, resource: "dashboards" as Resource },
  { id: "feedback", label: "Tour Feedback", icon: MessageSquare, resource: "dashboards" as Resource },
  { id: "team", label: "Team", icon: Users, resource: "teamMembers" as Resource },
  { id: "content", label: "Content", icon: FileText, resource: "content" as Resource },
  { id: "analytics", label: "Analytics", icon: TrendingUp, resource: "dashboards" as Resource },
  { id: "api-credentials", label: "API Credentials", icon: Settings, resource: "apiCredentials" as Resource },
  { id: "whatsapp", label: "WhatsApp", icon: Phone, resource: "systemSettings" as Resource },
  { id: "user-management", label: "User Management", icon: UserCog, resource: "userManagement" as Resource },
  { id: "settings", label: "Settings", icon: Settings, resource: "systemSettings" as Resource },
];

export default function Admin() {
  const { user, loading, logout } = useAuth();
  const { section = "dashboard" } = useParams<{ section?: string }>();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // RBAC hook for permission checking
  const { 
    userRole, 
    roleName, 
    canAccess, 
    canCreate, 
    canUpdate, 
    canDelete,
    isAdmin 
  } = useRBAC();

  // Filter sidebar items based on user permissions
  const sidebarItems = allSidebarItems.filter(item => canAccess(item.resource));

  // Fetch data
  const { data: properties } = trpc.properties.list.useQuery({});
  const { data: leads } = trpc.leads.list.useQuery({});
  const { data: bookings } = trpc.bookings.list.useQuery({});
  const { data: analytics } = trpc.analytics.summary.useQuery({});
  const { data: teamMembers } = trpc.team.list.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <AdminLoginForm onSuccess={() => window.location.reload()} />;
  }

  // Check if user has any admin access (role is admin in database)
  if (user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access the admin portal</p>
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user can access the current section
  const currentSidebarItem = allSidebarItems.find(item => item.id === section);
  const canAccessCurrentSection = currentSidebarItem ? canAccess(currentSidebarItem.resource) : true;

  if (!canAccessCurrentSection && section !== "dashboard") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Section Restricted</h1>
            <p className="text-muted-foreground mb-4">
              Your role ({roleName}) doesn't have access to this section.
            </p>
            <Link href="/admin/dashboard">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Sidebar */}
      <aside className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-card border-r border-border flex flex-col transition-all duration-300`}>
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">3B</span>
              </div>
              {!sidebarCollapsed && (
                <div>
                  <span className="font-semibold text-foreground">3B Solution</span>
                  <p className="text-xs text-muted-foreground">Admin Portal</p>
                </div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="h-8 w-8"
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            </Button>
          </div>
        </div>

        {/* Role Badge */}
        {!sidebarCollapsed && (
          <div className="px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2 text-xs">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-muted-foreground">Role:</span>
              <Badge variant="secondary" className="text-xs">{roleName}</Badge>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <li key={item.id}>
                <Link href={`/admin/${item.id}`}>
                  <span className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    section === item.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}>
                    <item.icon className="w-5 h-5" />
                    {!sidebarCollapsed && item.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-border">
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user.name?.charAt(0) || user.email?.charAt(0) || "A"}
              </span>
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name || "Admin"}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => logout()}
              className="h-8 w-8 text-muted-foreground hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Permission-aware content rendering */}
          {section === "dashboard" && canAccess("dashboards") && <DashboardSection analytics={analytics} properties={properties} leads={leads} bookings={bookings} canUpdate={canUpdate("dashboards")} />}
          {section === "crm-dashboard" && canAccess("crmDashboard") && <CRMDashboard />}
          {section === "sales-funnel" && canAccess("crmDashboard") && <SalesFunnelAnalytics />}
          {section === "channels" && canAccess("crmDashboard") && <ChannelPerformance />}
          {section === "expansion" && canAccess("crmDashboard") && <CustomerExpansion />}
          {section === "properties" && canAccess("properties") && (
            <PropertiesSection 
              properties={properties} 
              canCreate={canCreate("properties")}
              canUpdate={canUpdate("properties")}
              canDelete={canDelete("properties")}
            />
          )}
          {section === "leads" && canAccess("leads") && (
            <LeadsManagement 
              onSelectLead={setSelectedLead}
              canUpdate={canUpdate("leads")}
              canDelete={canDelete("leads")}
            />
          )}
          {section === "bookings" && canAccess("bookings") && (
            <BookingsSection 
              bookings={bookings}
              canUpdate={canUpdate("bookings")}
              canDelete={canDelete("bookings")}
            />
          )}
          {section === "downloads" && canAccess("dashboards") && <DownloadAnalytics />}
          {section === "feedback" && canAccess("dashboards") && <FeedbackAnalytics />}
          {section === "team" && canAccess("teamMembers") && (
            <TeamSection 
              teamMembers={teamMembers}
              canCreate={canCreate("teamMembers")}
              canUpdate={canUpdate("teamMembers")}
              canDelete={canDelete("teamMembers")}
            />
          )}
          {section === "content" && canAccess("content") && (
            <ContentManagement 
              canCreate={canCreate("content")}
              canUpdate={canUpdate("content")}
              canDelete={canDelete("content")}
            />
          )}
          {section === "analytics" && canAccess("dashboards") && <EnhancedAnalyticsDashboard />}
          {section === "api-credentials" && canAccess("apiCredentials") && <APICredentials />}
          {section === "whatsapp" && canAccess("systemSettings") && <WhatsAppSettings />}
          {section === "user-management" && canAccess("userManagement") && <UserManagement />}
          {section === "settings" && canAccess("systemSettings") && <SettingsSection isAdmin={isAdmin} />}
        </div>
      </main>

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          canUpdate={canUpdate("leads")}
        />
      )}
    </div>
  );
}

// Dashboard Section Component
function DashboardSection({ analytics, properties, leads, bookings, canUpdate }: any) {
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your real estate platform</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold text-foreground">{properties?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Leads</p>
                <p className="text-3xl font-bold text-foreground">{leads?.total || 0}</p>
              </div>
              <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Bookings</p>
                <p className="text-3xl font-bold text-foreground">{bookings?.length || 0}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-3xl font-bold text-foreground">{analytics?.totalViews || 0}</p>
              </div>
              <div className="w-12 h-12 bg-chart-4/10 rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-chart-4" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Funnel Dashboard */}
      <SalesFunnelDashboard />

      {/* Real Property Name Widget */}
      <RealPropertyNameWidget />

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Leads
              <Link href="/admin/leads">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(leads?.items || []).slice(0, 5).map((lead: any) => (
                <div 
                  key={lead.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setSelectedLead(lead)}
                >
                  <div>
                    <p className="font-medium">{lead.firstName} {lead.lastName}</p>
                    <p className="text-sm text-muted-foreground">{lead.email}</p>
                  </div>
                  <Badge variant={lead.status === "new" ? "default" : "secondary"}>
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Upcoming Bookings
              <Link href="/admin/bookings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(bookings || []).slice(0, 5).map((booking: any) => (
                <div 
                  key={booking.id} 
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                  onClick={() => setSelectedBooking(booking)}
                >
                  <div>
                    <p className="font-medium">{booking.type}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(booking.scheduledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />
      
      {/* Booking Confirmation Modal */}
      <BookingConfirmationModal
        booking={selectedBooking}
        open={!!selectedBooking}
        onOpenChange={(open) => !open && setSelectedBooking(null)}
      />
    </div>
  );
}
function PropertiesSection({ properties, canCreate, canUpdate, canDelete }: any) {
  const [editingProperty, setEditingProperty] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const createMutation = trpc.properties.create.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      setIsDialogOpen(false);
      setEditingProperty(null);
      setIsAddingProperty(false);
      toast.success("Property created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create property: ${error.message}`);
    },
  });

  const updateMutation = trpc.properties.update.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      setIsDialogOpen(false);
      setEditingProperty(null);
      toast.success("Property updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update property");
    },
  });

  const deletePropertyMutation = trpc.properties.delete.useMutation({
    onSuccess: () => {
      utils.properties.list.invalidate();
      toast.success("Property deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete property");
    },
  });

  const { data: featuredCount } = trpc.properties.getFeaturedCount.useQuery();

  const toggleFeaturedMutation = trpc.properties.toggleFeatured.useMutation({
    onMutate: async ({ id, featured }) => {
      // Cancel outgoing refetches
      await utils.properties.list.cancel();
      await utils.properties.getFeaturedCount.cancel();

      // Snapshot previous values
      const previousProperties = utils.properties.list.getData();
      const previousCount = utils.properties.getFeaturedCount.getData();

      // Optimistically update
      utils.properties.list.setData(undefined, (old) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((p) =>
            p.id === id ? { ...p, featured } : p
          ),
        };
      });

      utils.properties.getFeaturedCount.setData(undefined, (old) => {
        if (old === undefined) return old;
        return featured ? old + 1 : old - 1;
      });

      return { previousProperties, previousCount };
    },
    onSuccess: () => {
      toast.success("Featured status updated successfully");
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousProperties) {
        utils.properties.list.setData(undefined, context.previousProperties);
      }
      if (context?.previousCount !== undefined) {
        utils.properties.getFeaturedCount.setData(undefined, context.previousCount);
      }
      toast.error(error.message || "Failed to update featured status");
    },
    onSettled: () => {
      // Always refetch after error or success
      utils.properties.list.invalidate();
      utils.properties.getFeaturedCount.invalidate();
    },
  });

  const handleSave = () => {
    if (!editingProperty) return;
    
    // Transform formatted string values to proper types
    const transformedData = {
      ...editingProperty,
      // Convert formatted number strings to proper types (with NaN protection)
      landSizeSqm: editingProperty.landSizeSqm ? (isNaN(parseFloat(String(editingProperty.landSizeSqm).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.landSizeSqm).replace(/,/g, ''))) : undefined,
      landSizeHa: editingProperty.landSizeHa ? (isNaN(parseFloat(String(editingProperty.landSizeHa).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.landSizeHa).replace(/,/g, ''))) : undefined,
      landPricePerSqm: editingProperty.landPricePerSqm ? (isNaN(parseFloat(String(editingProperty.landPricePerSqm).replace(/,/g, ''))) ? null : parseFloat(String(editingProperty.landPricePerSqm).replace(/,/g, ''))) : null,
      buildingAreaSqm: editingProperty.buildingAreaSqm ? (isNaN(parseFloat(String(editingProperty.buildingAreaSqm).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.buildingAreaSqm).replace(/,/g, ''))) : undefined,
      floorAreaSqm: editingProperty.floorAreaSqm ? (isNaN(parseFloat(String(editingProperty.floorAreaSqm).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.floorAreaSqm).replace(/,/g, ''))) : undefined,
      floors: editingProperty.floors ? (isNaN(parseInt(String(editingProperty.floors).replace(/,/g, ''))) ? undefined : parseInt(String(editingProperty.floors).replace(/,/g, ''))) : undefined,
      units: editingProperty.units ? (isNaN(parseInt(String(editingProperty.units).replace(/,/g, ''))) ? undefined : parseInt(String(editingProperty.units).replace(/,/g, ''))) : undefined,
      floorAreaRatio: editingProperty.floorAreaRatio ? (isNaN(parseFloat(String(editingProperty.floorAreaRatio).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.floorAreaRatio).replace(/,/g, ''))) : undefined,
      askingPriceNet: editingProperty.askingPriceNet ? (isNaN(parseFloat(String(editingProperty.askingPriceNet).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.askingPriceNet).replace(/,/g, ''))) : undefined,
      askingPriceGross: editingProperty.askingPriceGross ? (isNaN(parseFloat(String(editingProperty.askingPriceGross).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.askingPriceGross).replace(/,/g, ''))) : undefined,
      priceMin: editingProperty.priceMin ? (isNaN(parseFloat(String(editingProperty.priceMin).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.priceMin).replace(/,/g, ''))) : undefined,
      priceMax: editingProperty.priceMax ? (isNaN(parseFloat(String(editingProperty.priceMax).replace(/,/g, ''))) ? undefined : parseFloat(String(editingProperty.priceMax).replace(/,/g, ''))) : undefined,
      // Convert string arrays (newline-separated) to actual arrays
      interiorFeatures: typeof editingProperty.interiorFeatures === 'string' 
        ? editingProperty.interiorFeatures.split('\n').filter((f: string) => f.trim())
        : editingProperty.interiorFeatures,
      exteriorFeatures: typeof editingProperty.exteriorFeatures === 'string'
        ? editingProperty.exteriorFeatures.split('\n').filter((f: string) => f.trim())
        : editingProperty.exteriorFeatures,
      // Keep imageCaptions as empty object if empty (tRPC schema requires record, not null)
      imageCaptions: editingProperty.imageCaptions && Object.keys(editingProperty.imageCaptions).length > 0 
        ? editingProperty.imageCaptions 
        : {},
    };
    
    if (isAddingProperty) {
      // Create new property
      console.log('[Admin] Creating property with transformed data:', transformedData);
      createMutation.mutate(transformedData as any);
    } else {
      // Update existing property
      updateMutation.mutate({
        id: editingProperty.id,
        data: transformedData,
      });
    }
  };

  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (scrollRef) {
      setCanScrollLeft(scrollRef.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.scrollLeft < scrollRef.scrollWidth - scrollRef.clientWidth - 1
      );
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef) {
      const scrollAmount = 400;
      scrollRef.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (scrollRef) {
      checkScroll();
      scrollRef.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        scrollRef.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [scrollRef]);

  const totalProperties = properties?.items?.length || 0;
  const availableProperties = properties?.items?.filter((p: any) => p.status === 'available').length || 0;
  const offMarketProperties = properties?.items?.filter((p: any) => p.status === 'offMarket').length || 0;
  const soldProperties = properties?.items?.filter((p: any) => p.status === 'sold').length || 0;
  const featuredProperties = properties?.items?.filter((p: any) => p.featured).length || 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button 
          className="bg-secondary hover:bg-secondary/90 text-white"
          onClick={() => {
            setIsAddingProperty(true);
            setEditingProperty({
              title: "",
              slug: "",
              shortDescription: "",
              longDescription: "",
              country: "",
              city: "",
              region: "SouthEastAsia",
              propertyType: "Hospitality",
              status: "available",
              currency: "USD",
              images: [],
              imageCaptions: {},
              videoUrl: "",
              virtualTourUrl: "",
              priceMin: "",
              priceMax: ""
            });
            setIsDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        <Card className="py-3">
          <CardHeader className="p-0 px-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Properties</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <div className="text-xl font-bold">{totalProperties}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="p-0 px-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <div className="text-xl font-bold text-green-600">{availableProperties}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="p-0 px-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Off-Market</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <div className="text-xl font-bold text-orange-600">{offMarketProperties}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="p-0 px-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Sold</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <div className="text-xl font-bold text-gray-600">{soldProperties}</div>
          </CardContent>
        </Card>
        <Card className="py-3">
          <CardHeader className="p-0 px-4 pb-1">
            <CardTitle className="text-xs font-medium text-muted-foreground">Featured</CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <div className="text-xl font-bold text-secondary">{featuredProperties}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg relative">
        {/* Scroll Controls */}
        {canScrollLeft && (
          <Button
            variant="outline"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur shadow-lg"
            onClick={() => scroll('left')}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {canScrollRight && (
          <Button
            variant="outline"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-background/95 backdrop-blur shadow-lg"
            onClick={() => scroll('right')}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        )}
        <div 
          ref={setScrollRef}
          className="overflow-auto max-h-[calc(100vh-250px)]" 
          onScroll={checkScroll}
        >
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Real Property Name</TableHead>
                <TableHead>Property</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price Range</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(properties?.items || []).map((property: any) => (
                <TableRow key={property.id}>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">#{property.id}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">{property.realPropertyName || '-'}</span>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{property.title}</p>
                      <p className="text-sm text-muted-foreground">{property.slug}</p>
                    </div>
                  </TableCell>
                <TableCell>{property.city}, {property.country}</TableCell>
                <TableCell>{property.propertyType}</TableCell>
                <TableCell>${Number(property.priceMin || 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Select
                    value={property.status}
                    onValueChange={(newStatus) => {
                      updateMutation.mutate({
                        id: property.id,
                        data: { status: newStatus },
                      });
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="offMarket">Off-Market</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={property.featured}
                      onCheckedChange={(checked) => {
                        toggleFeaturedMutation.mutate({
                          id: property.id,
                          featured: checked,
                        });
                      }}
                      disabled={!property.featured && (featuredCount ?? 0) >= 3}
                    />
                    {!property.featured && (featuredCount ?? 0) >= 3 && (
                      <span className="text-xs text-muted-foreground">Max 3</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(`/properties/${property.slug}`, '_blank')}
                      title="View property"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        setIsAddingProperty(false);
                        setEditingProperty(property);
                        setIsDialogOpen(true);
                      }}
                      title="Edit property"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`)) {
                          deletePropertyMutation.mutate(property.id);
                        }
                      }}
                      title="Delete property"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {/* Edit Property Dialog */}
      {isDialogOpen && editingProperty && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`bg-card rounded-xl shadow-2xl transition-all duration-300 ${
            isFullscreen ? 'w-full h-full max-w-none my-0 rounded-none' : 'w-full max-w-4xl my-8'
          }`}>
            <div className="p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-xl font-semibold">{isAddingProperty ? "Add New Property" : `Edit Property: ${editingProperty.title}`}</h2>
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setIsDialogOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className={`p-6 space-y-6 overflow-y-auto ${
              isFullscreen ? 'max-h-[calc(100vh-180px)]' : 'max-h-[70vh]'
            }`}>
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Basic Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingProperty.title || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, title: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Real Property Name <span className="text-xs text-muted-foreground">(Internal Only)</span></Label>
                    <Input
                      value={editingProperty.realPropertyName || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, realPropertyName: e.target.value })}
                      placeholder="Internal/legal property name"
                    />
                  </div>
                  <div>
                    <Label>Slug</Label>
                    <Input
                      value={editingProperty.slug || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, slug: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Short Description</Label>
                  <Textarea
                    value={editingProperty.shortDescription || ""}
                    onChange={(e) => setEditingProperty({ ...editingProperty, shortDescription: e.target.value })}
                    rows={4}
                    className="min-h-[100px]"
                    placeholder="Brief summary for property cards (1-2 sentences)"
                  />
                </div>
                <div>
                  <Label>Long Description</Label>
                  <Textarea
                    value={editingProperty.longDescription || ""}
                    onChange={(e) => setEditingProperty({ ...editingProperty, longDescription: e.target.value })}
                    rows={8}
                    className="min-h-[200px]"
                    placeholder="Detailed property description for the detail modal"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Input
                      value={editingProperty.country || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, country: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>City</Label>
                    <Input
                      value={editingProperty.city || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, city: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Property Media */}
              <div>
                <MediaUpload
                  images={editingProperty.images || []}
                  imageCaptions={editingProperty.imageCaptions || {}}
                  videoUrl={editingProperty.videoUrl || ""}
                  virtualTourUrl={editingProperty.virtualTourUrl || ""}
                  onImagesChange={(urls) => {
                    setEditingProperty({ 
                      ...editingProperty, 
                      images: urls,
                      // Clear mainImage when all images are deleted, otherwise use first image
mainImage: urls.length > 0 ? urls[0] : null
                    });
                  }}
                  onImageCaptionsChange={(captions) => {
                    setEditingProperty({ ...editingProperty, imageCaptions: captions });
                  }}
                  onVideoChange={(url) => {
                    setEditingProperty({ ...editingProperty, videoUrl: url });
                  }}
                  onVirtualTourChange={(url) => {
                    setEditingProperty({ ...editingProperty, virtualTourUrl: url });
                  }}
                  maxImages={20}
                />
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status *</Label>
                    <Select
                      value={editingProperty.status || "available"}
                      onValueChange={(value) => setEditingProperty({ ...editingProperty, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="offMarket">Off-Market</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Property Type *</Label>
                    <Select
                      value={editingProperty.propertyType || "Hospitality"}
                      onValueChange={(value) => setEditingProperty({ ...editingProperty, propertyType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Island">Island</SelectItem>
                        <SelectItem value="Resort">Resort</SelectItem>
                        <SelectItem value="CityHotel">City Hotel</SelectItem>
                        <SelectItem value="CountrysideHotel">Countryside Hotel</SelectItem>
                        <SelectItem value="MixedUse">Mixed Use</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                        <SelectItem value="CityLand">City Land</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="Retail">Retail</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Lot">Lot</SelectItem>
                        <SelectItem value="HouseAndLot">House and Lot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Asset Class</Label>
                    <Select
                      value={editingProperty.assetClass || ""}
                      onValueChange={(value) => setEditingProperty({ ...editingProperty, assetClass: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select asset class" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Hospitality">Hospitality</SelectItem>
                        <SelectItem value="Commercial">Commercial</SelectItem>
                        <SelectItem value="Residential">Residential</SelectItem>
                        <SelectItem value="MixedUse">Mixed Use</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Size & Dimensions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Size & Dimensions</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Land Size (sqm)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'landSizeSqm' ? (editingProperty.landSizeSqm || "") : (editingProperty.landSizeSqm && !isNaN(Number(editingProperty.landSizeSqm)) ? Number(editingProperty.landSizeSqm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('landSizeSqm')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, landSizeSqm: value });
                      }}
                      placeholder="e.g., 5,000.00"
                    />
                  </div>
                  <div>
                    <Label>Land Size (ha)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'landSizeHa' ? (editingProperty.landSizeHa || "") : (editingProperty.landSizeHa && !isNaN(Number(editingProperty.landSizeHa)) ? Number(editingProperty.landSizeHa).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('landSizeHa')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, landSizeHa: value });
                      }}
                      placeholder="e.g., 0.50"
                    />
                  </div>
                  <div>
                    <Label>Land Price per sqm</Label>
                    <Input
                      type="text"
                      value={focusedField === 'landPricePerSqm' ? (editingProperty.landPricePerSqm || "") : (editingProperty.landPricePerSqm && !isNaN(Number(editingProperty.landPricePerSqm)) ? Number(editingProperty.landPricePerSqm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('landPricePerSqm')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, landPricePerSqm: value });
                      }}
                      placeholder="e.g., 15,000.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Building Area (sqm)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'buildingAreaSqm' ? (editingProperty.buildingAreaSqm || "") : (editingProperty.buildingAreaSqm && !isNaN(Number(editingProperty.buildingAreaSqm)) ? Number(editingProperty.buildingAreaSqm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('buildingAreaSqm')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, buildingAreaSqm: value });
                      }}
                      placeholder="e.g., 3,500.00"
                    />
                  </div>
                  <div>
                    <Label>Floor Area (sqm)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'floorAreaSqm' ? (editingProperty.floorAreaSqm || "") : (editingProperty.floorAreaSqm && !isNaN(Number(editingProperty.floorAreaSqm)) ? Number(editingProperty.floorAreaSqm).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('floorAreaSqm')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, floorAreaSqm: value });
                      }}
                      placeholder="e.g., 4,200.00"
                    />
                  </div>
                  <div>
                    <Label>Floors</Label>
                    <Input
                      type="text"
                      value={focusedField === 'floors' ? (editingProperty.floors || "") : (editingProperty.floors && !isNaN(Number(editingProperty.floors)) ? Number(editingProperty.floors).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "")}
                      onFocus={() => setFocusedField('floors')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, floors: value });
                      }}
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <Label>Floor Area Ratio (FAR)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'floorAreaRatio' ? (editingProperty.floorAreaRatio || "") : (editingProperty.floorAreaRatio && !isNaN(Number(editingProperty.floorAreaRatio)) ? Number(editingProperty.floorAreaRatio).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('floorAreaRatio')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, floorAreaRatio: value });
                      }}
                      placeholder="e.g., 2.50"
                    />
                  </div>
                </div>
              </div>

              {/* Units Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Units Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Total Units</Label>
                    <Input
                      type="text"
                      value={focusedField === 'units' ? (editingProperty.units || "") : (editingProperty.units && !isNaN(Number(editingProperty.units)) ? Number(editingProperty.units).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) : "")}
                      onFocus={() => setFocusedField('units')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, units: value });
                      }}
                      placeholder="e.g., 120"
                    />
                  </div>
                  <div>
                    <Label>Units Details</Label>
                    <Input
                      value={editingProperty.unitsDetails || ""}
                      onChange={(e) => setEditingProperty({ ...editingProperty, unitsDetails: e.target.value })}
                      placeholder="e.g., 80 studios, 40 1-bedroom"
                    />
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Pricing & Investment</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Asking Price (Net)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'askingPriceNet' ? (editingProperty.askingPriceNet || "") : (editingProperty.askingPriceNet && !isNaN(Number(editingProperty.askingPriceNet)) ? Number(editingProperty.askingPriceNet).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('askingPriceNet')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, askingPriceNet: value });
                      }}
                      placeholder="e.g., 42,000,000.00"
                    />
                  </div>
                  <div>
                    <Label>Asking Price (Gross)</Label>
                    <Input
                      type="text"
                      value={focusedField === 'askingPriceGross' ? (editingProperty.askingPriceGross || "") : (editingProperty.askingPriceGross && !isNaN(Number(editingProperty.askingPriceGross)) ? Number(editingProperty.askingPriceGross).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "")}
                      onFocus={() => setFocusedField('askingPriceGross')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, askingPriceGross: value });
                      }}
                      placeholder="e.g., 47,500,000"
                    />
                  </div>
                  <div>
                    <Label>Currency</Label>
                    <Select
                      value={editingProperty.currency || "USD"}
                      onValueChange={(value) => setEditingProperty({ ...editingProperty, currency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                        <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                        <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                        <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                        <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                        <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                        <SelectItem value="THB">THB - Thai Baht</SelectItem>
                        <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                        <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Min Price (Display)</Label>
                    <Input
                      type="text"
                      value={editingProperty.priceMin ? Number(editingProperty.priceMin).toLocaleString('en-US') : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, priceMin: value });
                      }}
                      placeholder="e.g., 45,000,000"
                    />
                  </div>
                  <div>
                    <Label>Max Price (Display)</Label>
                    <Input
                      type="text"
                      value={editingProperty.priceMax ? Number(editingProperty.priceMax).toLocaleString('en-US') : ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/,/g, '');
                        setEditingProperty({ ...editingProperty, priceMax: value });
                      }}
                      placeholder="e.g., 55,000,000"
                    />
                  </div>
                </div>
              </div>

              {/* Income Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Income Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="incomeGenerating"
                      checked={editingProperty.incomeGenerating || false}
                      onChange={(e) => setEditingProperty({ ...editingProperty, incomeGenerating: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="incomeGenerating">Income Generating Property</Label>
                  </div>
                  {editingProperty.incomeGenerating && (
                    <div>
                      <Label>Income Details (Available after NDA)</Label>
                      <Textarea
                        value={editingProperty.incomeDetails || ""}
                        onChange={(e) => setEditingProperty({ ...editingProperty, incomeDetails: e.target.value })}
                        placeholder="Provide income details that will be shared after NDA signing..."
                        rows={5}
                        className="min-h-[120px]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Property Features */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Property Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Interior Features</Label>
                    <Textarea
                      value={editingProperty.interiorFeatures?.join('\n') || ""}
                      onChange={(e) => setEditingProperty({ 
                        ...editingProperty, 
                        interiorFeatures: e.target.value.split('\n').filter(f => f.trim()) 
                      })}
                      placeholder="Enter one feature per line...\nExample:\nHardwood floors throughout\nGourmet kitchen with premium appliances\nSmart home automation system"
                      rows={6}
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter one feature per line</p>
                  </div>
                  <div>
                    <Label>Exterior Features</Label>
                    <Textarea
                      value={editingProperty.exteriorFeatures?.join('\n') || ""}
                      onChange={(e) => setEditingProperty({ 
                        ...editingProperty, 
                        exteriorFeatures: e.target.value.split('\n').filter(f => f.trim()) 
                      })}
                      placeholder="Enter one feature per line...\nExample:\nResort-style swimming pool\nOutdoor kitchen and dining area\nProfessional landscaping"
                      rows={6}
                      className="min-h-[150px]"
                    />
                    <p className="text-xs text-muted-foreground mt-1">Enter one feature per line</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Additional Information</h3>
                <div>
                  <Label>Additional Information</Label>
                  <Textarea
                    value={editingProperty.others || ""}
                    onChange={(e) => setEditingProperty({ ...editingProperty, others: e.target.value })}
                    placeholder="Any other relevant information about the property..."
                    rows={6}
                    className="min-h-[150px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-border flex justify-end gap-3 sticky bottom-0 bg-card">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) ? "Saving..." : (isAddingProperty ? "Create Property" : "Save Changes")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
function BookingsSection({ bookings, canUpdate, canDelete }: any) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookings</h1>
        <p className="text-muted-foreground">Manage consultation bookings</p>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(bookings?.items || bookings || []).slice(0, 10).map((booking: any) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">{booking.clientName}</TableCell>
                <TableCell>{new Date(booking.date).toLocaleDateString()}</TableCell>
                <TableCell>{booking.type}</TableCell>
                <TableCell>
                  <Badge variant={booking.status === "confirmed" ? "default" : "secondary"}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="w-4 h-4" />
                    </Button>
                    {canUpdate && (
                      <Button variant="ghost" size="icon">
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

// Team Section with RBAC and working dialogs
function TeamSection({ teamMembers, canCreate, canUpdate, canDelete }: any) {
  const [editingMember, setEditingMember] = useState<any>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const utils = trpc.useUtils();
  
  const deleteMember = trpc.team.delete.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      toast.success("Team member deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete team member");
    },
  });

  const handleDelete = (member: any) => {
    if (confirm(`Are you sure you want to delete ${member.name}?`)) {
      deleteMember.mutate({ id: member.id });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Members</h1>
          <p className="text-muted-foreground">Manage your team</p>
        </div>
        {canCreate && (
          <Button onClick={() => setIsAddingMember(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers?.map((member: any) => (
          <Card key={member.id}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                {member.photo ? (
                  <img 
                    src={member.photo} 
                    alt={member.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xl font-bold text-primary">
                      {member.name?.charAt(0) || "?"}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </div>
              {(canUpdate || canDelete) && (
                <div className="flex gap-2 mt-4">
                  {canUpdate && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingMember(member)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  {canDelete && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive"
                      onClick={() => handleDelete(member)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingMember && (
        <TeamMemberEditDialog
          member={editingMember}
          open={!!editingMember}
          onOpenChange={(open) => {
            if (!open) setEditingMember(null);
          }}
        />
      )}

      {/* Add Dialog */}
      {isAddingMember && (
        <TeamMemberAddDialog
          open={isAddingMember}
          onOpenChange={setIsAddingMember}
        />
      )}
    </div>
  );
}

// Add Team Member Dialog
function TeamMemberAddDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [shortBio, setShortBio] = useState("");
  const [bio, setBio] = useState("");
  const [photo, setPhoto] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  
  const utils = trpc.useUtils();
  
  const createMember = trpc.team.create.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      onOpenChange(false);
      toast.success("Team member added successfully");
      setName(""); setRole(""); setShortBio(""); setBio(""); setPhoto(""); setEmail(""); setPhone("");
    },
    onError: () => {
      toast.error("Failed to add team member");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMember.mutate({ name, role, shortBio, bio, photo, email, phone });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Team Member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Photo</Label>
            {photo ? (
              <div className="flex items-center gap-4">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                  <img src={photo} alt={name} className="w-full h-full object-cover" />
                </div>
                <Button type="button" variant="outline" size="sm" onClick={() => setPhoto("")} className="text-destructive">
                  Remove Photo
                </Button>
              </div>
            ) : (
              <MediaUpload onUploadComplete={(urls) => { if (urls.length > 0) setPhoto(urls[0]); }} maxFiles={1} accept={{ "image/*": [".png", ".jpg", ".jpeg", ".webp"] }} />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-name">Name *</Label>
              <Input id="add-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role *</Label>
              <Input id="add-role" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input id="add-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-phone">Phone</Label>
              <Input id="add-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-shortBio">Short Bio</Label>
            <Input id="add-shortBio" value={shortBio} onChange={(e) => setShortBio(e.target.value)} placeholder="Brief description for cards" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="add-bio">Full Bio</Label>
            <Textarea id="add-bio" value={bio} onChange={(e) => setBio(e.target.value)} rows={4} placeholder="Detailed biography" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={createMember.isPending}>
              {createMember.isPending ? "Adding..." : "Add Team Member"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Settings Section
function SettingsSection({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">System configuration and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>Basic system configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Settings panel content here...</p>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Administrator-only security options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Session Timeout</p>
                    <p className="text-sm text-muted-foreground">Automatically log out after 8 hours of inactivity</p>
                  </div>
                  <Badge>8 hours</Badge>
                </div>
                <div className="pt-4 border-t">
                  <ResetDataButton />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
