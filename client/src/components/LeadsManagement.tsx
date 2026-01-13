import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { LeadDetailModal } from "./LeadDetailModal";
import { 
  Search, 
  Mail, 
  Phone, 
  Building2, 
  Calendar, 
  Filter,
  Download,
  RefreshCw,
  Eye,
  MessageSquare,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";

// Status configuration with colors and icons
const STATUS_CONFIG: Record<string, { color: string; bgColor: string; icon: any; label: string }> = {
  new: { 
    color: "text-blue-700", 
    bgColor: "bg-blue-100 dark:bg-blue-900/30", 
    icon: AlertCircle, 
    label: "New" 
  },
  contacted: { 
    color: "text-yellow-700", 
    bgColor: "bg-yellow-100 dark:bg-yellow-900/30", 
    icon: Clock, 
    label: "Contacted" 
  },
  qualified: { 
    color: "text-purple-700", 
    bgColor: "bg-purple-100 dark:bg-purple-900/30", 
    icon: TrendingUp, 
    label: "Qualified" 
  },
  converted: { 
    color: "text-green-700", 
    bgColor: "bg-green-100 dark:bg-green-900/30", 
    icon: CheckCircle, 
    label: "Converted" 
  },
  lost: { 
    color: "text-gray-700", 
    bgColor: "bg-gray-100 dark:bg-gray-900/30", 
    icon: XCircle, 
    label: "Lost" 
  },
};

export function LeadsManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Fetch leads from API
  const { data: leadsData, isLoading, refetch } = trpc.leads.list.useQuery({
    status: statusFilter !== "all" ? statusFilter : undefined,
    source: sourceFilter !== "all" ? sourceFilter : undefined,
    limit: 100,
  });

  const leads = leadsData?.items || [];
  const totalLeads = leadsData?.total || 0;

  // Filter leads by search query
  const filteredLeads = leads.filter((lead: any) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      lead.firstName?.toLowerCase().includes(query) ||
      lead.lastName?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.company?.toLowerCase().includes(query) ||
      lead.phone?.includes(query)
    );
  });

  // Calculate stats
  const stats = {
    total: totalLeads,
    new: leads.filter((l: any) => l.status === "new").length,
    contacted: leads.filter((l: any) => l.status === "contacted").length,
    qualified: leads.filter((l: any) => l.status === "qualified").length,
    converted: leads.filter((l: any) => l.status === "converted").length,
  };

  // Get leads by status for tabs
  const getLeadsByStatus = (status: string) => {
    if (status === "all") return filteredLeads;
    return filteredLeads.filter((lead: any) => lead.status === status);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportLeads = () => {
    const csvContent = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'Source', 'Message', 'Date'].join(','),
      ...filteredLeads.map((lead: any) => [
        `"${lead.firstName || ''} ${lead.lastName || ''}"`,
        `"${lead.email}"`,
        `"${lead.phone || ''}"`,
        `"${lead.company || ''}"`,
        `"${lead.status}"`,
        `"${lead.source || ''}"`,
        `"${(lead.message || '').replace(/"/g, '""')}"`,
        `"${formatDate(lead.createdAt)}"`,
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Management</h1>
          <p className="text-muted-foreground mt-1">Track and manage your investment inquiries</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={exportLeads}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setActiveTab("all")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Leads</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'new' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setActiveTab("new")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-bold text-blue-600">{stats.new}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'contacted' ? 'ring-2 ring-yellow-500' : ''}`} onClick={() => setActiveTab("contacted")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Contacted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.contacted}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'qualified' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setActiveTab("qualified")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Qualified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.qualified}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`border-0 shadow-md hover:shadow-lg transition-shadow cursor-pointer ${activeTab === 'converted' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setActiveTab("converted")}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Converted</p>
                <p className="text-2xl font-bold text-green-600">{stats.converted}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, phone, or company..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="Contact Form">Contact Form</SelectItem>
                <SelectItem value="Property Inquiry">Property Inquiry</SelectItem>
                <SelectItem value="Newsletter">Newsletter</SelectItem>
                <SelectItem value="Referral">Referral</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leads Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {activeTab === "all" ? "All Leads" : `${STATUS_CONFIG[activeTab]?.label || activeTab} Leads`}
            </CardTitle>
            <Badge variant="secondary">{getLeadsByStatus(activeTab).length} leads</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : getLeadsByStatus(activeTab).length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No leads found</p>
              <p className="text-sm text-muted-foreground/70">Leads will appear here when visitors submit the contact form</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="font-semibold">Contact</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Source</TableHead>
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getLeadsByStatus(activeTab).map((lead: any) => {
                    const statusConfig = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <TableCell>
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-semibold text-primary">
                                {(lead.firstName?.[0] || lead.email[0]).toUpperCase()}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">
                                {lead.firstName || lead.lastName 
                                  ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() 
                                  : 'Unknown'}
                              </p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                              {lead.phone && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Phone className="w-3 h-3" />
                                  <span>{lead.phone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {lead.company ? (
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-muted-foreground" />
                              <span>{lead.company}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${statusConfig.bgColor} ${statusConfig.color} border-0 gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {statusConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{lead.source || 'Direct'}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(lead.createdAt)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedLead(lead);
                              }}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.location.href = `mailto:${lead.email}`;
                              }}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                            {lead.phone && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = `tel:${lead.phone}`;
                                }}
                              >
                                <Phone className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Lead Detail Modal */}
      <LeadDetailModal
        lead={selectedLead}
        open={!!selectedLead}
        onOpenChange={(open) => !open && setSelectedLead(null)}
      />
    </div>
  );
}
