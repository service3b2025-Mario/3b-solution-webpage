import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Calendar as CalendarIcon, Clock, Video, CheckCircle2, Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

interface TourSchedulerProps {
  propertyId: number;
  propertyTitle: string;
}

export function TourScheduler({ propertyId, propertyTitle }: TourSchedulerProps) {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [meetingType, setMeetingType] = useState<string>('GoogleMeet');
  
  const createBooking = trpc.bookings.create.useMutation({
    onSuccess: () => {
      setStep('success');
      toast.success("Tour booked successfully! Check your email for confirmation.");
    },
    onError: () => {
      toast.error("Failed to book tour. Please try again.");
    },
  });

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset time when date changes
  };

  const handleConfirm = () => {
    if (!user) {
      window.location.href = getLoginUrl();
      return;
    }

    if (!selectedDate || !selectedTime) {
      toast.error("Please select both date and time");
      return;
    }

    // Combine date and time
    const [hours, minutes] = selectedTime.split(':');
    const scheduledAt = new Date(selectedDate);
    scheduledAt.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    createBooking.mutate({
      userId: user.id,
      propertyId,
      type: meetingType as any,
      scheduledAt,
      duration: 30,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      userEmail: user.email || '',
      userName: user.name || '',
      notes: `Virtual tour for ${propertyTitle}`,
      status: 'scheduled',
    });
  };

  const handleReset = () => {
    setStep('select');
    setSelectedDate(undefined);
    setSelectedTime('');
    setMeetingType('GoogleMeet');
  };

  // Generate available time slots (9 AM - 5 PM, 30-minute intervals)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour < 17; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Disable past dates and weekends
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const day = date.getDay();
    return date < today || day === 0 || day === 6; // Disable past dates and weekends
  };

  if (!user) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Schedule Virtual Tour
          </CardTitle>
          <CardDescription>
            Sign in to book a personalized virtual tour with our investment team.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <a href={getLoginUrl()}>
            <Button className="w-full">
              Sign In to Schedule Tour
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  if (step === 'success') {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Tour Booked!</h3>
            <p className="text-green-700 mb-2">
              Your virtual tour has been scheduled successfully.
            </p>
            <p className="text-sm text-green-600 mb-4">
              {selectedDate?.toLocaleDateString()} at {selectedTime}
            </p>
            <p className="text-sm text-green-700 mb-4">
              You'll receive a confirmation email with the meeting link shortly.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={handleReset}
                className="flex-1 border-green-600 text-green-600 hover:bg-green-100"
              >
                Book Another Tour
              </Button>
              <Button 
                onClick={() => window.location.href = '/my-tours'}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                View My Tours
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5" />
          Schedule Virtual Tour
        </CardTitle>
        <CardDescription>
          Book a personalized virtual tour with our investment team
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Meeting Type */}
        <div className="space-y-2">
          <Label htmlFor="meetingType">Meeting Platform</Label>
          <Select value={meetingType} onValueChange={setMeetingType}>
            <SelectTrigger id="meetingType">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GoogleMeet">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Google Meet
                </div>
              </SelectItem>
              <SelectItem value="Zoom">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Zoom
                </div>
              </SelectItem>
              <SelectItem value="Teams">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4" />
                  Microsoft Teams
                </div>
              </SelectItem>
              <SelectItem value="Phone">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Phone Call
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label>Select Date</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="rounded-md border"
          />
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div className="space-y-2">
            <Label htmlFor="time">Select Time</Label>
            <Select value={selectedTime} onValueChange={setSelectedTime}>
              <SelectTrigger id="time">
                <SelectValue placeholder="Choose a time slot" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              All times are in your local timezone ({Intl.DateTimeFormat().resolvedOptions().timeZone})
            </p>
          </div>
        )}

        {/* Booking Summary */}
        {selectedDate && selectedTime && (
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <h4 className="font-semibold text-sm">Booking Summary</h4>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Property:</span> {propertyTitle}</p>
              <p><span className="text-muted-foreground">Date:</span> {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><span className="text-muted-foreground">Time:</span> {selectedTime}</p>
              <p><span className="text-muted-foreground">Platform:</span> {meetingType}</p>
              <p><span className="text-muted-foreground">Duration:</span> 30 minutes</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <Button 
          onClick={handleConfirm}
          disabled={!selectedDate || !selectedTime || createBooking.isPending}
          className="w-full"
        >
          {createBooking.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Confirm Booking
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          You'll receive a confirmation email with the meeting link and calendar invite.
        </p>
      </CardContent>
    </Card>
  );
}
