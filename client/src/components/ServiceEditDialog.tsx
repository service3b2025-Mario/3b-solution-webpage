import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Badge } from "@/components/ui/badge";
import { X, Plus, Loader2, TrendingUp, Building2, Users, Globe, Shield, BarChart3, Briefcase, Target, Landmark, Home, Key, Lightbulb, LineChart, Hammer, Award, CheckCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// Available icons for services
const availableIcons = [
  { name: "TrendingUp", icon: TrendingUp, label: "Trending Up" },
  { name: "Building2", icon: Building2, label: "Building" },
  { name: "Users", icon: Users, label: "Users" },
  { name: "Globe", icon: Globe, label: "Globe" },
  { name: "Shield", icon: Shield, label: "Shield" },
  { name: "BarChart3", icon: BarChart3, label: "Bar Chart" },
  { name: "Briefcase", icon: Briefcase, label: "Briefcase" },
  { name: "Target", icon: Target, label: "Target" },
  { name: "Landmark", icon: Landmark, label: "Landmark" },
  { name: "Home", icon: Home, label: "Home" },
  { name: "Key", icon: Key, label: "Key" },
  { name: "Lightbulb", icon: Lightbulb, label: "Lightbulb" },
  { name: "LineChart", icon: LineChart, label: "Line Chart" },
  { name: "Hammer", icon: Hammer, label: "Hammer" },
  { name: "Award", icon: Award, label: "Award" },
  { name: "CheckCircle", icon: CheckCircle, label: "Check Circle" },
];

interface ServiceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: {
    id: number;
    title: string;
    slug: string;
    shortDescription: string | null;
    fullDescription: string | null;
    icon: string | null;
    image: string | null;
    features: string[] | null;
    order: number | null;
    isActive: boolean | null;
  } | null;
  onSuccess?: () => void;
}

export function ServiceEditDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceEditDialogProps) {
  const isEditing = !!service?.id;
  const utils = trpc.useUtils();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    icon: "TrendingUp",
    image: "",
    features: [] as string[],
    order: 0,
    isActive: true,
  });

  const [newFeature, setNewFeature] = useState("");
  const [activeTab, setActiveTab] = useState("basic");

  // Initialize form data when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        title: service.title || "",
        slug: service.slug || "",
        shortDescription: service.shortDescription || "",
        fullDescription: service.fullDescription || "",
        icon: service.icon || "TrendingUp",
        image: service.image || "",
        features: service.features || [],
        order: service.order || 0,
        isActive: service.isActive ?? true,
      });
    } else {
      // Reset for new service
      setFormData({
        title: "",
        slug: "",
        shortDescription: "",
        fullDescription: "",
        icon: "TrendingUp",
        image: "",
        features: [],
        order: 0,
        isActive: true,
      });
    }
    setActiveTab("basic");
  }, [service, open]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || generateSlug(title),
    }));
  };

  // Feature management
  const addFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeature.trim()],
      }));
      setNewFeature("");
    }
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  // Mutations
  const createService = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Service created successfully");
      utils.services.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to create service: ${error.message}`);
    },
  });

  const updateService = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Service updated successfully");
      utils.services.list.invalidate();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update service: ${error.message}`);
    },
  });

  const handleSubmit = () => {
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }

    if (!formData.slug.trim()) {
      toast.error("Slug is required");
      return;
    }

    if (isEditing && service) {
      updateService.mutate({
        id: service.id,
        data: formData,
      });
    } else {
      createService.mutate(formData);
    }
  };

  const isPending = createService.isPending || updateService.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Service" : "Add New Service"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="content">Content & Features</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Basic Info Tab */}
          <TabsContent value="basic" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Service Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g., Buyers Advisory"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  placeholder="e.g., buyers-advisory"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={formData.shortDescription}
                onChange={(e) =>
                  setFormData({ ...formData, shortDescription: e.target.value })
                }
                placeholder="Brief description shown in service cards (1-2 sentences)"
                rows={2}
              />
              <p className="text-xs text-muted-foreground">
                This appears as the subtitle under the service title
              </p>
            </div>

            <div className="space-y-2">
              <Label>Select Icon</Label>
              <div className="grid grid-cols-8 gap-2">
                {availableIcons.map(({ name, icon: Icon, label }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: name })}
                    className={`p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      formData.icon === name
                        ? "border-secondary bg-secondary/10"
                        : "border-border hover:border-secondary/50"
                    }`}
                    title={label}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs truncate w-full text-center">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Content & Features Tab */}
          <TabsContent value="content" className="space-y-6 mt-6">
            <div className="space-y-2">
              <Label>Full Description (Rich Text)</Label>
              <RichTextEditor
                content={formData.fullDescription}
                onChange={(content) =>
                  setFormData({ ...formData, fullDescription: content })
                }
                placeholder="Enter detailed service description with formatting..."
              />
              <p className="text-xs text-muted-foreground">
                Use the rich text editor for formatted content. You can also
                paste HTML directly using the HTML button.
              </p>
            </div>

            <div className="space-y-4">
              <Label>Service Features / Bullet Points</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Add a feature (e.g., Market Analysis)"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addFeature();
                    }
                  }}
                />
                <Button type="button" onClick={addFeature} variant="secondary">
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>

              {formData.features.length > 0 && (
                <div className="flex flex-wrap gap-2 p-4 bg-muted/30 rounded-lg">
                  {formData.features.map((feature, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="px-3 py-1.5 text-sm flex items-center gap-2"
                    >
                      <span>{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="hover:text-destructive transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">
                These appear as checkmark bullet points under the service
                description
              </p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 mt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="order">Display Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  min={0}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="image">Image URL (Optional)</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Active Status
                </Label>
                <p className="text-sm text-muted-foreground">
                  When disabled, this service won't appear on the website
                </p>
              </div>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, isActive: checked })
                }
              />
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-secondary hover:bg-secondary/90"
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditing ? "Save Changes" : "Create Service"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
