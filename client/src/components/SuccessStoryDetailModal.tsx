import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, MapPin, Calendar, TrendingUp, Building2, Quote } from "lucide-react";

interface SuccessStoryDetailModalProps {
  story: any;
  open: boolean;
  onClose: () => void;
}

export function SuccessStoryDetailModal({ story, open, onClose }: SuccessStoryDetailModalProps) {
  if (!story) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto relative">
         {/* Custom Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        <DialogHeader>
          <DialogTitle className="sr-only">{story.title}</DialogTitle>
          
        </DialogHeader>

        {/* Story Image */}
        <div className="w-full h-64 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg overflow-hidden flex items-center justify-center">
          {story.image ? (
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-24 h-24 text-primary/30" />
          )}
        </div>

        {/* Story Header */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
              {story.clientType}
            </span>
            {story.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {story.location}
              </span>
            )}
            {story.timeline && (
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {story.timeline}
              </span>
            )}
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground">
            {story.title}
          </h2>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
              <Quote className="w-6 h-6 text-secondary" />
            </div>
            <div>
              <p className="font-semibold">{story.clientName}</p>
              <p className="text-sm text-muted-foreground">{story.clientType}</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        {story.investmentAmount && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 my-6">
            {story.investmentAmount && story.investmentAmount !== 'N/A' && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-secondary">{story.investmentAmount}</div>
                <div className="text-xs text-muted-foreground">Investment Amount</div>
              </div>
            )}
            {story.timeline && (
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-secondary">{story.timeline}</div>
                <div className="text-xs text-muted-foreground">Timeline</div>
              </div>
            )}
          </div>
        )}

        {/* Story Content */}
        <div className="space-y-6 text-foreground">
          {/* Challenge */}
          {story.challenge && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                The Challenge
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-10">
                {story.challenge}
              </p>
            </div>
          )}

          {/* Solution */}
          {story.solution && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                Our Solution
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-10">
                {story.solution}
              </p>
            </div>
          )}

          {/* Results */}
          {story.results && (
            <div>
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-secondary" />
                </div>
                The Results
              </h3>
              <p className="text-muted-foreground leading-relaxed pl-10">
                {story.results}
              </p>
            </div>
          )}

          {/* Summary (if no detailed sections) */}
          {!story.challenge && !story.solution && !story.results && story.shortDescription && (
            <div>
              <p className="text-muted-foreground leading-relaxed">
                {story.shortDescription}
              </p>
            </div>
          )}
        </div>

        {/* Testimonial Quote (if available) */}
        {story.testimonial && (
          <div className="bg-muted/30 border-l-4 border-secondary p-6 rounded-r-lg my-6">
            <Quote className="w-8 h-8 text-secondary mb-3" />
            <p className="text-lg italic text-foreground mb-3">"{story.testimonial}"</p>
            <p className="text-sm font-semibold">{story.clientName}</p>
            <p className="text-xs text-muted-foreground">{story.clientType}</p>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-4 border-t">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
