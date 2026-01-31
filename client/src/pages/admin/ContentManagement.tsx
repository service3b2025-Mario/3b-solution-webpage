import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Check, X, Loader2, Image as ImageIcon } from "lucide-react";
import { PDFUpload } from "@/components/PDFUpload";
import { RichTextEditor } from "@/components/RichTextEditor";
import { SuccessStoryEditDialog } from "@/components/SuccessStoryEditDialog";
import { toast } from "sonner";

// Skeleton loader component
function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 animate-pulse">
          <div className="h-12 bg-muted rounded flex-1"></div>
          <div className="h-12 bg-muted rounded w-32"></div>
          <div className="h-12 bg-muted rounded w-24"></div>
        </div>
      ))}
    </div>
  );
}

// Services Tab with lazy loading and inline editing
function ServicesTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.services.list.useQuery(undefined, {
    enabled: activeTab, // Only fetch when tab is active
  });

  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setEditingId(null);
      setEditData({});
      utils.services.list.invalidate();
      toast.success("Service created successfully");
    },
    onError: () => {
      toast.error("Failed to create service");
    },
  });

  const updateService = trpc.services.update.useMutation({
    onMutate: async (newData) => {
      // Cancel outgoing refetches
      await utils.services.list.cancel();
      
      // Snapshot previous value
      const previousServices = utils.services.list.getData();
      
      // Optimistically update
      utils.services.list.setData(undefined, (old) =>
        old?.map((s) => (s.id === newData.id ? { ...s, ...newData } : s))
      );
      
      return { previousServices };
    },
    onError: (err, newData, context) => {
      // Rollback on error
      utils.services.list.setData(undefined, context?.previousServices);
      toast.error("Failed to update service");
    },
    onSuccess: () => {
      setEditingId(null);
      setEditData({});
      toast.success("Service updated successfully");
    },
  });

  const deleteService = trpc.services.delete.useMutation({
    onMutate: async (id) => {
      await utils.services.list.cancel();
      const previousServices = utils.services.list.getData();
      utils.services.list.setData(undefined, (old) => old?.filter((s) => s.id !== id));
      return { previousServices };
    },
    onError: (err, id, context) => {
      utils.services.list.setData(undefined, context?.previousServices);
      toast.error("Failed to delete service");
    },
    onSuccess: () => {
      toast.success("Service deleted successfully");
    },
  });

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setEditData(service);
  };

  const handleSave = () => {
    if (isAdding) {
      // Create new service
      createService.mutate(editData);
    } else if (editingId) {
      // Update existing service
      updateService.mutate({ id: editingId, data: editData });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(-1); // Use -1 to indicate adding mode
    setEditData({
      title: "",
      slug: "",
      shortDescription: "",
      fullDescription: "",
      icon: "",
      image: "",
      features: [],
      order: 0,
      isActive: true,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected services?`)) {
      selectedIds.forEach((id) => deleteService.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === services?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(services?.map((s) => s.id) || []);
    }
  };

  // Mark tab as active when rendered
  if (!activeTab) {
    setTimeout(() => setActiveTab(true), 0);
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Services</span>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white" 
              size="sm"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : services && services.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === services.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add new service row */}
              {isAdding && editingId === -1 && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Checkbox disabled />
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Service Title"
                      value={editData.title || ""}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="max-w-xs"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      placeholder="Short description..."
                      value={editData.shortDescription || ""}
                      onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                      className="max-w-md"
                      rows={2}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        disabled={createService.isPending || !editData.title}
                      >
                        {createService.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {/* Existing services */}
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(service.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, service.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== service.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-primary" />
                    </div>
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <Input
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{service.title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <Textarea
                        value={editData.shortDescription || ""}
                        onChange={(e) => setEditData({ ...editData, shortDescription: e.target.value })}
                        className="max-w-md"
                        rows={2}
                      />
                    ) : (
                      <span className="text-sm text-muted-foreground line-clamp-2">
                        {service.shortDescription}
                      </span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === service.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSave}
                          disabled={updateService.isPending}
                        >
                          {updateService.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(service)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteService.mutate(service.id)}
                          disabled={deleteService.isPending}
                        >
                          {deleteService.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No services yet. Add your first service to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Locations Tab (similar pattern)
function LocationsTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  const utils = trpc.useUtils();
  const { data: locations, isLoading } = trpc.locations.list.useQuery(undefined, {
    enabled: activeTab,
  });

  const createLocation = trpc.locations.create.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setEditingId(null);
      setEditData({});
      utils.locations.list.invalidate();
      toast.success("Location created successfully");
    },
    onError: () => {
      toast.error("Failed to create location");
    },
  });

  const updateLocation = trpc.locations.update.useMutation({
    onMutate: async (newData) => {
      await utils.locations.list.cancel();
      const previousLocations = utils.locations.list.getData();
      utils.locations.list.setData(undefined, (old) =>
        old?.map((l) => (l.id === newData.id ? { ...l, ...newData } : l))
      );
      return { previousLocations };
    },
    onError: (err, newData, context) => {
      utils.locations.list.setData(undefined, context?.previousLocations);
      toast.error("Failed to update location");
    },
    onSuccess: () => {
      setEditingId(null);
      setEditData({});
      toast.success("Location updated successfully");
    },
  });

  const deleteLocation = trpc.locations.delete.useMutation({
    onMutate: async (id) => {
      await utils.locations.list.cancel();
      const previousLocations = utils.locations.list.getData();
      utils.locations.list.setData(undefined, (old) => old?.filter((l) => l.id !== id));
      return { previousLocations };
    },
    onError: (err, id, context) => {
      utils.locations.list.setData(undefined, context?.previousLocations);
      toast.error("Failed to delete location");
    },
    onSuccess: () => {
      toast.success("Location deleted successfully");
    },
  });

  const handleEdit = (location: any) => {
    setEditingId(location.id);
    setEditData(location);
  };

  const handleSave = () => {
    if (isAdding) {
      // Create new location
      createLocation.mutate(editData);
    } else if (editingId) {
      // Update existing location
      updateLocation.mutate({ id: editingId, data: editData });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(-1);
    setEditData({
      name: "",
      country: "",
      region: "",
      description: "",
      image: "",
      projectCount: 0,
      specialization: "",
      order: 0,
      isActive: true,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected locations?`)) {
      selectedIds.forEach((id) => deleteLocation.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === locations?.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(locations?.map((l) => l.id) || []);
    }
  };

  if (!activeTab) {
    setTimeout(() => setActiveTab(true), 0);
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Locations</span>
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white" 
              size="sm"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Location
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : locations && locations.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === locations.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Properties</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add new location row */}
              {isAdding && editingId === -1 && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Checkbox disabled />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Location Name"
                      value={editData.name || ""}
                      onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                      className="max-w-xs"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Country"
                      value={editData.country || ""}
                      onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">0</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        disabled={createLocation.isPending || !editData.name || !editData.country}
                      >
                        {createLocation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {/* Existing locations */}
              {locations.map((location) => (
                <TableRow key={location.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(location.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, location.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== location.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === location.id ? (
                      <Input
                        value={editData.name || ""}
                        onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{location.name}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === location.id ? (
                      <Input
                        value={editData.country || ""}
                        onChange={(e) => setEditData({ ...editData, country: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span>{location.country}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{location.projectCount || 0}</Badge>
                  </TableCell>
                  <TableCell>
                    {location.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === location.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSave}
                          disabled={updateLocation.isPending}
                        >
                          {updateLocation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(location)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteLocation.mutate(location.id)}
                          disabled={deleteLocation.isPending}
                        >
                          {deleteLocation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No locations yet. Add your first location to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



// Success Stories Tab
function SuccessStoriesTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: storiesData, isLoading } = trpc.successStories.list.useQuery(undefined, {
    enabled: activeTab,
  });

  const stories = storiesData?.items || [];

  const deleteStory = trpc.successStories.delete.useMutation({
    onMutate: async (deletedId) => {
      await utils.successStories.list.cancel();
      const previousStories = utils.successStories.list.getData();
      utils.successStories.list.setData(undefined, (old: any) =>
        old ? {
          ...old,
          items: old.items.filter((story: any) => story.id !== deletedId)
        } : old
      );
      return { previousStories };
    },
    onError: (err, deletedId, context) => {
      utils.successStories.list.setData(undefined, context?.previousStories);
      toast.error("Failed to delete success story");
    },
    onSettled: () => {
      utils.successStories.list.invalidate();
    },
  });

  useEffect(() => {
    setActiveTab(true);
  }, []);

  const handleEditStory = (story: any) => {
    setEditingStory(story);
    setEditDialogOpen(true);
  };

  const handleAddStory = () => {
    setEditingStory(null);
    setEditDialogOpen(true);
  };

  const handleDialogClose = () => {
    setEditDialogOpen(false);
    setEditingStory(null);
  };

  const handleDialogSuccess = () => {
    utils.successStories.list.invalidate();
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected success stories?`)) {
      selectedIds.forEach((id) => deleteStory.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === stories.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(stories.map((s: any) => s.id));
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Success Stories
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white" 
              size="sm"
              onClick={handleAddStory}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Success Story
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : stories && stories.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === stories.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Existing stories */}
              {stories.map((story: any) => (
                <TableRow key={story.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(story.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, story.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== story.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{story.title}</span>
                  </TableCell>
                  <TableCell>
                    <span>{story.client || "-"}</span>
                  </TableCell>
                  <TableCell>
                    <span>{story.location || "-"}</span>
                  </TableCell>
                  <TableCell>
                    {story.featured ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {story.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditStory(story)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteStory.mutate(story.id)}
                        disabled={deleteStory.isPending}
                      >
                        {deleteStory.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No success stories yet. Add your first story to get started.</p>
          </div>
        )}
      </CardContent>
      
      <SuccessStoryEditDialog
        story={editingStory}
        isOpen={editDialogOpen}
        onClose={handleDialogClose}
        onSuccess={handleDialogSuccess}
      />
    </Card>
  );
}

// Market Reports Tab
function MarketReportsTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  // Removed uploadingFile and uploadingThumbnail states - now handled by PDFUpload component

  const utils = trpc.useUtils();
  const { data: reportsData, isLoading } = trpc.marketReports.list.useQuery(undefined, {
    enabled: activeTab,
  });

  const reports = reportsData || [];

  const createReport = trpc.marketReports.create.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setEditingId(null);
      setEditData({});
      utils.marketReports.list.invalidate();
      toast.success("Market report created successfully");
    },
    onError: () => {
      toast.error("Failed to create market report");
    },
  });

  const updateReport = trpc.marketReports.update.useMutation({
    onMutate: async (newData) => {
      await utils.marketReports.list.cancel();
      const previousReports = utils.marketReports.list.getData();
      utils.marketReports.list.setData(undefined, (old: any) =>
        old ? old.map((report: any) =>
          report.id === newData.id ? { ...report, ...newData.data } : report
        ) : old
      );
      return { previousReports };
    },
    onError: (err, newData, context) => {
      utils.marketReports.list.setData(undefined, context?.previousReports);
      toast.error("Failed to update market report");
    },
    onSettled: () => {
      utils.marketReports.list.invalidate();
      setEditingId(null);
      setEditData({});
    },
  });

  const deleteReport = trpc.marketReports.delete.useMutation({
    onMutate: async (deletedId) => {
      await utils.marketReports.list.cancel();
      const previousReports = utils.marketReports.list.getData();
      utils.marketReports.list.setData(undefined, (old: any) =>
        old ? old.filter((report: any) => report.id !== deletedId) : old
      );
      return { previousReports };
    },
    onError: (err, deletedId, context) => {
      utils.marketReports.list.setData(undefined, context?.previousReports);
      toast.error("Failed to delete market report");
    },
    onSettled: () => {
      utils.marketReports.list.invalidate();
    },
  });

  useEffect(() => {
    setActiveTab(true);
  }, []);

  const handleEdit = (report: any) => {
    setEditingId(report.id);
    setEditData(report);
  };

  const handlePDFUploadComplete = (fileUrl: string, thumbnailUrl: string) => {
    setEditData({ ...editData, fileUrl, thumbnailUrl });
  };

  const handleSave = () => {
    if (isAdding) {
      // Create new report
      const slug = editData.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      createReport.mutate({ ...editData, slug });
    } else if (editingId) {
      // Update existing report
      updateReport.mutate({ id: editingId, data: editData });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(-1);
    setEditData({
      title: "",
      category: "",
      region: "",
      description: "",
      fileUrl: "",
      fileKey: "",
      featured: false,
      isActive: true,
    });
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (confirm(`Delete ${selectedIds.length} selected market reports?`)) {
      selectedIds.forEach((id) => deleteReport.mutate(id));
      setSelectedIds([]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === reports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(reports.map((r: any) => r.id));
    }
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Market Reports
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete ({selectedIds.length})
              </Button>
            )}
            <Button 
              className="bg-secondary hover:bg-secondary/90 text-white" 
              size="sm"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Market Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton />
        ) : reports && reports.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.length === reports.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Region</TableHead>
                <TableHead className="w-96">PDF Upload</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Add new report row */}
              {isAdding && editingId === -1 && (
                <TableRow className="bg-muted/50">
                  <TableCell>
                    <Checkbox disabled />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Report Title"
                      value={editData.title || ""}
                      onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                      className="max-w-xs"
                      autoFocus
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Category"
                      value={editData.category || ""}
                      onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Region"
                      value={editData.region || ""}
                      onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                      className="max-w-xs"
                    />
                  </TableCell>
                  <TableCell colSpan={1}>
                    <PDFUpload
                      onUploadComplete={handlePDFUploadComplete}
                      currentFileUrl={editData.fileUrl}
                      currentThumbnailUrl={editData.thumbnailUrl}
                      maxSizeMB={10}
                    />
                  </TableCell>
                  <TableCell>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleSave}
                        disabled={createReport.isPending || !editData.title || !editData.fileUrl}
                      >
                        {createReport.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={handleCancel}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
              {/* Existing reports */}
              {reports.map((report: any) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(report.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedIds([...selectedIds, report.id]);
                        } else {
                          setSelectedIds(selectedIds.filter((id) => id !== report.id));
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {editingId === report.id ? (
                      <Input
                        value={editData.title || ""}
                        onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span className="font-medium">{report.title}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === report.id ? (
                      <Input
                        value={editData.category || ""}
                        onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span>{report.category || "-"}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === report.id ? (
                      <Input
                        value={editData.region || ""}
                        onChange={(e) => setEditData({ ...editData, region: e.target.value })}
                        className="max-w-xs"
                      />
                    ) : (
                      <span>{report.region || "-"}</span>
                    )}
                  </TableCell>
                  <TableCell colSpan={1}>
                    {editingId === report.id ? (
                      <PDFUpload
                        onUploadComplete={handlePDFUploadComplete}
                        currentFileUrl={editData.fileUrl || report.fileUrl}
                        currentThumbnailUrl={editData.thumbnailUrl || report.thumbnailUrl}
                        maxSizeMB={10}
                      />
                    ) : (
                      <div className="flex items-center gap-3">
                        {report.thumbnailUrl && (
                          <img src={report.thumbnailUrl} alt="Thumbnail" className="w-16 h-20 object-cover rounded border" />
                        )}
                        <div className="flex-1">
                          {report.fileUrl ? (
                            <a href={report.fileUrl} target="_blank" rel="noopener noreferrer">
                              <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                                View PDF
                              </Badge>
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">No PDF uploaded</span>
                          )}
                        </div>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {report.isActive ? (
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === report.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleSave}
                          disabled={updateReport.isPending}
                        >
                          {updateReport.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Check className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={handleCancel}>
                          <X className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(report)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReport.mutate(report.id)}
                          disabled={deleteReport.isPending}
                        >
                          {deleteReport.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 text-red-600" />
                          )}
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No market reports yet. Add your first report to get started.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Legal Pages Tab - UPDATED with JSON-based multi-language support
// This component stores all 3 languages (EN, DE, ZH) in a single 'content' field as JSON
// Format: { "en": "<html>", "de": "<html>", "zh": "<html>" }

function LegalPagesTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [isAdding, setIsAdding] = useState(false);
  const [contentLang, setContentLang] = useState<"en" | "de" | "zh">("en");

  const utils = trpc.useUtils();
  const { data: pages, isLoading } = trpc.legalPages.listAll.useQuery(undefined, {
    enabled: activeTab,
  });

  // Parse JSON content into separate language fields for editing
  const parseContentForEdit = (page: any) => {
    let contentEn = "";
    let contentDe = "";
    let contentZh = "";
    
    if (page.content) {
      try {
        const parsed = JSON.parse(page.content);
        if (typeof parsed === "object" && (parsed.en || parsed.de || parsed.zh)) {
          contentEn = parsed.en || "";
          contentDe = parsed.de || "";
          contentZh = parsed.zh || "";
        } else {
          // Not valid JSON format, treat as English content
          contentEn = page.content;
        }
      } catch (e) {
        // Not JSON, treat entire content as English (legacy format)
        contentEn = page.content;
      }
    }
    
    return {
      ...page,
      contentEn,
      contentDe,
      contentZh,
    };
  };

  // Convert separate language fields back to JSON for saving
  const prepareContentForSave = (data: any) => {
    const jsonContent = JSON.stringify({
      en: data.contentEn || "",
      de: data.contentDe || "",
      zh: data.contentZh || "",
    });
    
    return {
      title: data.title,
      slug: data.slug,
      content: jsonContent,
      metaTitle: data.metaTitle,
      metaDescription: data.metaDescription,
      isActive: data.isActive,
      order: data.order,
    };
  };

  const createPage = trpc.legalPages.create.useMutation({
    onSuccess: () => {
      setIsAdding(false);
      setEditingId(null);
      setEditData({});
      setContentLang("en");
      utils.legalPages.listAll.invalidate();
      toast.success("Legal page created successfully");
    },
    onError: () => {
      toast.error("Failed to create legal page");
    },
  });

  const updatePage = trpc.legalPages.update.useMutation({
    onMutate: async (newData) => {
      await utils.legalPages.listAll.cancel();
      const previousPages = utils.legalPages.listAll.getData();
      utils.legalPages.listAll.setData(undefined, (old: any) =>
        old ? old.map((page: any) =>
          page.id === newData.id ? { ...page, ...newData } : page
        ) : old
      );
      return { previousPages };
    },
    onError: (err, newData, context) => {
      utils.legalPages.listAll.setData(undefined, context?.previousPages);
      toast.error("Failed to update legal page");
    },
    onSettled: () => {
      utils.legalPages.listAll.invalidate();
      setEditingId(null);
      setEditData({});
      setContentLang("en");
      toast.success("Legal page updated successfully");
    },
  });

  const deletePage = trpc.legalPages.delete.useMutation({
    onSuccess: () => {
      utils.legalPages.listAll.invalidate();
      toast.success("Legal page deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete legal page");
    },
  });

  useEffect(() => {
    setActiveTab(true);
  }, []);

  const handleEdit = (page: any) => {
    setEditingId(page.id);
    setEditData(parseContentForEdit(page));
    setContentLang("en");
  };

  const handleSave = () => {
    const dataToSave = prepareContentForSave(editData);
    
    if (isAdding) {
      createPage.mutate(dataToSave);
    } else if (editingId) {
      updatePage.mutate({ id: editingId, ...dataToSave });
    }
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setEditData({});
    setContentLang("en");
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(-1);
    setEditData({
      title: "",
      slug: "",
      contentEn: "",
      contentDe: "",
      contentZh: "",
      metaTitle: "",
      metaDescription: "",
      isActive: true,
      order: 0,
    });
    setContentLang("en");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this legal page?")) {
      deletePage.mutate(id);
    }
  };

  // Get current content field based on selected language
  const getCurrentContentField = () => {
    if (contentLang === "de") return "contentDe";
    if (contentLang === "zh") return "contentZh";
    return "contentEn";
  };

  const getPlaceholder = () => {
    if (contentLang === "de") return "Geben Sie den Inhalt der rechtlichen Seite auf Deutsch ein...";
    if (contentLang === "zh") return "请输入中文法律页面内容...";
    return "Enter legal page content in English...";
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Legal Pages</span>
          <Button 
            className="bg-secondary hover:bg-secondary/90 text-white" 
            size="sm"
            onClick={handleAdd}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Legal Page
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="space-y-6">
            {/* Add new page form */}
            {isAdding && editingId === -1 && (
              <Card className="border-2 border-secondary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-lg">
                    <span className="text-secondary">New Legal Page</span>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSave}
                        disabled={createPage.isPending || !editData.title || !editData.slug}
                      >
                        {createPage.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={handleCancel}>
                        <X className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Title *</label>
                        <Input
                          value={editData.title || ""}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          placeholder="Cookie Policy"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Slug *</label>
                        <Input
                          value={editData.slug || ""}
                          onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                          placeholder="cookie-policy"
                        />
                      </div>
                    </div>
                    
                    {/* Language tabs for content */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Content</label>
                      <div className="flex gap-2 mb-3">
                        <Button
                          type="button"
                          variant={contentLang === "en" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContentLang("en")}
                          className={contentLang === "en" ? "bg-primary" : ""}
                        >
                          English {editData.contentEn ? "✓" : ""}
                        </Button>
                        <Button
                          type="button"
                          variant={contentLang === "de" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContentLang("de")}
                          className={contentLang === "de" ? "bg-primary" : ""}
                        >
                          Deutsch {editData.contentDe ? "✓" : ""}
                        </Button>
                        <Button
                          type="button"
                          variant={contentLang === "zh" ? "default" : "outline"}
                          size="sm"
                          onClick={() => setContentLang("zh")}
                          className={contentLang === "zh" ? "bg-primary" : ""}
                        >
                          中文 {editData.contentZh ? "✓" : ""}
                        </Button>
                      </div>
                      <div className="min-h-[400px] border rounded-md">
                        <RichTextEditor
                          content={editData[getCurrentContentField()] || ""}
                          onChange={(content) => setEditData({ ...editData, [getCurrentContentField()]: content })}
                          placeholder={getPlaceholder()}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Meta Title</label>
                        <Input
                          value={editData.metaTitle || ""}
                          onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })}
                          placeholder="SEO title"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Meta Description</label>
                        <Textarea
                          value={editData.metaDescription || ""}
                          onChange={(e) => setEditData({ ...editData, metaDescription: e.target.value })}
                          placeholder="SEO description"
                          rows={2}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Existing pages */}
            {pages && pages.length > 0 ? (
              pages.map((page: any) => (
                <Card key={page.id} className="border">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-lg">
                      {editingId === page.id ? (
                        <Input
                          value={editData.title || ""}
                          onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                          className="max-w-md"
                        />
                      ) : (
                        <span>{page.title}</span>
                      )}
                      <div className="flex gap-2">
                        {editingId === page.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleSave}
                              disabled={updatePage.isPending}
                            >
                              {updatePage.isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={handleCancel}>
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(page)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(page.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {editingId === page.id ? (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Slug</label>
                          <Input
                            value={editData.slug || ""}
                            onChange={(e) => setEditData({ ...editData, slug: e.target.value })}
                            placeholder="privacy-policy"
                          />
                        </div>
                        
                        {/* Language tabs for content */}
                        <div>
                          <label className="text-sm font-medium mb-2 block">Content</label>
                          <div className="flex gap-2 mb-3">
                            <Button
                              type="button"
                              variant={contentLang === "en" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContentLang("en")}
                              className={contentLang === "en" ? "bg-primary" : ""}
                            >
                              English {editData.contentEn ? "✓" : ""}
                            </Button>
                            <Button
                              type="button"
                              variant={contentLang === "de" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContentLang("de")}
                              className={contentLang === "de" ? "bg-primary" : ""}
                            >
                              Deutsch {editData.contentDe ? "✓" : ""}
                            </Button>
                            <Button
                              type="button"
                              variant={contentLang === "zh" ? "default" : "outline"}
                              size="sm"
                              onClick={() => setContentLang("zh")}
                              className={contentLang === "zh" ? "bg-primary" : ""}
                            >
                              中文 {editData.contentZh ? "✓" : ""}
                            </Button>
                          </div>
                          <div className="min-h-[400px] border rounded-md">
                            <RichTextEditor
                              content={editData[getCurrentContentField()] || ""}
                              onChange={(content) => setEditData({ ...editData, [getCurrentContentField()]: content })}
                              placeholder={getPlaceholder()}
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Meta Title</label>
                            <Input
                              value={editData.metaTitle || ""}
                              onChange={(e) => setEditData({ ...editData, metaTitle: e.target.value })}
                              placeholder="SEO title"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Meta Description</label>
                            <Textarea
                              value={editData.metaDescription || ""}
                              onChange={(e) => setEditData({ ...editData, metaDescription: e.target.value })}
                              placeholder="SEO description"
                              rows={2}
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        {(() => {
                          // Try to parse and show English content preview
                          try {
                            const parsed = JSON.parse(page.content || "{}");
                            const preview = parsed.en || parsed.de || parsed.zh || "";
                            return (
                              <div>
                                <div className="flex gap-2 mb-2">
                                  {parsed.en && <Badge variant="outline">EN ✓</Badge>}
                                  {parsed.de && <Badge variant="outline">DE ✓</Badge>}
                                  {parsed.zh && <Badge variant="outline">ZH ✓</Badge>}
                                </div>
                                <div 
                                  className="text-muted-foreground line-clamp-3"
                                  dangerouslySetInnerHTML={{ __html: preview.substring(0, 300) + "..." }} 
                                />
                              </div>
                            );
                          } catch (e) {
                            // Legacy format - show as-is
                            return (
                              <div 
                                className="text-muted-foreground line-clamp-3"
                                dangerouslySetInnerHTML={{ __html: (page.content || "<p>No content yet</p>").substring(0, 300) + "..." }} 
                              />
                            );
                          }
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : !isAdding && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No legal pages found. Click "Add Legal Page" to create one.</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}


export default function ContentManagement() {
  const [activeTab, setActiveTab] = useState("services");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Content Management</h1>
        <p className="text-muted-foreground">Manage website content</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="locations">Locations</TabsTrigger>
          <TabsTrigger value="stories">Success Stories</TabsTrigger>
          <TabsTrigger value="reports">Market Reports</TabsTrigger>
          <TabsTrigger value="legal">Legal Pages</TabsTrigger>
        </TabsList>
        <TabsContent value="services" className="mt-6">
          {activeTab === "services" && <ServicesTab />}
        </TabsContent>
        <TabsContent value="locations" className="mt-6">
          {activeTab === "locations" && <LocationsTab />}
        </TabsContent>
        <TabsContent value="stories" className="mt-6">
          {activeTab === "stories" && <SuccessStoriesTab />}
        </TabsContent>
        <TabsContent value="reports" className="mt-6">
          {activeTab === "reports" && <MarketReportsTab />}
        </TabsContent>
        <TabsContent value="legal" className="mt-6">
          {activeTab === "legal" && <LegalPagesTab />}
        </TabsContent>
      </Tabs>
    </div>
  );
}
