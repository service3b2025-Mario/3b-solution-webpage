import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Download, Search, Filter, FileDown, Calendar, User, Mail, Tag, Plus } from "lucide-react";
import { TagManager } from "@/components/TagManager";
import { format } from "date-fns";

export function DownloadAnalytics() {
  const [searchTerm, setSearchTerm] = useState("");
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>("all");
  const [selectedDownloads, setSelectedDownloads] = useState<Set<number>>(new Set());
  const [bulkTagId, setBulkTagId] = useState<string>("");
  
  const { data: downloads, isLoading } = trpc.downloads.withTags.useQuery();
  const { data: tags } = trpc.downloads.tags.list.useQuery();
  const [selectedTagFilter, setSelectedTagFilter] = useState<number | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  
  const utils = trpc.useUtils();
  const assignTag = trpc.downloads.tags.assign.useMutation({
    onSuccess: () => {
      utils.downloads.withTags.invalidate();
    },
  });
  
  const removeTag = trpc.downloads.tags.remove.useMutation({
    onSuccess: () => {
      utils.downloads.withTags.invalidate();
    },
  });
  
  const handleSelectAll = () => {
    if (selectedDownloads.size === filteredDownloads.length) {
      setSelectedDownloads(new Set());
    } else {
      setSelectedDownloads(new Set(filteredDownloads.map(d => d.id)));
    }
  };
  
  const handleSelectDownload = (id: number) => {
    const newSelected = new Set(selectedDownloads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedDownloads(newSelected);
  };
  
  const handleBulkTag = async () => {
    if (!bulkTagId || selectedDownloads.size === 0) return;
    
    const tagId = Number(bulkTagId);
    const promises = Array.from(selectedDownloads).map(downloadId =>
      assignTag.mutateAsync({ downloadId, tagId })
    );
    
    await Promise.all(promises);
    setSelectedDownloads(new Set());
    setBulkTagId("");
  };

  // Filter downloads based on search, resource type, and tags
  const filteredDownloads = downloads?.filter((download) => {
    const matchesSearch = 
      download.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      download.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (download.resourceTitle?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesType = resourceTypeFilter === "all" || download.resourceType === resourceTypeFilter;
    
    const matchesTag = selectedTagFilter === null || download.tags.some(t => t.id === selectedTagFilter);
    
    return matchesSearch && matchesType && matchesTag;
  }) || [];

  // Export to CSV
  const exportToCSV = (includeAllData = true) => {
    if (!filteredDownloads.length) return;

    const headers = includeAllData 
      ? ["Download Date", "Full Name", "Email", "Resource Type", "Resource Title", "Tags", "IP Address"]
      : ["Full Name", "Email"];
    
    const rows = filteredDownloads.map(d => {
      const tagNames = d.tags.map(t => t.name).join("; ");
      return includeAllData
        ? [
            format(new Date(d.createdAt), "yyyy-MM-dd HH:mm:ss"),
            d.fullName,
            d.email,
            d.resourceType,
            d.resourceTitle,
            tagNames || "No tags",
            d.ipAddress || "N/A"
          ]
        : [d.fullName, d.email];
    });

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `download-analytics-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Export email list only
  const exportEmailList = () => {
    if (!filteredDownloads.length) return;

    const uniqueEmails = Array.from(new Set(filteredDownloads.map(d => d.email)));
    const csvContent = ["Email", "Full Name"].join(",") + "\n" +
      uniqueEmails.map(email => {
        const download = filteredDownloads.find(d => d.email === email);
        return `"${email}","${download?.fullName || ""}"`;
      }).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `email-list-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  // Get resource type badge color
  const getResourceTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      report: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      guide: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      brochure: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
      document: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
      photo: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Download Analytics</h2>
          <p className="text-muted-foreground">Track and export download activity for lead generation</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportEmailList} variant="outline" className="gap-2">
            <Mail className="w-4 h-4" />
            Export Email List
          </Button>
          <Button onClick={() => exportToCSV(true)} className="gap-2">
            <FileDown className="w-4 h-4" />
            Export Full Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Downloads</p>
                <p className="text-2xl font-bold">{downloads?.length || 0}</p>
              </div>
              <Download className="w-8 h-8 text-primary opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique Users</p>
                <p className="text-2xl font-bold">
                  {new Set(downloads?.map(d => d.email)).size || 0}
                </p>
              </div>
              <User className="w-8 h-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">This Week</p>
                <p className="text-2xl font-bold">
                  {downloads?.filter(d => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return new Date(d.createdAt) > weekAgo;
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today</p>
                <p className="text-2xl font-bold">
                  {downloads?.filter(d => {
                    const today = new Date();
                    const downloadDate = new Date(d.createdAt);
                    return downloadDate.toDateString() === today.toDateString();
                  }).length || 0}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or resource title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="report">Market Reports</SelectItem>
                <SelectItem value="guide">Property Market Guides</SelectItem>
                <SelectItem value="brochure">Brochures</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="photo">Photos</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTagFilter?.toString() || "all"} onValueChange={(v) => setSelectedTagFilter(v === "all" ? null : Number(v))}>
              <SelectTrigger className="w-full sm:w-48">
                <Tag className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {tags?.map(tag => (
                  <SelectItem key={tag.id} value={tag.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => setShowTagManager(!showTagManager)} className="gap-2">
              <Tag className="w-4 h-4" />
              Manage Tags
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tag Manager */}
      {showTagManager && (
        <Card>
          <CardContent className="p-6">
            <TagManager />
          </CardContent>
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedDownloads.size > 0 && (
        <Card className="border-primary">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedDownloads.size} download{selectedDownloads.size > 1 ? 's' : ''} selected
              </span>
              <Select value={bulkTagId} onValueChange={setBulkTagId}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select tag to apply" />
                </SelectTrigger>
                <SelectContent>
                  {tags?.map(tag => (
                    <SelectItem key={tag.id} value={tag.id.toString()}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                        {tag.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleBulkTag} disabled={!bulkTagId} size="sm">
                Apply Tag
              </Button>
              <Button onClick={() => setSelectedDownloads(new Set())} variant="outline" size="sm">
                Clear Selection
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Download History ({filteredDownloads.length} records)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedDownloads.size === filteredDownloads.length && filteredDownloads.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Resource Type</TableHead>
                  <TableHead>Resource Title</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDownloads.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No downloads found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDownloads.map((download) => (
                    <TableRow key={download.id}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={selectedDownloads.has(download.id)}
                          onChange={() => handleSelectDownload(download.id)}
                          className="w-4 h-4 cursor-pointer"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {format(new Date(download.createdAt), "MMM dd, yyyy HH:mm")}
                      </TableCell>
                      <TableCell>{download.fullName}</TableCell>
                      <TableCell>
                        <a href={`mailto:${download.email}`} className="text-primary hover:underline">
                          {download.email}
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge className={getResourceTypeBadge(download.resourceType)}>
                          {download.resourceType}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {download.resourceTitle}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1 items-center">
                          {download.tags.map(tag => (
                            <Badge
                              key={tag.id}
                              style={{ backgroundColor: tag.color, color: "#fff" }}
                              className="cursor-pointer hover:opacity-80"
                              onClick={() => removeTag.mutate({ downloadId: download.id, tagId: tag.id })}
                              title="Click to remove"
                            >
                              {tag.name}
                            </Badge>
                          ))}
                          <Select
                            value=""
                            onValueChange={(tagId) => assignTag.mutate({ downloadId: download.id, tagId: Number(tagId) })}
                          >
                            <SelectTrigger className="h-6 w-6 p-0 border-dashed">
                              <Plus className="w-3 h-3" />
                            </SelectTrigger>
                            <SelectContent>
                              {tags?.filter(t => !download.tags.some(dt => dt.id === t.id)).map(tag => (
                                <SelectItem key={tag.id} value={tag.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: tag.color }} />
                                    {tag.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {download.ipAddress || "N/A"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
