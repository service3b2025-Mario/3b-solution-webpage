import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, ArrowLeft, RefreshCw, Heart, CheckCircle2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VisitorLoginModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  triggerContext?: "wishlist" | "saved-search" | "general";
}

type LoginStep = "email" | "otp" | "success";

export function VisitorLoginModal({
  open,
  onOpenChange,
  onSuccess,
  triggerContext = "general",
}: VisitorLoginModalProps) {
  const [step, setStep] = useState<LoginStep>("email");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isNewVisitor, setIsNewVisitor] = useState(false);
  const [gdprConsent, setGdprConsent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow close animation
      const timer = setTimeout(() => {
        setStep("email");
        setEmail("");
        setName("");
        setOtpCode("");
        setSessionId(null);
        setError(null);
        setIsNewVisitor(false);
        setGdprConsent(false);
        setCountdown(0);
        setResendCooldown(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [step, countdown]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  const getContextMessage = () => {
    switch (triggerContext) {
      case "wishlist":
        return "Sign in to save properties to your wishlist and track your favorite investments.";
      case "saved-search":
        return "Sign in to save your search criteria and get notified about new matching properties.";
      default:
        return "Sign in to access personalized features, save properties, and track your investment journey.";
    }
  };

  // STEP 1: Request OTP
  const handleRequestOTP = async () => {
    if (isLoading) return;
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visitor/request-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          gdprConsent: gdprConsent,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.requiresConsent) {
          setIsNewVisitor(true);
          setError("Please accept the privacy policy to create your account.");
          setIsLoading(false);
          return;
        }
        throw new Error(data.error || "Failed to send verification code");
      }

      setSessionId(data.sessionId);
      setIsNewVisitor(data.isNewVisitor);
      setStep("otp");
      setCountdown(900); // 15 minutes
      setResendCooldown(60); // 60 second cooldown before resend
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOTP = useCallback(async (code?: string) => {
    const otpToVerify = code || otpCode;
    if (isLoading || otpToVerify.length !== 6) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visitor/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          code: otpToVerify,
          name: name.trim() || undefined,
          gdprConsent: gdprConsent,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      // Success!
      setStep("success");
      
      // Brief success animation, then close and trigger callback
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
        // Reload the page to refresh auth state
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Verification failed. Please try again.");
      setOtpCode("");
    } finally {
      setIsLoading(false);
    }
  }, [otpCode, isLoading, sessionId, name, gdprConsent, onOpenChange, onSuccess]);

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/visitor/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      setSessionId(data.sessionId);
      setOtpCode("");
      setCountdown(900);
      setResendCooldown(60);
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to resend code");
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden">
        {/* Header with branding */}
        <div className="bg-gradient-to-r from-[#0f2b46] via-[#1a4a7a] to-[#0f2b46] px-6 pt-6 pb-4">
          <DialogHeader>
            <DialogTitle className="text-white text-lg font-semibold flex items-center gap-2">
              {step === "email" && (
                <>
                  <Heart className="h-5 w-5 text-[#c9a84c]" />
                  Sign In to 3B Solution
                </>
              )}
              {step === "otp" && (
                <>
                  <Mail className="h-5 w-5 text-[#c9a84c]" />
                  Check Your Email
                </>
              )}
              {step === "success" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  Welcome!
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-300 text-sm mt-1">
              {step === "email" && getContextMessage()}
              {step === "otp" && `We sent a 6-digit code to ${email}`}
              {step === "success" && "You're now signed in. Enjoy your personalized experience!"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription className="text-sm">{error}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Email Input */}
          {step === "email" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="visitor-email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="visitor-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="visitor-name" className="text-sm font-medium">
                  Name <span className="text-gray-400 font-normal">(optional)</span>
                </Label>
                <Input
                  id="visitor-name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
                  disabled={isLoading}
                />
              </div>

              {/* GDPR Consent */}
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border">
                <input
                  type="checkbox"
                  id="gdpr-consent"
                  checked={gdprConsent}
                  onChange={(e) => {
                    setGdprConsent(e.target.checked);
                    if (e.target.checked) setError(null);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-[#1a4a7a] focus:ring-[#1a4a7a]"
                  disabled={isLoading}
                />
                <label htmlFor="gdpr-consent" className="text-xs text-gray-600 leading-relaxed">
                  I agree to the{" "}
                  <a href="/legal/privacy-policy" target="_blank" className="text-[#1a4a7a] underline hover:text-[#c9a84c]">
                    Privacy Policy
                  </a>{" "}
                  and consent to 3B Solution processing my data to provide personalized property recommendations and investment insights. I can withdraw my consent at any time.
                </label>
              </div>

              <Button
                onClick={handleRequestOTP}
                disabled={isLoading || !email.trim() || !gdprConsent}
                className="w-full bg-[#1a4a7a] hover:bg-[#0f2b46] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>

              <p className="text-xs text-center text-gray-400 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                No password needed. We'll send a one-time code to your email.
              </p>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <p className="text-sm text-gray-600 text-center">
                  Enter the 6-digit verification code:
                </p>

                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={(value) => {
                    setOtpCode(value);
                    setError(null);
                    // Auto-submit when 6 digits entered
                    if (value.length === 6) {
                      handleVerifyOTP(value);
                    }
                  }}
                  disabled={isLoading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                  </InputOTPGroup>
                  <span className="text-gray-300 mx-1">-</span>
                  <InputOTPGroup>
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>

                {countdown > 0 && (
                  <p className="text-xs text-gray-400">
                    Code expires in {formatTime(countdown)}
                  </p>
                )}
              </div>

              <Button
                onClick={() => handleVerifyOTP()}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-[#1a4a7a] hover:bg-[#0f2b46] text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Code"
                )}
              </Button>

              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("email");
                    setOtpCode("");
                    setError(null);
                  }}
                  disabled={isLoading}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
                  {resendCooldown > 0
                    ? `Resend in ${resendCooldown}s`
                    : "Resend Code"}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-4 space-y-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-gray-600 text-center">
                {isNewVisitor
                  ? "Your account has been created. Welcome to 3B Solution!"
                  : "Welcome back! You're now signed in."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
