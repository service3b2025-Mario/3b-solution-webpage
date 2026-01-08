import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Phone, Mail, MapPin, Calendar, Video, Users, Clock, Globe, Linkedin, Check, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const meetingTypes = [
  { value: "video", label: "Video Call", icon: Video, desc: "Google Meet, Zoom, or Teams" },
  { value: "phone", label: "Phone Call", icon: Phone, desc: "Direct phone consultation" },
  { value: "inperson", label: "In-Person", icon: Users, desc: "Office meeting in Manila" },
];

const investmentRanges = [
  { value: "100k-1m", label: "$100K - $1M" },
  { value: "1m-10m", label: "$1M - $10M" },
  { value: "10m-50m", label: "$10M - $50M" },
  { value: "50m-100m", label: "$50M - $100M" },
  { value: "100m+", label: "$100M+" },
  { value: "individual", label: "Individual Number" },
];

const investorTypes = [
  { value: "PrivateInvestor", label: "Individual Investor" },
  { value: "FamilyOffice", label: "Family Office" },
  { value: "Institutional", label: "Institutional Investor" },
  { value: "Developer", label: "Developer" },
  { value: "Partner", label: "Partner" },
  { value: "Other", label: "Other" },
];

export default function Contact() {
  const { data: experts } = trpc.team.experts.useQuery();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    investorType: "",
    investmentRange: "",
    customInvestmentAmount: "",
    interests: [] as string[],
    message: "",
    preferredExpert: "",
    meetingType: "",
    preferredDate: "",
    preferredTime: "",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const createLead = trpc.leads.create.useMutation();

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
    if (formData.investmentRange === "individual" && !formData.customInvestmentAmount) {
      newErrors.customInvestmentAmount = "Please enter an investment amount";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setErrors({});

    // Validate form
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create lead
      // Combine investment range with custom amount if "individual" is selected
      const finalInvestmentRange = formData.investmentRange === "individual" && formData.customInvestmentAmount
        ? `$${parseFloat(formData.customInvestmentAmount).toLocaleString('en-US')} USD`
        : formData.investmentRange;

      await createLead.mutateAsync({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        company: formData.company,
        ...(formData.investorType && { investorType: formData.investorType as any }),
        investmentRange: finalInvestmentRange,
        
        message: formData.message,
        source: "contact_form",
      });

      // Note: Booking creation moved to admin panel after lead review
      // Contact form now only creates leads, not direct bookings

      // Show success modal instead of just toast
      setShowSuccessModal(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        company: "",
        investorType: "",
        investmentRange: "",
        customInvestmentAmount: "",
        interests: [],
        message: "",
        preferredExpert: "",
        meetingType: "",
        preferredDate: "",
        preferredTime: "",
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      });
    } catch (error: any) {
      console.error('Form submission error:', error);
      const errorMessage = error?.message || "Something went wrong. Please try again or contact us directly.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Contact" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Contact Us
            </h1>
            <p className="text-xl text-white/80">
              Connect with our expert team for personalized investment guidance
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-2xl">Schedule a Consultation</CardTitle>
                  <p className="text-muted-foreground">
                    Fill out the form below and one of our experts will contact you within 24 hours.
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">First Name *</label>
                        <Input
                          required
                          value={formData.firstName}
                          onChange={(e) => {
                            setFormData({ ...formData, firstName: e.target.value });
                            if (errors.firstName) setErrors({ ...errors, firstName: "" });
                          }}
                          placeholder="John"
                          className={errors.firstName ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.firstName && (
                          <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Last Name *</label>
                        <Input
                          required
                          value={formData.lastName}
                          onChange={(e) => {
                            setFormData({ ...formData, lastName: e.target.value });
                            if (errors.lastName) setErrors({ ...errors, lastName: "" });
                          }}
                          placeholder="Doe"
                          className={errors.lastName ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email *</label>
                        <Input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            if (errors.email) setErrors({ ...errors, email: "" });
                          }}
                          placeholder="john@example.com"
                          className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
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

                    {/* Investment Profile */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Investor Type</label>
                        <Select value={formData.investorType} onValueChange={(v) => setFormData({ ...formData, investorType: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            {investorTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Investment Range</label>
                        <Select value={formData.investmentRange} onValueChange={(v) => setFormData({ ...formData, investmentRange: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select range" />
                          </SelectTrigger>
                          <SelectContent>
                            {investmentRanges.map((range) => (
                              <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Custom Investment Amount - shown when "Individual Number" is selected */}
                    {formData.investmentRange === "individual" && (
                      <div>
                        <label className="text-sm font-medium mb-2 block">Investment Amount (USD)</label>
                        <Input
                          type="number"
                          value={formData.customInvestmentAmount}
                          onChange={(e) => {
                            setFormData({ ...formData, customInvestmentAmount: e.target.value });
                            if (errors.customInvestmentAmount) setErrors({ ...errors, customInvestmentAmount: "" });
                          }}
                          placeholder="Enter amount in USD (e.g., 5000000)"
                          min="0"
                          step="100000"
                          className={errors.customInvestmentAmount ? "border-red-500 focus-visible:ring-red-500" : ""}
                        />
                        {errors.customInvestmentAmount ? (
                          <p className="text-sm text-red-500 mt-1">{errors.customInvestmentAmount}</p>
                        ) : (
                          <p className="text-xs text-muted-foreground mt-1">Enter your specific investment amount in US Dollars</p>
                        )}
                      </div>
                    )}

                    {/* Meeting Preferences */}
                    <div className="border-t border-border pt-6">
                      <h3 className="font-semibold mb-4">Meeting Preferences</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        {meetingTypes.map((type) => (
                          <div
                            key={type.value}
                            onClick={() => setFormData({ ...formData, meetingType: type.value })}
                            className={`p-4 border rounded-lg cursor-pointer transition-all ${
                              formData.meetingType === type.value
                                ? "border-secondary bg-secondary/5"
                                : "border-border hover:border-secondary/50"
                            }`}
                          >
                            <type.icon className={`w-6 h-6 mb-2 ${formData.meetingType === type.value ? "text-secondary" : "text-muted-foreground"}`} />
                            <p className="font-medium text-sm">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.desc}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">Preferred Expert</label>
                          <Select value={formData.preferredExpert} onValueChange={(v) => setFormData({ ...formData, preferredExpert: v })}>
                            <SelectTrigger>
                              <SelectValue placeholder="Any available expert" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="any">Any available expert</SelectItem>
                              {(experts || []).map((expert) => (
                                <SelectItem key={expert.id} value={expert.id.toString()}>{expert.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Preferred Date</label>
                          <Input
                            type="date"
                            value={formData.preferredDate}
                            onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                            min={new Date().toISOString().split('T')[0]}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Message */}
                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <Textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us about your investment goals and interests..."
                        rows={4}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full bg-secondary hover:bg-secondary/90 text-white h-12 text-lg"
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

                    <p className="text-xs text-muted-foreground text-center">
                      By submitting this form, you agree to our privacy policy. We'll never share your information with third parties.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Contact Info */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Get in Touch</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">3B SolutionPH Corp.</p>
                      <p className="text-sm text-muted-foreground">7th Floor Unit 710, High Street South Corporate Plaza, Tower 2</p>
                      <p className="text-sm text-muted-foreground">26th Street Corner 11th Ave., Bonifacio Global City</p>
                      <p className="text-sm text-muted-foreground">1630 Taguig City, Philippines</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">3B SolutionDE</p>
                      <p className="text-sm text-muted-foreground">Weidenweg 17, 15806 Zossen, Germany</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Email</p>
                      <a href="mailto:info@3bsolution.de" className="text-sm text-muted-foreground hover:text-foreground">
                        info@3bsolution.de
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Website</p>
                      <a href="https://www.3bsolution.com" target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground">
                        www.3bsolution.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm text-muted-foreground">Mon - Fri: 9:00 AM - 6:00 PM (GMT+8)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Expert Team */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Our Experts</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(experts || []).map((expert) => (
                    <div key={expert.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                      {expert.photo ? (
                        <img 
                          src={expert.photo} 
                          alt={expert.name}
                          className="w-12 h-12 rounded-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{expert.name}</p>
                        <p className="text-sm text-muted-foreground">{expert.role}</p>
                      </div>
                      {expert.linkedIn && (
                        <a href={expert.linkedIn} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-secondary">
                          <Linkedin className="w-5 h-5" />
                        </a>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Why Contact Us */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90 text-primary-foreground">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-lg mb-4">Why Contact Us?</h3>
                  <ul className="space-y-3">
                    {[
                      "Free consultation with no obligation",
                      "Personalized investment recommendations",
                      "Access to exclusive opportunities",
                      "Expert guidance from industry experts",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-secondary rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-2xl">Thank You for Reaching Out!</DialogTitle>
            <DialogDescription className="text-center space-y-4 pt-4">
              <p className="text-base">
                Your inquiry has been successfully submitted. Our team will review your information and get back to you within <strong>24 hours</strong>.
              </p>
              <div className="bg-muted p-4 rounded-lg text-left space-y-2">
                <p className="text-sm font-medium text-foreground">What happens next?</p>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>We'll review your investment profile and interests</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>A dedicated expert will be assigned to your inquiry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>You'll receive a personalized response via email</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-muted-foreground">
                Need immediate assistance? Email us at{" "}
                <a href="mailto:info@3bsolution.de" className="text-secondary hover:underline font-medium">
                  info@3bsolution.de
                </a>
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="flex-1 bg-secondary hover:bg-secondary/90"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
