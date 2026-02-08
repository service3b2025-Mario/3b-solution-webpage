import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Upload, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SuccessStory {
  id: number;
  title: string;
  client: string;
  clientType: string;
  location: string;
  timeline: string;
  investmentAmount: string;
  challenge: string;
  solution: string;
  results: string;
  testimonial: string | null;
  imageUrl: string | null;
  featured: boolean;
  status: string;
}

interface SuccessStoryEditDialogProps {
  story: SuccessStory | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function SuccessStoryEditDialog({
  story,
  isOpen,
  onClose,
  onSuccess,
}: SuccessStoryEditDialogProps) {
  const [formData, setFormData] = useState<Partial<SuccessStory>>({
    title: "",
    client: "",
    clientType: "",
    location: "",
    timeline: "",
    investmentAmount: "",
    challenge: "",
    solution: "",
    results: "",
    testimonial: "",
    imageUrl: "",
    featured: false,
    status: "active",
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  // Update form data when story changes
  useEffect(() => {
    if (story) {
      setFormData(story);
      setUploadedImage(story.imageUrl || null);
    } else {
      setFormData({
        title: "",
        client: "",
        clientType: "",
        location: "",
        timeline: "",
        investmentAmount: "",
        challenge: "",
        solution: "",
        results: "",
        testimonial: "",
        imageUrl: "",
        featured: false,
        status: "active",
      });
      setUploadedImage(null);
    }
  }, [story, isOpen]);
  const [isUploading, setIsUploading] = useState(false);

  const utils = trpc.useUtils();

  const createMutation = trpc.successStories.create.useMutation({
    onSuccess: () => {
      toast.success("Success story created successfully");
      utils.successStories.list.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to create success story: ${error.message}`);
    },
  });

  const updateMutation = trpc.successStories.update.useMutation({
    onSuccess: () => {
      toast.success("Success story updated successfully");
      utils.successStories.list.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error(`Failed to update success story: ${error.message}`);
    },
  });

  const uploadImageMutation = trpc.storage.uploadImage.useMutation({
    onSuccess: (data) => {
      setUploadedImage(data.url);
      setFormData((prev) => ({ ...prev, imageUrl: data.url }));
      setIsUploading(false);
      toast.success("Image uploaded successfully");
    },
    onError: (error) => {
      setIsUploading(false);
      toast.error(`Failed to upload image: ${error.message}`);
    },
  });

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const base64Data = base64.split(",")[1];

      uploadImageMutation.mutate({
        filename: `success-story-${Date.now()}.${file.name.split(".").pop()}`,
        data: base64Data,
        contentType: file.type,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setUploadedImage(null);
    setFormData((prev) => ({ ...prev, imageUrl: null }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.client || !formData.location) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (story) {
      updateMutation.mutate({
        id: story.id,
        ...formData,
      } as any);
    } else {
      createMutation.mutate(formData as any);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {story ? "Edit Success Story" : "Add Success Story"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload Section */}
          <div className="space-y-2">
            <Label>Success Story Photo</Label>
            {uploadedImage ? (
              <div className="relative">
                <img
                  src={uploadedImage}
                  alt="Success story"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleRemoveImage}
                >
                  <X className="h-4 w-4 mr-1" />
                  Remove
                </Button>
              </div>
            ) : (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  disabled={isUploading}
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isUploading ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="text-sm text-muted-foreground">
                        Uploading image...
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        Drag and drop an image here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PNG, JPG, WEBP up to 5MB
                      </p>
                    </div>
                  )}
                </label>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Title <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., International Investor Engagement"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client">
                Client <span className="text-red-500">*</span>
              </Label>
              <Input
                id="client"
                value={formData.client}
                onChange={(e) =>
                  setFormData({ ...formData, client: e.target.value })
                }
                placeholder="e.g., European Family Office"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientType">Client Type</Label>
              <Input
                id="clientType"
                value={formData.clientType}
                onChange={(e) =>
                  setFormData({ ...formData, clientType: e.target.value })
                }
                placeholder="e.g., FamilyOffice, Institutional, Developer"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">
                Location <span className="text-red-500">*</span>
              </Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
                placeholder="e.g., Manila, Philippines"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) =>
                  setFormData({ ...formData, timeline: e.target.value })
                }
                placeholder="e.g., 3 months"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="investmentAmount">Purchase Amount</Label>
              <Input
                id="investmentAmount"
                value={formData.investmentAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    investmentAmount: e.target.value,
                  })
                }
                placeholder="e.g., Confidential or $5,000,000"
              />
            </div>
          </div>

          {/* Story Content */}
          <div className="space-y-2">
            <Label htmlFor="challenge">The Challenge</Label>
            <Textarea
              id="challenge"
              value={formData.challenge}
              onChange={(e) =>
                setFormData({ ...formData, challenge: e.target.value })
              }
              placeholder="Describe the client's challenge or situation..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="solution">Our Solution</Label>
            <Textarea
              id="solution"
              value={formData.solution}
              onChange={(e) =>
                setFormData({ ...formData, solution: e.target.value })
              }
              placeholder="Describe how 3B Solution helped..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="results">The Results</Label>
            <Textarea
              id="results"
              value={formData.results}
              onChange={(e) =>
                setFormData({ ...formData, results: e.target.value })
              }
              placeholder="Describe the outcomes and achievements..."
              rows={4}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="testimonial">Client Testimonial (Optional)</Label>
            <Textarea
              id="testimonial"
              value={formData.testimonial || ""}
              onChange={(e) =>
                setFormData({ ...formData, testimonial: e.target.value })
              }
              placeholder="Add a quote from the client..."
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Settings */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="featured">Featured Story</Label>
              <p className="text-sm text-muted-foreground">
                Display this story prominently on the homepage
              </p>
            </div>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData({ ...formData, featured: checked })
              }
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {story ? "Update Story" : "Create Story"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
