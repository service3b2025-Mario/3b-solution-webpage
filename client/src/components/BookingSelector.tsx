import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Video, Phone, Mail, Check, Loader2, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const BOOKINGS_URL = "https://outlook.office.com/book/G2f476a92d5be41e2910830ca4547acfb@3bsolution.de/?ismsaljsauthenabled";

const consultationOptions = [
  {
    id: "video",
    title: "Book a Video Call",
    subtitle: "Microsoft Teams meeting",
    icon: Video,
    type: "booking",
  },
  {
    id: "phone",
    title: "Book a Phone Call",
    subtitle: "Direct phone consultation",
    icon: Phone,
    type: "booking",
  },
  {
    id: "info",
    title: "Request Information",
    subtitle: "No call needed",
    icon: Mail,
    type: "lead",
  },
];

const investorTypes = [
  { value: "PrivateInvestor", label: "Individual Investor" },
  { value: "FamilyOffice", label: "Family Office" },
  { value: "Institutional", label: "Institutional Investor" },
  { value: "Developer", label: "Developer" },
  { value: "Partner", label: "Partner" },
  { value: "Other", label: "Other" },
];

const investmentRanges = [
  { value: "100k-1m", label: "$100K - $1M" },
  { value: "1m-10m", label: "$1M - $10M" },
  { value: "10m-50m", label: "$10M - $50M" },
  { value: "50m-100m", label: "$50M - $100M" },
  { value: "100m+", label: "$100M+" },
];

interface BookingSelectorProps {
  className?: string;
  layout?: "horizontal" | "vertical";
}

export function BookingSelector({ className, layout = "horizontal" }: BookingSelectorProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [optionalDetailsOpen, setOptionalDetailsOpen] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    investorType: "",
    investmentRange: "",
    message: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createLead = trpc.leads.create.useMutation();


  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
    setErrors({});
  };

  const handleContinueToBooking = () => {
    // Always open Microsoft Bookings in a new tab
    // Microsoft blocks iframe embedding via X-Frame-Options headers
    window.open(BOOKINGS_URL, "_blank", "noopener,noreferrer");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.message.trim()) {
      newErrors.message = "Message is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);

    try {
      await createLead.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone || undefined,
        company: formData.company || undefined,
        ...(formData.investorType && { investorType: formData.investorType as any }),
        investmentRange: formData.investmentRange || undefined,
        message: formData.message,
        source: "contact_form_info_request",
      });

      setShowSuccessModal(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        investorType: "",
        investmentRange: "",
        message: "",
      });
      setSelectedOption(null);
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(error?.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedOptionData = consultationOptions.find((o) => o.id === selectedOption);

  return (
    <div className={className}>
      {/* 3-Option Selector */}
      <div className={layout === "vertical" ? "flex flex-col gap-3 mb-6" : "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"}>
        {consultationOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.id;

          return (
            <Card
              key={option.id}
              onClick={() => handleOptionSelect(option.id)}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? "border-2 border-secondary bg-secondary/5 shadow-md"
                  : "border border-border hover:border-secondary/50"
              }`}
            >
              {layout === "vertical" ? (
                /* Vertical Layout - Icon on left, text beside */
                <CardContent className="p-3 md:p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "bg-secondary text-white" : "bg-muted"
                      }`}
                    >
                      <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm md:text-base leading-tight">{option.title}</h3>
                      <p className="text-xs text-muted-foreground">{option.subtitle}</p>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-secondary flex-shrink-0" />
                    )}
                  </div>
                </CardContent>
              ) : (
                /* Horizontal Layout - Icon centered, text below */
                <CardContent className="p-6 text-center">
                  <div
                    className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      isSelected ? "bg-secondary text-white" : "bg-muted"
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground">{option.subtitle}</p>
                  {isSelected && (
                    <div className="mt-3">
                      <Check className="w-5 h-5 text-secondary mx-auto" />
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action Area */}
      {selectedOption && selectedOptionData && (
        <div className="mt-6">
          {selectedOptionData.type === "booking" ? (
            /* Booking Flow (Video/Phone) */
            <div className="bg-muted/50 rounded-lg p-6 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                You will be redirected to our secure Microsoft Bookings page to choose a time slot.
              </p>
              <Button
                onClick={handleContinueToBooking}
                size="lg"
                className="bg-secondary hover:bg-secondary/90 text-white px-8"
              >
                Open Booking Page ↗
              </Button>
            </div>
          ) : (
            /* Lead Form (Request Information) */
            <form onSubmit={handleLeadSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.firstName}
                    onChange={(e) => {
                      setFormData({ ...formData, firstName: e.target.value });
                      if (errors.firstName) setErrors({ ...errors, firstName: "" });
                    }}
                    placeholder="John"
                    className={errors.firstName ? "border-red-500" : ""}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={formData.lastName}
                    onChange={(e) => {
                      setFormData({ ...formData, lastName: e.target.value });
                      if (errors.lastName) setErrors({ ...errors, lastName: "" });
                    }}
                    placeholder="Doe"
                    className={errors.lastName ? "border-red-500" : ""}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) setErrors({ ...errors, email: "" });
                    }}
                    placeholder="john@example.com"
                    className={errors.email ? "border-red-500" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company / Organization</label>
                <Input
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Your company name"
                />
              </div>

              {/* Optional Details - Collapsible */}
              <Collapsible open={optionalDetailsOpen} onOpenChange={setOptionalDetailsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full justify-between p-0 h-auto hover:bg-transparent">
                    <span className="text-sm text-muted-foreground">Optional details</span>
                    <ChevronDown
                      className={`w-4 h-4 text-muted-foreground transition-transform ${
                        optionalDetailsOpen ? "rotate-180" : ""
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Investor Type</label>
                      <Select
                        value={formData.investorType}
                        onValueChange={(v) => setFormData({ ...formData, investorType: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          {investorTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Budget Range</label>
                      <Select
                        value={formData.investmentRange}
                        onValueChange={(v) => setFormData({ ...formData, investmentRange: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select range" />
                        </SelectTrigger>
                        <SelectContent>
                          {investmentRanges.map((range) => (
                            <SelectItem key={range.value} value={range.value}>
                              {range.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Message <span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={formData.message}
                  onChange={(e) => {
                    setFormData({ ...formData, message: e.target.value });
                    if (errors.message) setErrors({ ...errors, message: "" });
                  }}
                  placeholder="Tell us about your property interests..."
                  rows={4}
                  className={errors.message ? "border-red-500" : ""}
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-secondary hover:bg-secondary/90 text-white h-12"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          )}
        </div>
      )}

      {/* Booking now opens in new tab - Microsoft blocks iframe embedding */}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl">Thank You!</DialogTitle>
          </DialogHeader>
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We will contact you within 24 hours.
            </p>
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="bg-secondary hover:bg-secondary/90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
