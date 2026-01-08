import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Mail, Phone, Building2, Calendar, MessageSquare, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "sonner";

interface LeadDetailModalProps {
  lead: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDetailModal({ lead, open, onOpenChange }: LeadDetailModalProps) {
  const [response, setResponse] = useState("");
  const [newStatus, setNewStatus] = useState(lead?.status || "new");
  const utils = trpc.useUtils();

  const updateLead = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      utils.analytics.summary.invalidate();
      toast.success("Lead updated successfully");
    },
  });

  const respondToLead = trpc.leads.respond.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate();
      setResponse("");
      toast.success("Response sent successfully");
    },
  });

  if (!lead) return null;

  const handleStatusUpdate = async (status: string) => {
    await updateLead.mutateAsync({
      id: lead.id,
      data: { status },
    });
    setNewStatus(status);
  };

  const handleSendResponse = async () => {
    if (!response.trim()) {
      toast.error("Please enter a response");
      return;
    }

    await respondToLead.mutateAsync({
      leadId: lead.id,
      response: response,
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      new: "bg-blue-500",
      contacted: "bg-yellow-500",
      qualified: "bg-purple-500",
      converted: "bg-green-500",
      lost: "bg-gray-500",
    };
    return colors[status] || "bg-gray-500";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">
                {lead.firstName} {lead.lastName}
              </p>
              <p className="text-sm text-muted-foreground font-normal">
                Lead #{lead.id} • {new Date(lead.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Badge className={getStatusColor(newStatus)}>
              {newStatus}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
              <Mail className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{lead.email}</p>
              </div>
            </div>
            {lead.phone && (
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Phone className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{lead.phone}</p>
                </div>
              </div>
            )}
            {lead.company && (
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Company</p>
                  <p className="font-medium">{lead.company}</p>
                </div>
              </div>
            )}
            {lead.investorType && (
              <div className="flex items-start gap-3 p-4 bg-muted/30 rounded-lg">
                <Building2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Investor Type</p>
                  <p className="font-medium">{lead.investorType}</p>
                </div>
              </div>
            )}
          </div>

          {/* Investment Details */}
          {(lead.investmentRange || lead.interestedRegions || lead.interestedPropertyTypes) && (
            <div className="p-4 bg-muted/30 rounded-lg space-y-3">
              <p className="font-semibold">Investment Profile</p>
              {lead.investmentRange && (
                <div>
                  <p className="text-sm text-muted-foreground">Investment Range</p>
                  <p className="font-medium">{lead.investmentRange}</p>
                </div>
              )}
              {lead.interestedRegions && lead.interestedRegions.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Interested Regions</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {lead.interestedRegions.map((region: string, i: number) => (
                      <Badge key={i} variant="outline">{region}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {lead.interestedPropertyTypes && lead.interestedPropertyTypes.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Types</p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {lead.interestedPropertyTypes.map((type: string, i: number) => (
                      <Badge key={i} variant="outline">{type}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Message */}
          {lead.message && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <p className="font-semibold mb-2">Message</p>
              <p className="text-sm whitespace-pre-wrap">{lead.message}</p>
            </div>
          )}

          {/* Previous Response */}
          {lead.adminResponse && (
            <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <p className="font-semibold text-green-900 dark:text-green-100">Previous Response</p>
                {lead.respondedAt && (
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {new Date(lead.respondedAt).toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-sm text-green-900 dark:text-green-100 whitespace-pre-wrap">
                {lead.adminResponse}
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-4">
            <div>
              <Label>Update Status</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                <Button
                  size="sm"
                  variant={newStatus === "contacted" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("contacted")}
                  disabled={updateLead.isPending}
                >
                  <Clock className="w-4 h-4 mr-2" />
                  Mark Contacted
                </Button>
                <Button
                  size="sm"
                  variant={newStatus === "qualified" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("qualified")}
                  disabled={updateLead.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Qualified
                </Button>
                <Button
                  size="sm"
                  variant={newStatus === "converted" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("converted")}
                  disabled={updateLead.isPending}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Mark Converted
                </Button>
                <Button
                  size="sm"
                  variant={newStatus === "lost" ? "destructive" : "outline"}
                  onClick={() => handleStatusUpdate("lost")}
                  disabled={updateLead.isPending}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Mark Lost
                </Button>
              </div>
            </div>

            {/* Response Form */}
            <div>
              <Label htmlFor="response">Send Response</Label>
              <Textarea
                id="response"
                placeholder="Type your response to this lead..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={6}
                className="mt-2"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  onClick={handleSendResponse}
                  disabled={respondToLead.isPending || !response.trim()}
                  className="flex-1"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  {respondToLead.isPending ? "Sending..." : "Send Response"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setResponse("")}
                  disabled={!response}
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>

          {/* Source Information */}
          <div className="p-4 bg-muted/10 rounded-lg text-sm text-muted-foreground">
            <p>Source: {lead.source || "Unknown"}</p>
            {lead.sourcePage && <p>Page: {lead.sourcePage}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
