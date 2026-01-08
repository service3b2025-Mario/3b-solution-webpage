import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Plus, Edit, Trash2, Tag } from "lucide-react";
import { toast } from "sonner";

export function TagManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<{ id: number; name: string; color: string; description?: string | null } | null>(null);
  const [newTag, setNewTag] = useState({ name: "", color: "#3B82F6", description: "" });

  const utils = trpc.useUtils();
  const { data: tags, isLoading } = trpc.downloads.tags.list.useQuery();
  const createTag = trpc.downloads.tags.create.useMutation({
    onSuccess: () => {
      utils.downloads.tags.list.invalidate();
      utils.downloads.withTags.invalidate();
      setIsCreateOpen(false);
      setNewTag({ name: "", color: "#3B82F6", description: "" });
      toast.success("Tag created successfully");
    },
    onError: (error) => {
      toast.error(`Failed to create tag: ${error.message}`);
    },
  });

  const updateTag = trpc.downloads.tags.update.useMutation({
    onSuccess: () => {
      utils.downloads.tags.list.invalidate();
      utils.downloads.withTags.invalidate();
      setEditingTag(null);
      toast.success("Tag updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update tag: ${error.message}`);
    },
  });

  const deleteTag = trpc.downloads.tags.delete.useMutation({
    onSuccess: () => {
      utils.downloads.tags.list.invalidate();
      utils.downloads.withTags.invalidate();
      toast.success("Tag deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete tag: ${error.message}`);
    },
  });

  const handleCreateTag = () => {
    if (!newTag.name.trim()) {
      toast.error("Tag name is required");
      return;
    }
    createTag.mutate(newTag);
  };

  const handleUpdateTag = () => {
    if (!editingTag) return;
    updateTag.mutate({
      id: editingTag.id,
      name: editingTag.name,
      color: editingTag.color,
      description: editingTag.description || undefined,
    });
  };

  const handleDeleteTag = (id: number) => {
    if (confirm("Are you sure you want to delete this tag? This will remove it from all downloads.")) {
      deleteTag.mutate(id);
    }
  };

  // Predefined color options
  const colorOptions = [
    { name: "Blue", value: "#3B82F6" },
    { name: "Green", value: "#10B981" },
    { name: "Red", value: "#EF4444" },
    { name: "Yellow", value: "#F59E0B" },
    { name: "Purple", value: "#8B5CF6" },
    { name: "Pink", value: "#EC4899" },
    { name: "Orange", value: "#F97316" },
    { name: "Teal", value: "#14B8A6" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin w-6 h-6 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Manage Tags</h3>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="w-4 h-4" />
              Create Tag
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="tag-name">Tag Name *</Label>
                <Input
                  id="tag-name"
                  placeholder="e.g., Hot Lead, Nurture, Cold"
                  value={newTag.name}
                  onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setNewTag({ ...newTag, color: color.value })}
                      className={`h-10 rounded-md border-2 transition-all ${
                        newTag.color === color.value ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="tag-description">Description (Optional)</Label>
                <Textarea
                  id="tag-description"
                  placeholder="Describe when to use this tag..."
                  value={newTag.description}
                  onChange={(e) => setNewTag({ ...newTag, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleCreateTag} className="w-full" disabled={createTag.isPending}>
                {createTag.isPending ? "Creating..." : "Create Tag"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Existing Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {tags && tags.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">
            No tags created yet. Create your first tag to start segmenting leads.
          </div>
        ) : (
          tags?.map((tag) => (
            <div
              key={tag.id}
              className="border border-border rounded-lg p-4 flex items-start justify-between hover:border-primary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Badge style={{ backgroundColor: tag.color, color: "#fff" }}>
                    {tag.name}
                  </Badge>
                </div>
                {tag.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{tag.description}</p>
                )}
              </div>
              <div className="flex gap-1 ml-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingTag(tag)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDeleteTag(tag.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit Tag Dialog */}
      {editingTag && (
        <Dialog open={!!editingTag} onOpenChange={() => setEditingTag(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Tag</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label htmlFor="edit-tag-name">Tag Name *</Label>
                <Input
                  id="edit-tag-name"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                  maxLength={50}
                />
              </div>
              <div>
                <Label>Color</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setEditingTag({ ...editingTag, color: color.value })}
                      className={`h-10 rounded-md border-2 transition-all ${
                        editingTag.color === color.value ? "border-foreground scale-110" : "border-transparent"
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="edit-tag-description">Description (Optional)</Label>
                <Textarea
                  id="edit-tag-description"
                  value={editingTag.description || ""}
                  onChange={(e) => setEditingTag({ ...editingTag, description: e.target.value })}
                  rows={3}
                />
              </div>
              <Button onClick={handleUpdateTag} className="w-full" disabled={updateTag.isPending}>
                {updateTag.isPending ? "Updating..." : "Update Tag"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
