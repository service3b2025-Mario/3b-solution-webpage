import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface TourFeedbackFormProps {
  bookingId: number;
  propertyId: number;
  propertyTitle: string;
  onSubmitSuccess?: () => void;
}

export function TourFeedbackForm({ bookingId, propertyId, propertyTitle, onSubmitSuccess }: TourFeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [tourQuality, setTourQuality] = useState(0);
  const [hoverTourQuality, setHoverTourQuality] = useState(0);
  const [propertyInterest, setPropertyInterest] = useState<"very_interested" | "interested" | "neutral" | "not_interested" | "">("");
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [nextSteps, setNextSteps] = useState<"schedule_visit" | "request_info" | "make_offer" | "not_ready" | "other" | "">("");
  const [comments, setComments] = useState("");

  const submitFeedback = trpc.feedback.submit.useMutation({
    onSuccess: () => {
      toast.success("Thank you for your feedback!");
      if (onSubmitSuccess) onSubmitSuccess();
    },
    onError: (error: any) => {
      toast.error(`Failed to submit feedback: ${error.message}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Please provide an overall rating");
      return;
    }

    await submitFeedback.mutateAsync({
      bookingId,
      propertyId,
      rating,
      tourQuality: tourQuality || undefined,
      propertyInterest: propertyInterest || undefined,
      wouldRecommend: wouldRecommend ?? undefined,
      comments: comments || undefined,
      nextSteps: nextSteps || undefined,
    });
  };

  const StarRating = ({ 
    value, 
    onChange, 
    hoverValue, 
    onHover 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    hoverValue: number; 
    onHover: (val: number) => void;
  }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => onHover(star)}
          onMouseLeave={() => onHover(0)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 ${
              star <= (hoverValue || value)
                ? "fill-yellow-400 text-yellow-400"
                : "fill-none text-gray-300"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>How was your virtual tour?</CardTitle>
        <CardDescription>
          Share your feedback about the virtual tour for <strong>{propertyTitle}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Overall Experience *</Label>
            <StarRating
              value={rating}
              onChange={setRating}
              hoverValue={hoverRating}
              onHover={setHoverRating}
            />
            <p className="text-sm text-muted-foreground">
              {rating === 0 && "Click to rate"}
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </p>
          </div>

          {/* Tour Quality */}
          <div className="space-y-2">
            <Label className="text-base font-medium">Tour Quality</Label>
            <StarRating
              value={tourQuality}
              onChange={setTourQuality}
              hoverValue={hoverTourQuality}
              onHover={setHoverTourQuality}
            />
            <p className="text-sm text-muted-foreground">
              Rate the quality of the virtual tour presentation
            </p>
          </div>

          {/* Property Interest */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Interest in Property</Label>
            <RadioGroup value={propertyInterest} onValueChange={(val) => setPropertyInterest(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="very_interested" id="very_interested" />
                <Label htmlFor="very_interested" className="font-normal cursor-pointer">
                  Very Interested - Ready to move forward
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="interested" id="interested" />
                <Label htmlFor="interested" className="font-normal cursor-pointer">
                  Interested - Want to learn more
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="neutral" id="neutral" />
                <Label htmlFor="neutral" className="font-normal cursor-pointer">
                  Neutral - Still considering
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_interested" id="not_interested" />
                <Label htmlFor="not_interested" className="font-normal cursor-pointer">
                  Not Interested - Not a fit
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Would Recommend */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Would you recommend this property to others?</Label>
            <div className="flex gap-4">
              <Button
                type="button"
                variant={wouldRecommend === true ? "default" : "outline"}
                onClick={() => setWouldRecommend(true)}
                className="flex-1"
              >
                <ThumbsUp className="w-4 h-4 mr-2" />
                Yes
              </Button>
              <Button
                type="button"
                variant={wouldRecommend === false ? "default" : "outline"}
                onClick={() => setWouldRecommend(false)}
                className="flex-1"
              >
                <ThumbsDown className="w-4 h-4 mr-2" />
                No
              </Button>
            </div>
          </div>

          {/* Next Steps */}
          <div className="space-y-3">
            <Label className="text-base font-medium">What would you like to do next?</Label>
            <RadioGroup value={nextSteps} onValueChange={(val) => setNextSteps(val as any)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="schedule_visit" id="schedule_visit" />
                <Label htmlFor="schedule_visit" className="font-normal cursor-pointer">
                  Schedule an in-person visit
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="request_info" id="request_info" />
                <Label htmlFor="request_info" className="font-normal cursor-pointer">
                  Request more information
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="make_offer" id="make_offer" />
                <Label htmlFor="make_offer" className="font-normal cursor-pointer">
                  Ready to make an offer
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="not_ready" id="not_ready" />
                <Label htmlFor="not_ready" className="font-normal cursor-pointer">
                  Not ready to proceed
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  Other
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-base font-medium">
              Additional Comments
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share any additional thoughts, questions, or feedback..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="submit"
              disabled={submitFeedback.isPending || rating === 0}
              className="min-w-32"
            >
              {submitFeedback.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Feedback"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
