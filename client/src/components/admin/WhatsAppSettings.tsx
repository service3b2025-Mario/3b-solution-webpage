/**
 * WhatsApp Team Settings Component
 * 
 * Admin interface for managing WhatsApp team accounts,
 * visibility settings, and viewing click analytics
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Phone, Plus, Edit, Trash2, Eye, EyeOff, 
  BarChart3, MessageCircle, ExternalLink, Save,
  TrendingUp, Users, MousePointer, Zap
} from "lucide-react";

interface WhatsAppAccount {
  id: number;
  name: string;
  role: string;
  title?: string;
  phoneNumber: string;
  countryCode: string;
  displayOrder: number;
  isActive: boolean;
  isVisible: boolean;
  avatarUrl?: string;
  defaultMessage: string;
  visibleOnPages: string;
  totalClicks: number;
}

const PAGE_OPTIONS = [
  { id: "contact", label: "Contact Page" },
  { id: "team", label: "Team Page" },
  { id: "about", label: "About Page" },
  { id: "property", label: "Property Details" },
  { id: "all", label: "All Pages" },
];

const COUNTRY_CODES = [
  { code: "+49", country: "Germany" },
  { code: "+63", country: "Philippines" },
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "UK" },
  { code: "+86", country: "China" },
  { code: "+971", country: "UAE" },
  { code: "+65", country: "Singapore" },
];

// Pre-defined team members for Quick Setup
const TEAM_MEMBERS = [
  {
    name: "Georg Blascheck",
    role: "CEO & Founder",
    title: "Sales",
    phoneNumber: "17656787896",
    countryCode: "+49",
    displayOrder: 1,
    isActive: true,
  },
  {
    name: "Bibian Pacayra Bock",
    role: "President",
    title: "Sales",
    phoneNumber: "",
    countryCode: "+63",
    displayOrder: 2,
    isActive: false,
  },
  {
    name: "Engela Pacayra",
    role: "Director",
    title: "Sales",
    phoneNumber: "",
    countryCode: "+63",
    displayOrder: 3,
    isActive: false,
  },
  {
    name: "Mario Bock",
    role: "Director",
    title: "Admin",
    phoneNumber: "",
    countryCode: "+49",
    displayOrder: 4,
    isActive: false,
  },
];

export function WhatsAppSettings() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<WhatsAppAccount | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Fetch accounts
  const { data: accounts, isLoading, refetch } = trpc.whatsapp.list.useQuery();
  const { data: analytics } = trpc.whatsapp.getAnalytics.useQuery({});

  // Mutations
  const createMutation = trpc.whatsapp.create.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp account added successfully");
      setIsAddDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to add account: ${error.message}`);
    },
  });

  const updateMutation = trpc.whatsapp.update.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp account updated successfully");
      setEditingAccount(null);
      setIsEditDialogOpen(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update account: ${error.message}`);
    },
  });

  const deleteMutation = trpc.whatsapp.delete.useMutation({
    onSuccess: () => {
      toast.success("WhatsApp account deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete account: ${error.message}`);
    },
  });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    title: "Sales",
    phoneNumber: "",
    countryCode: "+49",
    displayOrder: 0,
    isActive: true,
    isVisible: true,
    defaultMessage: "Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities.",
    visibleOnPages: ["contact", "team", "about", "property"],
  });

  const resetForm = () => {
    setFormData({
      name: "",
      role: "",
      title: "Sales",
      phoneNumber: "",
      countryCode: "+49",
      displayOrder: 0,
      isActive: true,
      isVisible: true,
      defaultMessage: "Hi! I'm interested in learning more about 3B Solution's real estate investment opportunities.",
      visibleOnPages: ["contact", "team", "about", "property"],
    });
  };

  // Clean phone number - remove spaces, dashes, and non-numeric characters
  const cleanPhoneNumber = (phone: string): string => {
    return phone.replace(/[\s\-\(\)\.]/g, '');
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }
    if (!formData.role.trim()) {
      toast.error("Role is required");
      return;
    }
    
    const cleanedPhone = cleanPhoneNumber(formData.phoneNumber);
    if (!cleanedPhone || cleanedPhone.length < 5) {
      toast.error("Please enter a valid phone number");
      return;
    }

    const submitData = {
      ...formData,
      phoneNumber: cleanedPhone,
    };

    if (editingAccount) {
      updateMutation.mutate({
        id: editingAccount.id,
        data: submitData,
      });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleEdit = (account: WhatsAppAccount) => {
    setEditingAccount(account);
    let visiblePages: string[] = [];
    try {
      visiblePages = JSON.parse(account.visibleOnPages || '[]');
    } catch {
      visiblePages = ["contact", "team", "about", "property"];
    }
    
    setFormData({
      name: account.name,
      role: account.role,
      title: account.title || "Sales",
      phoneNumber: account.phoneNumber,
      countryCode: account.countryCode,
      displayOrder: account.displayOrder,
      isActive: account.isActive,
      isVisible: account.isVisible,
      defaultMessage: account.defaultMessage,
      visibleOnPages: visiblePages,
    });
    setIsEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this WhatsApp account?")) {
      deleteMutation.mutate({ id });
    }
  };

  const togglePageVisibility = (pageId: string) => {
    setFormData(prev => ({
      ...prev,
      visibleOnPages: prev.visibleOnPages.includes(pageId)
        ? prev.visibleOnPages.filter(p => p !== pageId)
        : [...prev.visibleOnPages, pageId],
    }));
  };

  const getWhatsAppLink = (account: WhatsAppAccount) => {
    const phone = `${account.countryCode}${account.phoneNumber}`.replace(/[^0-9+]/g, '').replace('+', '');
    const message = encodeURIComponent(account.defaultMessage);
    return `https://wa.me/${phone}?text=${message}`;
  };

  // Quick Setup - Add a team member with pre-filled data
  const handleQuickSetup = (member: typeof TEAM_MEMBERS[0]) => {
    if (!member.phoneNumber) {
      toast.error(`Phone number not available for ${member.name}. Please add manually.`);
      return;
    }

    const submitData = {
      name: member.name,
      role: member.role,
      title: member.title,
      phoneNumber: cleanPhoneNumber(member.phoneNumber),
      countryCode: member.countryCode,
      displayOrder: member.displayOrder,
      isActive: member.isActive,
      isVisible: true,
      defaultMessage: `Hi ${member.name.split(' ')[0]}! I'm interested in learning more about 3B Solution's real estate investment opportunities.`,
      visibleOnPages: ["contact", "team", "about", "property"],
    };

    createMutation.mutate(submitData);
  };

  // Check if a team member is already added
  const isTeamMemberAdded = (memberName: string): boolean => {
    return accounts?.some((a: WhatsAppAccount) => a.name === memberName) || false;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">WhatsApp Team Accounts</h2>
          <p className="text-muted-foreground">
            Manage team WhatsApp numbers and click-to-chat settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowAnalytics(!showAnalytics)}
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            {showAnalytics ? "Hide Analytics" : "Show Analytics"}
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                Add Account
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add WhatsApp Account</DialogTitle>
              </DialogHeader>
              <AccountForm
                formData={formData}
                setFormData={setFormData}
                togglePageVisibility={togglePageVisibility}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  <Save className="w-4 h-4 mr-2" />
                  {createMutation.isPending ? "Saving..." : "Save Account"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Analytics Section */}
      {showAnalytics && analytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-500/10 rounded-lg flex items-center justify-center">
                  <MousePointer className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks (30d)</p>
                  <p className="text-2xl font-bold">{analytics.totals?.total_clicks || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500/10 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unique Visitors</p>
                  <p className="text-2xl font-bold">{analytics.totals?.unique_visitors || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
                  <Phone className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Accounts</p>
                  <p className="text-2xl font-bold">
                    {accounts?.filter((a: WhatsAppAccount) => a.isActive).length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Top Page</p>
                  <p className="text-lg font-bold truncate">
                    {analytics.byPage?.[0]?.page_path || "N/A"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Accounts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            Team WhatsApp Accounts
          </CardTitle>
          <CardDescription>
            Configure which team members appear on the website's WhatsApp widget
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : accounts && accounts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Pages</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {accounts.map((account: WhatsAppAccount) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-medium">{account.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{account.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm">
                        {account.countryCode} {account.phoneNumber}
                      </code>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {(() => {
                          try {
                            const pages = JSON.parse(account.visibleOnPages || '[]');
                            return (
                              <>
                                {pages.slice(0, 2).map((page: string) => (
                                  <Badge key={page} variant="secondary" className="text-xs">
                                    {page}
                                  </Badge>
                                ))}
                                {pages.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{pages.length - 2}
                                  </Badge>
                                )}
                              </>
                            );
                          } catch {
                            return <Badge variant="secondary" className="text-xs">all</Badge>;
                          }
                        })()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{account.totalClicks}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {account.isActive ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                        {account.isVisible ? (
                          <Eye className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(getWhatsAppLink(account), '_blank')}
                          title="Test WhatsApp Link"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(account)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(account.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No WhatsApp Accounts</h3>
              <p className="text-muted-foreground mb-4">
                Add team members to enable WhatsApp click-to-chat on your website
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          setEditingAccount(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit WhatsApp Account</DialogTitle>
          </DialogHeader>
          <AccountForm
            formData={formData}
            setFormData={setFormData}
            togglePageVisibility={togglePageVisibility}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={updateMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateMutation.isPending ? "Saving..." : "Update Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick Setup Section - Always visible */}
      <Card className="border-dashed border-green-500/30 bg-green-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-green-500" />
            Quick Setup: Add Your Team
          </CardTitle>
          <CardDescription>
            Click on a team member to quickly add them with pre-configured settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TEAM_MEMBERS.map((member) => {
              const isAdded = isTeamMemberAdded(member.name);
              const hasPhone = !!member.phoneNumber;
              
              return (
                <div 
                  key={member.name}
                  className={`p-4 rounded-lg border transition-all ${
                    isAdded 
                      ? 'bg-green-500/10 border-green-500/30' 
                      : hasPhone
                        ? 'bg-muted hover:bg-muted/80 cursor-pointer hover:border-primary/50'
                        : 'bg-muted/50 opacity-60'
                  }`}
                  onClick={() => !isAdded && hasPhone && handleQuickSetup(member)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {member.role} ({member.title})
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {hasPhone 
                          ? `${member.countryCode} ${member.phoneNumber.replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3')}`
                          : 'Phone number pending'
                        }
                      </p>
                    </div>
                    {isAdded ? (
                      <Badge className="bg-green-500">Added</Badge>
                    ) : hasPhone ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleQuickSetup(member);
                        }}
                        disabled={createMutation.isPending}
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                    ) : (
                      <Badge variant="secondary">Pending</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <p className="text-xs text-muted-foreground mt-4">
            Note: Team members without phone numbers will show as "Pending". Add their phone numbers to enable Quick Setup.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Account Form Component
function AccountForm({ 
  formData, 
  setFormData, 
  togglePageVisibility 
}: { 
  formData: any; 
  setFormData: (data: any) => void;
  togglePageVisibility: (pageId: string) => void;
}) {
  return (
    <div className="space-y-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Georg Blascheck"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Input
            id="role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            placeholder="CEO"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title/Department</Label>
          <Select
            value={formData.title}
            onValueChange={(value) => setFormData({ ...formData, title: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select title" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Sales">Sales</SelectItem>
              <SelectItem value="Support">Support</SelectItem>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="displayOrder">Display Order</Label>
          <Input
            id="displayOrder"
            type="number"
            value={formData.displayOrder}
            onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="countryCode">Country</Label>
          <Select
            value={formData.countryCode}
            onValueChange={(value) => setFormData({ ...formData, countryCode: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((cc) => (
                <SelectItem key={cc.code} value={cc.code}>
                  {cc.code} ({cc.country})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="col-span-2 space-y-2">
          <Label htmlFor="phoneNumber">Phone Number *</Label>
          <Input
            id="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            placeholder="17656787896"
          />
          <p className="text-xs text-muted-foreground">
            Enter without country code, spaces or dashes (e.g., 17656787896)
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultMessage">Default Message</Label>
        <Textarea
          id="defaultMessage"
          value={formData.defaultMessage}
          onChange={(e) => setFormData({ ...formData, defaultMessage: e.target.value })}
          placeholder="Hi! I'm interested in..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label>Show on Pages</Label>
        <div className="grid grid-cols-2 gap-2">
          {PAGE_OPTIONS.map((page) => (
            <div key={page.id} className="flex items-center space-x-2">
              <Checkbox
                id={`page-${page.id}`}
                checked={formData.visibleOnPages.includes(page.id)}
                onCheckedChange={() => togglePageVisibility(page.id)}
              />
              <label
                htmlFor={`page-${page.id}`}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {page.label}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Active</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isVisible"
            checked={formData.isVisible}
            onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
          />
          <Label htmlFor="isVisible">Visible on Website</Label>
        </div>
      </div>
    </div>
  );
}

export default WhatsAppSettings;
