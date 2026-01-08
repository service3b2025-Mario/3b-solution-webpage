import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { MediaUpload } from "@/components/MediaUpload";
import { Loader2 } from "lucide-react";

interface TeamMemberEditDialogProps {
  member: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamMemberEditDialog({ member, open, onOpenChange }: TeamMemberEditDialogProps) {
  const [name, setName] = useState(member?.name || "");
  const [role, setRole] = useState(member?.role || "");
  const [shortBio, setShortBio] = useState(member?.shortBio || "");
  const [bio, setBio] = useState(member?.bio || "");
  const [photo, setPhoto] = useState(member?.photo || "");
  const [email, setEmail] = useState(member?.email || "");
  const [phone, setPhone] = useState(member?.phone || "");
  const [uploading, setUploading] = useState(false);

  const utils = trpc.useUtils();
  const updateMember = trpc.team.update.useMutation({
    onSuccess: () => {
      utils.team.list.invalidate();
      onOpenChange(false);
    },
  });

  useEffect(() => {
    if (member) {
      setName(member.name || "");
      setRole(member.role || "");
      setShortBio(member.shortBio || "");
      setBio(member.bio || "");
      setPhoto(member.photo || "");
      setEmail(member.email || "");
      setPhone(member.phone || "");
    }
  }, [member]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member?.id) return;

    updateMember.mutate({
      id: member.id,
      data: {
        name,
        role,
        shortBio,
        bio,
        photo,
        email,
        phone,
      },
    });
  };

  const handlePhotoUpload = (urls: string[]) => {
    if (urls.length > 0) {
      setPhoto(urls[0]);
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Team Member</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Photo Upload */}
          <div className="space-y-2">
            <Label>Photo</Label>
            {photo ? (
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-muted">
                    <img src={photo} alt={name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setPhoto("")}
                      className="text-destructive hover:text-destructive"
                    >
                      Remove Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">Or upload a new photo to replace</p>
                  </div>
                </div>
                <MediaUpload
                  images={[]}
                  onImagesChange={handlePhotoUpload}
                  videoUrl=""
                  virtualTourUrl=""
                  onVideoChange={() => {}}
                  onVirtualTourChange={() => {}}
                  maxImages={1}
                  enableWatermark={false}
                />
              </div>
            ) : (
              <MediaUpload
                images={[]}
                onImagesChange={handlePhotoUpload}
                videoUrl=""
                virtualTourUrl=""
                onVideoChange={() => {}}
                onVirtualTourChange={() => {}}
                maxImages={1}
                enableWatermark={false}
              />
            )}
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Role/Title */}
          <div className="space-y-2">
            <Label htmlFor="role">Title *</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g., CEO & Founder"
              required
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          {/* Short Bio */}
          <div className="space-y-2">
            <Label htmlFor="shortBio">Short Bio (for About page)</Label>
            <Textarea
              id="shortBio"
              value={shortBio}
              onChange={(e) => setShortBio(e.target.value)}
              placeholder="Enter a brief 1-2 sentence bio for the About page..."
              rows={2}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">This appears on the About page. Keep it concise (1-2 sentences).</p>
          </div>

          {/* Full Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Full Bio (for Team page)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Enter detailed professional bio for the Team page..."
              rows={8}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">This appears on the Team page. Include full professional background and expertise.</p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMember.isPending || uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateMember.isPending || uploading || !name || !role}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              {updateMember.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
