import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, FileText, Image, FileDown } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface DownloadGateModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resourceType: "report" | "brochure" | "photo" | "document" | "guide";
  resourceId?: number;
  resourceTitle: string;
  resourceUrl: string;
  onDownloadComplete?: () => void;
}

export default function DownloadGateModal({
  open,
  onOpenChange,
  resourceType,
  resourceId,
  resourceTitle,
  resourceUrl,
  onDownloadComplete,
}: DownloadGateModalProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trackDownload = trpc.downloads.track.useMutation({
    onSuccess: () => {
      toast.success("Download started! Thank you for your interest.");
      
      // Trigger the actual download
      window.open(resourceUrl, '_blank');
      
      // Reset form and close modal
      setFullName("");
      setEmail("");
      onOpenChange(false);
      
      // Call completion callback if provided
      if (onDownloadComplete) {
        onDownloadComplete();
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to process download. Please try again.");
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await trackDownload.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        resourceType,
        resourceId,
        resourceTitle,
        resourceUrl,
      });
    } catch (error) {
      // Error handling is done in onError callback
      setIsSubmitting(false);
    }
  };

  const getIcon = () => {
    switch (resourceType) {
      case "report":
        return <FileText className="w-12 h-12 text-primary" />;
      case "photo":
        return <Image className="w-12 h-12 text-primary" />;
      case "brochure":
      case "document":
      case "guide":
        return <FileDown className="w-12 h-12 text-primary" />;
      default:
        return <Download className="w-12 h-12 text-primary" />;
    }
  };

  const getResourceTypeLabel = () => {
    switch (resourceType) {
      case "report":
        return "Market Report";
      case "brochure":
        return "Property Brochure";
      case "photo":
        return "High-Resolution Photo";
      case "document":
        return "Document";
      case "guide":
        return "Property Market Guide";
      default:
        return "Resource";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            {getIcon()}
          </div>
          <DialogTitle className="text-center text-2xl">
            Download {getResourceTypeLabel()}
          </DialogTitle>
          <DialogDescription className="text-center">
            Please provide your information to download <strong>{resourceTitle}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="text-xs text-muted-foreground">
            By downloading, you agree to receive occasional updates about property opportunities. 
            You can unsubscribe anytime.
          </div>

          <Button 
            type="submit" 
            className="w-full bg-secondary hover:bg-secondary/90 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download Now
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
