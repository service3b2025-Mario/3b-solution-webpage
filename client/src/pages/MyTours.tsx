import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Calendar, Clock, Video, MapPin, Building2, X, ExternalLink, Edit, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { SEO } from "@/components/SEO";

export default function MyTours() {
  const { user } = useAuth();
  const { data: bookings, isLoading, refetch } = trpc.bookings.myBookings.useQuery(undefined, {
    enabled: !!user,
  });
  
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [rescheduleBookingId, setRescheduleBookingId] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const rescheduleBooking = trpc.bookings.reschedule.useMutation({
    onSuccess: () => {
      toast.success("Tour rescheduled successfully");
      refetch();
      setRescheduleDialogOpen(false);
      setRescheduleBookingId(null);
      setRescheduleDate("");
      setRescheduleTime("");
    },
    onError: (error: any) => {
      toast.error(`Failed to reschedule: ${error.message}`);
    }
  });
  
  const cancelBooking = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      toast.success("Tour cancelled successfully");
      refetch();
    },
    onError: () => {
      toast.error("Failed to cancel tour");
    },
  });

  const handleCancel = (id: number) => {
    if (confirm("Are you sure you want to cancel this tour?")) {
      cancelBooking.mutate(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMeetingIcon = (type: string) => {
    return <Video className="w-4 h-4" />;
  };

  if (!user) {
    return (
      <Layout>
        <SEO 
          title="My Tours | 3B Solution"
          description="View and manage your scheduled property tours"
        />
        <div className="container py-20">
          <div className="max-w-2xl mx-auto text-center">
            <Calendar className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-4">Sign In to View Your Tours</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Access your scheduled virtual property tours and manage your appointments.
            </p>
            <a href={getLoginUrl()}>
              <Button size="lg">
                Sign In
              </Button>
            </a>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="My Tours | 3B Solution"
        description="View and manage your scheduled property tours"
      />
      
      {/* Header */}
      <section className="bg-muted/30 py-12">
        <div className="container">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2">My Virtual Tours</h1>
              <p className="text-lg text-muted-foreground">
                {bookings?.length || 0} scheduled {bookings?.length === 1 ? 'tour' : 'tours'}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-primary" />
          </div>
        </div>
      </section>

      {/* Tours Content */}
      <section className="py-12">
        <div className="container">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <Card key={i}>
                  <div className="animate-pulse p-6">
                    <div className="h-6 bg-muted rounded mb-4"></div>
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((item: any) => {
                const booking = item.bookings;
                const property = item.properties;
                const scheduledDate = new Date(booking.scheduledAt);
                const isPast = scheduledDate < new Date();
                const canCancel = !isPast && booking.status !== 'cancelled' && booking.status !== 'completed';

                return (
                  <Card key={booking.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              {getMeetingIcon(booking.type)}
                              {booking.type}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl mb-2">
                            {property?.title || 'Property Tour'}
                          </CardTitle>
                          {property && (
                            <div className="flex items-center text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4 mr-1" />
                              <span>{property.city}, {property.country}</span>
                            </div>
                          )}
                        </div>
                        {canCancel && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCancel(booking.id)}
                            className="text-muted-foreground hover:text-red-600"
                          >
                            <X className="w-5 h-5" />
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      {/* Tour Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Date</p>
                            <p className="text-sm font-medium">
                              {scheduledDate.toLocaleDateString('en-US', { 
                                weekday: 'short', 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Time</p>
                            <p className="text-sm font-medium">
                              {scheduledDate.toLocaleTimeString('en-US', { 
                                hour: 'numeric', 
                                minute: '2-digit',
                                hour12: true
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="text-xs text-muted-foreground">Duration</p>
                            <p className="text-sm font-medium">{booking.duration || 30} minutes</p>
                          </div>
                        </div>
                      </div>

                      {/* Meeting Link */}
                      {booking.meetingUrl && booking.status !== 'cancelled' && (
                        <div className="bg-primary/5 rounded-lg p-4">
                          <p className="text-sm text-muted-foreground mb-2">Meeting Link:</p>
                          <a 
                            href={booking.meetingUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline flex items-center gap-1"
                          >
                            {booking.meetingUrl}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}

                      {/* Notes */}
                      {booking.notes && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        {property && (
                          <Link href={`/properties/${property.slug}`}>
                            <Button variant="outline" size="sm">
                              <Building2 className="w-4 h-4 mr-2" />
                              View Property
                            </Button>
                          </Link>
                        )}
                        {canCancel && (
                          <Dialog open={rescheduleDialogOpen && rescheduleBookingId === booking.id} onOpenChange={(open) => {
                            setRescheduleDialogOpen(open);
                            if (!open) setRescheduleBookingId(null);
                          }}>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setRescheduleBookingId(booking.id);
                                  setRescheduleDialogOpen(true);
                                }}
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Reschedule
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Reschedule Tour</DialogTitle>
                                <DialogDescription>
                                  Choose a new date and time for your virtual property tour
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="reschedule-date">New Date</Label>
                                  <Input
                                    id="reschedule-date"
                                    type="date"
                                    value={rescheduleDate}
                                    onChange={(e) => setRescheduleDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="reschedule-time">New Time</Label>
                                  <Input
                                    id="reschedule-time"
                                    type="time"
                                    value={rescheduleTime}
                                    onChange={(e) => setRescheduleTime(e.target.value)}
                                  />
                                </div>
                                <Button
                                  className="w-full"
                                  onClick={() => {
                                    if (!rescheduleDate || !rescheduleTime) {
                                      toast.error("Please select both date and time");
                                      return;
                                    }
                                    rescheduleBooking.mutate({
                                      bookingId: booking.id,
                                      newDate: new Date(rescheduleDate),
                                      newTime: rescheduleTime
                                    });
                                  }}
                                  disabled={rescheduleBooking.isPending}
                                >
                                  {rescheduleBooking.isPending ? (
                                    <>
                                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      Rescheduling...
                                    </>
                                  ) : (
                                    "Confirm Reschedule"
                                  )}
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        {booking.meetingUrl && !isPast && booking.status !== 'cancelled' && (
                          <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer">
                            <Button size="sm">
                              <Video className="w-4 h-4 mr-2" />
                              Join Meeting
                            </Button>
                          </a>
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar className="w-20 h-20 mx-auto mb-6 text-muted-foreground" />
              <h2 className="text-2xl font-bold text-foreground mb-4">No Tours Scheduled</h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
                Browse our premium properties and schedule a virtual tour to explore property opportunities.
              </p>
              <Link href="/properties">
                <Button size="lg">
                  Browse Properties
                </Button>
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
