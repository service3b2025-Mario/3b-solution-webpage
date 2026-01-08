import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SavedSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: {
    region?: string;
    country?: string;
    propertyType?: string;
    priceMin?: number;
    priceMax?: number;
    bedrooms?: number;
    status?: string;
  };
}

export function SavedSearchModal({ open, onOpenChange, filters }: SavedSearchModalProps) {
  const [name, setName] = useState("");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const utils = trpc.useUtils();
  
  const createMutation = trpc.savedSearches.create.useMutation({
    onSuccess: () => {
      utils.savedSearches.list.invalidate();
      toast.success("Search saved successfully");
      setName("");
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to save search");
    },
  });
  
  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Please enter a name for this search");
      return;
    }
    
    createMutation.mutate({
      name: name.trim(),
      filters,
      notificationsEnabled,
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save Search</DialogTitle>
          <DialogDescription>
            Save your current search criteria to receive notifications when matching properties are added.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Search Name</Label>
            <Input
              id="name"
              placeholder="e.g., Luxury Hotels in Maldives"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when new properties match this search
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notificationsEnabled}
              onCheckedChange={setNotificationsEnabled}
            />
          </div>
          
          <div className="bg-muted p-4 rounded-lg space-y-2">
            <p className="text-sm font-medium">Current Filters:</p>
            <div className="text-sm text-muted-foreground space-y-1">
              {filters.region && <p>• Region: {filters.region}</p>}
              {filters.country && <p>• Country: {filters.country}</p>}
              {filters.propertyType && <p>• Type: {filters.propertyType}</p>}
              {(filters.priceMin || filters.priceMax) && (
                <p>• Price: ${filters.priceMin?.toLocaleString() || "0"} - ${filters.priceMax?.toLocaleString() || "∞"}</p>
              )}
              {filters.bedrooms && <p>• Bedrooms: {filters.bedrooms}+</p>}
              {filters.status && <p>• Status: {filters.status}</p>}
              {Object.keys(filters).length === 0 && <p className="text-muted-foreground">No filters applied</p>}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={createMutation.isPending}
            className="flex-1"
          >
            {createMutation.isPending ? "Saving..." : "Save Search"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
