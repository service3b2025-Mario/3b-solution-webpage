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
          {section === "dashboard" && canAccess("dashboards") && <DashboardSection analytics={analytics} properties={properties} leads={leads} canUpdate={canUpdate("dashboards")} />}
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
function DashboardSection({ analytics, properties, leads, canUpdate }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your real estate portfolio</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Properties</p>
                <p className="text-3xl font-bold">{properties?.length || 0}</p>
              </div>
              <Building2 className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-3xl font-bold">{leads?.length || 0}</p>
              </div>
              <Mail className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Page Views</p>
                <p className="text-3xl font-bold">{analytics?.totalViews || 0}</p>
              </div>
              <Eye className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold">{analytics?.conversionRate || "0"}%</p>
              </div>
              <TrendingUp className="w-10 h-10 text-primary/20" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Properties Section with RBAC
function PropertiesSection({ properties, canCreate, canUpdate, canDelete }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        {canCreate && (
          <Link href="/admin/properties/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </Link>
        )}
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {properties?.slice(0, 10).map((property: any) => (
              <TableRow key={property.id}>
                <TableCell className="font-medium">{property.title}</TableCell>
                <TableCell>{property.city}, {property.country}</TableCell>
                <TableCell>{property.propertyType}</TableCell>
                <TableCell>
                  <Badge variant={property.status === "available" ? "default" : "secondary"}>
                    {property.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Link href={`/properties/${property.slug}`}>
                      <Button variant="ghost" size="icon">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </Link>
                    {canUpdate && (
                      <Link href={`/admin/properties/${property.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                    )}
                    {canDelete && (
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="w-4 h-4" />
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

// Bookings Section with RBAC
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
            {bookings?.slice(0, 10).map((booking: any) => (
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
}}

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
