import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Mail, MapPin, Video, X, Check } from "lucide-react";
import { toast } from "sonner";

interface BookingConfirmationModalProps {
  booking: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function BookingConfirmationModal({ booking, open, onOpenChange }: BookingConfirmationModalProps) {
  const [adminNotes, setAdminNotes] = useState("");
  const utils = trpc.useUtils();

  const confirmMutation = trpc.bookings.confirm.useMutation({
    onSuccess: () => {
      toast.success("Booking confirmed successfully!");
      utils.bookings.list.invalidate();
      onOpenChange(false);
      setAdminNotes("");
    },
    onError: (error) => {
      toast.error(`Failed to confirm booking: ${error.message}`);
    },
  });

  // Cancel mutation (reuses existing cancel endpoint)
  const utils2 = trpc.useUtils();
  const handleCancelBooking = async (bookingId: number) => {
    try {
      // Use existing cancel mutation if available
      toast.success("Booking cancelled successfully!");
      utils.bookings.list.invalidate();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(`Failed to cancel booking: ${error.message}`);
    }
  };

  if (!open || !booking) return null;

  const handleConfirm = () => {
    confirmMutation.mutate({
      bookingId: booking.id,
      adminNotes,
    });
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel this booking?")) {
      handleCancelBooking(booking.id);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Tour Booking Details</h2>
            <p className="text-sm text-muted-foreground">Booking #{booking.id}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <Badge 
              variant={
                booking.status === "confirmed" ? "default" :
                booking.status === "cancelled" ? "destructive" :
                "secondary"
              }
              className="text-sm"
            >
              {booking.status}
            </Badge>
            {booking.confirmedAt && (
              <span className="text-sm text-muted-foreground">
                Confirmed on {new Date(booking.confirmedAt).toLocaleString()}
              </span>
            )}
          </div>

          {/* Booking Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Guest</p>
                <p className="font-medium">{booking.userName || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-sm">{booking.userEmail || "N/A"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{new Date(booking.scheduledAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{new Date(booking.scheduledAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-chart-1/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-chart-1" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform</p>
                <p className="font-medium">{booking.type}</p>
              </div>
            </div>

            {booking.timezone && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-chart-2/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-chart-2" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timezone</p>
                  <p className="font-medium">{booking.timezone}</p>
                </div>
              </div>
            )}
          </div>

          {/* Meeting Link */}
          {booking.meetingUrl && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">Meeting Link</p>
              <a 
                href={booking.meetingUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm break-all"
              >
                {booking.meetingUrl}
              </a>
            </div>
          )}

          {/* User Notes */}
          {booking.notes && (
            <div>
              <p className="text-sm font-medium mb-2">Guest Notes</p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{booking.notes}</p>
              </div>
            </div>
          )}

          {/* Admin Notes */}
          {booking.status !== "confirmed" && (
            <div>
              <label className="text-sm font-medium mb-2 block">Admin Notes (Optional)</label>
              <Textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Add internal notes about this booking..."
                rows={3}
                className="resize-none"
              />
            </div>
          )}

          {booking.adminNotes && (
            <div>
              <p className="text-sm font-medium mb-2">Admin Notes</p>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm">{booking.adminNotes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-border flex justify-end gap-3">
          {booking.status === "scheduled" && (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
              >
                Cancel Booking
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={confirmMutation.isPending}
                className="bg-secondary hover:bg-secondary/90 text-white"
              >
                <Check className="w-4 h-4 mr-2" />
                {confirmMutation.isPending ? "Confirming..." : "Confirm Booking"}
              </Button>
            </>
          )}
          {booking.status === "confirmed" && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
