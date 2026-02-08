import { useState } from 'react';
import { Phone, MessageCircle, X, Clock, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';

interface ContactRegion {
  name: string;
  country: string;
  phone: string;
  whatsapp: string;
  hours: string;
  timezone: string;
}

const regions: ContactRegion[] = [
  {
    name: 'Philippines Office',
    country: 'PH',
    phone: '+639756896320',
    whatsapp: '+639756896320',
    hours: '8:00 AM - 8:00 PM',
    timezone: 'Monday - Saturday (GMT+8)',
  },
  {
    name: 'Germany Office',
    country: 'DE',
    phone: '+4917656787896',
    whatsapp: '+4917656787896',
    hours: '8:00 AM - 8:00 PM',
    timezone: 'Monday - Saturday (CET)',
  },
];

export function MobileContactMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const handleCall = (phone: string, region: string) => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('mobile-call-click', { region });
    }
    window.location.href = `tel:${phone}`;
  };

  const handleWhatsApp = (phone: string, region: string) => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).umami) {
      (window as any).umami.track('mobile-whatsapp-click', { region });
    }
    const message = encodeURIComponent(
      "Hi, I'm interested in learning more about your luxury real estate opportunities."
    );
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
  };

  return (
    <>
      {/* Mobile Contact Button - Only visible on mobile */}
      <div className="md:hidden fixed bottom-24 right-6 z-40 flex flex-col gap-3">
        {/* FIXED: Added aria-label for accessibility */}
        <Button
          onClick={() => setIsOpen(true)}
          size="lg"
          className="rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-14 w-14 p-0"
          aria-label="Open contact menu"
        >
          <Phone className="h-6 w-6" aria-hidden="true" />
        </Button>
      </div>

      {/* Contact Menu Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">Contact Us</DialogTitle>
            <DialogDescription>
              Choose your preferred office location to connect with our team
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {regions.map((region) => (
              <div
                key={region.country}
                className="border rounded-lg p-4 space-y-3 hover:border-blue-500 transition-colors"
              >
                {/* Region Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-blue-600" aria-hidden="true" />
                      {region.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" aria-hidden="true" />
                      {region.hours}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {region.timezone}
                    </p>
                  </div>
                </div>

                {/* Phone Number Display */}
                <div className="text-sm font-medium text-muted-foreground">
                  {region.phone}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCall(region.phone, region.country)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    size="lg"
                    aria-label={`Call ${region.name} at ${region.phone}`}
                  >
                    <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                    Call Now
                  </Button>
                  <Button
                    onClick={() => handleWhatsApp(region.whatsapp, region.country)}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                    aria-label={`Message ${region.name} on WhatsApp`}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                    WhatsApp
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-sm text-center">
            <p className="text-muted-foreground">
              Our team typically responds within 15 minutes during business hours
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
