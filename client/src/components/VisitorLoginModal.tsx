import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Loader2, Mail, ArrowLeft, RefreshCw, Heart, CheckCircle2, Shield, X } from "lucide-react";
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
  const contentRef = useRef<HTMLDivElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!open) {
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
    } else {
      // Focus email input when modal opens
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

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

  // Block ALL events from passing through the modal
  const blockEvent = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  // STEP 1: Request OTP
  const handleRequestOTP = async () => {
    if (isLoading) return;
    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

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
      setCountdown(900);
      setResendCooldown(60);
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

      setStep("success");
      
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
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

  // Handle overlay click (close modal)
  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    // Only close if clicking the overlay itself, not the content
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      onClick={blockEvent}
      onPointerDown={blockEvent}
      onMouseDown={blockEvent}
      onTouchStart={blockEvent}
    >
      {/* Overlay - blocks ALL interaction with page behind */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in-0 duration-200"
        onClick={handleOverlayClick}
        onPointerDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
        onMouseDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
      />

      {/* Modal Content */}
      <div
        ref={contentRef}
        className="relative z-[201] w-full max-w-[440px] mx-4 bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200"
        onClick={blockEvent}
        onPointerDown={blockEvent}
        onMouseDown={blockEvent}
        role="dialog"
        aria-modal="true"
        aria-labelledby="visitor-modal-title"
      >
        {/* Close Button */}
        <button
          onClick={(e) => {
            blockEvent(e);
            onOpenChange(false);
          }}
          className="absolute top-4 right-4 z-10 text-white/70 hover:text-white transition-opacity rounded-sm focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with branding */}
        <div className="bg-gradient-to-r from-[#0f2b46] via-[#1a4a7a] to-[#0f2b46] px-6 pt-6 pb-4">
          <div className="flex flex-col gap-2 text-left">
            <h2 id="visitor-modal-title" className="text-white text-lg font-semibold flex items-center gap-2">
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
            </h2>
            <p className="text-gray-300 text-sm mt-1">
              {step === "email" && getContextMessage()}
              {step === "otp" && `We sent a 6-digit code to ${email}`}
              {step === "success" && "You're now signed in. Enjoy your personalized experience!"}
            </p>
          </div>
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
                  ref={emailInputRef}
                  id="visitor-email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleRequestOTP()}
                  onClick={blockEvent}
                  onPointerDown={blockEvent}
                  onMouseDown={blockEvent}
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
                  onClick={blockEvent}
                  onPointerDown={blockEvent}
                  onMouseDown={blockEvent}
                  disabled={isLoading}
                />
              </div>

              {/* GDPR Consent */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    id="gdpr-consent"
                    type="checkbox"
                    checked={gdprConsent}
                    onChange={(e) => {
                      setGdprConsent(e.target.checked);
                      setError(null);
                    }}
                    onClick={blockEvent}
                    onPointerDown={blockEvent}
                    onMouseDown={blockEvent}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-[#0f2b46] focus:ring-[#0f2b46]"
                  />
                  <span className="text-xs text-gray-600 leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="/legal/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#1a4a7a] underline hover:text-[#c9a84c]"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Privacy Policy
                    </a>{" "}
                    and consent to 3B Solution processing my data to provide
                    personalized property recommendations and investment insights.
                    I can withdraw my consent at any time.
                  </span>
                </label>
              </div>

              <Button
                onClick={(e) => {
                  blockEvent(e);
                  handleRequestOTP();
                }}
                onPointerDown={blockEvent}
                onMouseDown={blockEvent}
                disabled={isLoading}
                className="w-full bg-[#1a4a7a] hover:bg-[#0f2b46] text-white h-11"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Verification Code
                  </>
                )}
              </Button>

              <p className="text-center text-xs text-gray-400 flex items-center justify-center gap-1">
                <Shield className="h-3 w-3" />
                No password needed. We'll send a one-time code to your email.
              </p>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-sm text-gray-600 text-center">
                  Enter the 6-digit verification code:
                </p>
                <div
                  onClick={blockEvent}
                  onPointerDown={blockEvent}
                  onMouseDown={blockEvent}
                >
                  <InputOTP
                    maxLength={6}
                    value={otpCode}
                    onChange={(value) => {
                      setOtpCode(value);
                      setError(null);
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
                    <span className="text-gray-400">-</span>
                    <InputOTPGroup>
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {countdown > 0 && (
                  <p className="text-xs text-gray-400">
                    Code expires in {formatTime(countdown)}
                  </p>
                )}
              </div>

              <Button
                onClick={(e) => {
                  blockEvent(e);
                  handleVerifyOTP();
                }}
                onPointerDown={blockEvent}
                onMouseDown={blockEvent}
                disabled={isLoading || otpCode.length !== 6}
                className="w-full bg-[#1a4a7a] hover:bg-[#0f2b46] text-white h-11"
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

              <div className="flex justify-between items-center pt-2">
                <button
                  onClick={(e) => {
                    blockEvent(e);
                    setStep("email");
                    setOtpCode("");
                    setError(null);
                  }}
                  onPointerDown={blockEvent}
                  onMouseDown={blockEvent}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Back
                </button>
                <button
                  onClick={(e) => {
                    blockEvent(e);
                    handleResendOTP();
                  }}
                  onPointerDown={blockEvent}
                  onMouseDown={blockEvent}
                  disabled={resendCooldown > 0 || isLoading}
                  className={`text-sm flex items-center gap-1 ${
                    resendCooldown > 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-[#1a4a7a] hover:text-[#0f2b46]"
                  }`}
                >
                  <RefreshCw className="h-3 w-3" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Success */}
          {step === "success" && (
            <div className="flex flex-col items-center py-6 gap-3">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center animate-in zoom-in-50 duration-300">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-lg font-semibold text-gray-800">You're all set!</p>
              <p className="text-sm text-gray-500 text-center">
                Redirecting you back...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
