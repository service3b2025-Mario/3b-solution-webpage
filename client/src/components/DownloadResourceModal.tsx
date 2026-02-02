import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Download, FileText, Loader2, CheckCircle2, Mail } from "lucide-react";


interface DownloadResourceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DownloadResourceModal({ open, onOpenChange }: DownloadResourceModalProps) {

  const [selectedResource, setSelectedResource] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const { data: resources, isLoading } = trpc.resources.list.useQuery(undefined, {
    enabled: open,
  });

  const downloadMutation = trpc.resources.download.useMutation({
    onSuccess: (data) => {
      setDownloadSuccess(true);
      // Email sent with download link - no direct browser download
      
      // Reset after 5 seconds to give user time to read message
      setTimeout(() => {
        setFullName("");
        setEmail("");
        setSelectedResource(null);
        setDownloadSuccess(false);
        onOpenChange(false);
      }, 5000);
    },
    onError: (error) => {
      alert(`Download failed: ${error.message}`);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  const handleDownload = async () => {
    if (!selectedResource || !fullName || !email) {
      alert("Please select a resource and fill in your details.");
      return;
    }

    setIsSubmitting(true);
    downloadMutation.mutate({
      resourceId: selectedResource,
      fullName,
      email,
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      investment_guide: "Property Market Guide",
      market_report: "Market Report",
      property_brochure: "Property Brochure",
      case_study: "Case Study",
      whitepaper: "Whitepaper",
      newsletter: "Newsletter",
    };
    return labels[category] || category;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Download Property Resources</DialogTitle>
          <DialogDescription>
            Select a resource and provide your contact information to access our exclusive property materials.
          </DialogDescription>
        </DialogHeader>

        {downloadSuccess ? (
          <div className="py-12 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <CheckCircle2 className="w-16 h-16 text-green-500" />
              <Mail className="w-12 h-12 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Check Your Email!</h3>
            <p className="text-muted-foreground mb-2">
              We've sent the download link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-muted-foreground">
              Please check your inbox (and spam folder) for the download link.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Resources List */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Select a Resource</Label>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : resources && resources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resources.map((resource) => (
                    <Card
                      key={resource.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedResource === resource.id
                          ? "border-primary border-2 bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedResource(resource.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-secondary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-sm mb-1 line-clamp-2">{resource.title}</h4>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {resource.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded">
                                {getCategoryLabel(resource.category)}
                              </span>
                              {resource.fileType && (
                                <span className="text-muted-foreground">{resource.fileType.toUpperCase()}</span>
                              )}
                              {resource.fileSizeKb && (
                                <span className="text-muted-foreground">
                                  {(resource.fileSizeKb / 1024).toFixed(1)} MB
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No resources available at the moment.</p>
                  <p className="text-sm mt-1">Please check back later or contact us directly.</p>
                </div>
              )}
            </div>

            {/* Contact Form */}
            {resources && resources.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  By downloading, you agree to receive occasional updates about property opportunities. Unsubscribe anytime.
                </p>
                <Button
                  onClick={handleDownload}
                  disabled={!selectedResource || !fullName || !email || isSubmitting}
                  className="w-full bg-secondary hover:bg-secondary/90"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-5 w-5" />
                      Download Selected Resource
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
