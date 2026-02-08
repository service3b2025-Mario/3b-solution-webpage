import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, CheckCircle, Loader2 } from "lucide-react";

interface PropertyInquiryFormProps {
  propertyId: number;
  propertyTitle: string;
}

export function PropertyInquiryForm({ propertyId, propertyTitle }: PropertyInquiryFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    investorType: "",
    investmentRange: "",
    customInvestmentAmount: "",
    message: "",
  });

  const submitInquiry = trpc.leads.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Inquiry submitted successfully! We'll contact you soon.");
    },
    onError: (error) => {
      const errorMessage = error?.message || "Failed to submit inquiry. Please try again or contact us directly.";
      toast.error(errorMessage);
    },
  });

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (formData.investmentRange === "individual" && !formData.customInvestmentAmount) {
      newErrors.customInvestmentAmount = "Please enter an investment amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Combine investment range with custom amount if "individual" is selected
    const finalInvestmentRange = formData.investmentRange === "individual" && formData.customInvestmentAmount
      ? `$${parseFloat(formData.customInvestmentAmount).toLocaleString('en-US')} USD`
      : formData.investmentRange;

    submitInquiry.mutate({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      investorType: formData.investorType as any,
      investmentRange: finalInvestmentRange,
      message: formData.message || `Inquiry about ${propertyTitle}`,
      source: "Property Detail Page",
      propertyId,
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  if (submitted) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6">
          <div className="text-center">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-green-900 mb-2">Thank You!</h3>
            <p className="text-green-700 mb-4">
              Your inquiry has been submitted successfully. Our real estate team will contact you within 24 hours.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setSubmitted(false)}
              className="border-green-600 text-green-600 hover:bg-green-100"
            >
              Submit Another Inquiry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5" />
          Request Information
        </CardTitle>
        <CardDescription>
          Interested in this property? Fill out the form below and our team will get in touch with you.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                placeholder="John"
                required
                className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="john@example.com"
                required
                className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
              )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="investorType">Investor Type</Label>
            <Select value={formData.investorType} onValueChange={(value) => handleChange("investorType", value)}>
              <SelectTrigger id="investorType">
                <SelectValue placeholder="Select investor type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FamilyOffice">Family Office</SelectItem>
                <SelectItem value="PrivateInvestor">Private Investor</SelectItem>
                <SelectItem value="Institutional">Institutional Investor</SelectItem>
                <SelectItem value="Developer">Developer</SelectItem>
                <SelectItem value="Partner">Partner</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="investmentRange">Property Budget Range</Label>
            <Select value={formData.investmentRange} onValueChange={(value) => handleChange("investmentRange", value)}>
              <SelectTrigger id="investmentRange">
                <SelectValue placeholder="Select property budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100k-1m">$100K - $1M</SelectItem>
                <SelectItem value="1m-10m">$1M - $10M</SelectItem>
                <SelectItem value="10m-50m">$10M - $50M</SelectItem>
                <SelectItem value="50m-100m">$50M - $100M</SelectItem>
                <SelectItem value="100m+">$100M+</SelectItem>
                <SelectItem value="individual">Individual Number</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Custom Investment Amount - shown when "Individual Number" is selected */}
          {formData.investmentRange === "individual" && (
            <div className="space-y-2">
              <Label htmlFor="customInvestmentAmount">Investment Amount (USD)</Label>
              <Input
                id="customInvestmentAmount"
                type="number"
                value={formData.customInvestmentAmount}
                onChange={(e) => handleChange("customInvestmentAmount", e.target.value)}
                placeholder="Enter amount in USD (e.g., 5000000)"
                min="0"
                step="100000"
                className={errors.customInvestmentAmount ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {errors.customInvestmentAmount ? (
                <p className="text-sm text-red-500 mt-1">{errors.customInvestmentAmount}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Enter your specific investment amount in US Dollars</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => handleChange("message", e.target.value)}
              placeholder="Tell us about your property goals and timeline..."
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90"
            disabled={submitInquiry.isPending}
          >
            {submitInquiry.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Inquiry
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            By submitting this form, you agree to be contacted by 3B Solution regarding this property and other real estate opportunities.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
