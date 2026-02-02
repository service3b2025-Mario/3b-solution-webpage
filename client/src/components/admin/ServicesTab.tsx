import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, Loader2, TrendingUp, Building2, Users, Globe, Shield, BarChart3, Briefcase, Target, Landmark, Home, Key, Lightbulb, LineChart, Hammer, Award, CheckCircle, GripVertical, Eye, EyeOff } from "lucide-react";
import { ServiceEditDialog } from "@/components/ServiceEditDialog";
import { toast } from "sonner";

// Icon mapping
const iconMap: Record<string, any> = {
  TrendingUp, Building2, Users, Globe, Shield, BarChart3, Briefcase, Target,
  Landmark, Home, Key, Lightbulb, LineChart, Hammer, Award, CheckCircle
};

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

export function ServicesTab() {
  const [activeTab, setActiveTab] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const utils = trpc.useUtils();
  const { data: services, isLoading } = trpc.services.list.useQuery(undefined, {
    enabled: activeTab,
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

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => {
      utils.services.list.invalidate();
      toast.success("Service updated successfully");
    },
    onError: () => {
      toast.error("Failed to update service");
    },
  });

  const handleEdit = (service: any) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  const handleAdd = () => {
    setSelectedService(null);
    setEditDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteService.mutate(id);
    }
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

  const toggleActive = (service: any) => {
    updateService.mutate({
      id: service.id,
      data: { isActive: !service.isActive },
    });
  };

  // Mark tab as active when rendered
  if (!activeTab) {
    setTimeout(() => setActiveTab(true), 0);
  }

  // Sort services by order
  const sortedServices = services ? [...services].sort((a, b) => (a.order || 0) - (b.order || 0)) : [];

  return (
    <>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span>Services</span>
              <Badge variant="outline" className="font-normal">
                {services?.length || 0} / 6 max
              </Badge>
            </div>
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
                disabled={(services?.length || 0) >= 6}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Service
              </Button>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            Manage your service offerings. Click on a service to edit its full content including rich text descriptions.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : sortedServices && sortedServices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedIds.length === services?.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead className="w-16">Icon</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-24">Features</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedServices.map((service) => {
                  const IconComponent = iconMap[service.icon || "TrendingUp"] || TrendingUp;
                  const features = (service.features as string[]) || [];
                  
                  return (
                    <TableRow 
                      key={service.id} 
                      className={`cursor-pointer hover:bg-muted/50 ${!service.isActive ? 'opacity-60' : ''}`}
                      onClick={() => handleEdit(service)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
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
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <GripVertical className="w-4 h-4" />
                          <span className="font-mono text-sm">{service.order || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 text-secondary" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{service.title}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2 max-w-md">
                          {service.shortDescription}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {features.length} items
                        </Badge>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleActive(service)}
                          className={service.isActive ? "text-green-600" : "text-muted-foreground"}
                        >
                          {service.isActive ? (
                            <>
                              <Eye className="w-4 h-4 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4 mr-1" />
                              Hidden
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(service)}
                            title="Edit service"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(service.id)}
                            disabled={deleteService.isPending}
                            title="Delete service"
                          >
                            {deleteService.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-red-600" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No services yet</h3>
              <p className="text-muted-foreground mb-4">Add your first service to get started.</p>
              <Button onClick={handleAdd} className="bg-secondary hover:bg-secondary/90">
                <Plus className="w-4 h-4 mr-2" />
                Add First Service
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <ServiceEditDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        service={selectedService}
        onSuccess={() => {
          utils.services.list.invalidate();
        }}
      />
    </>
  );
}
