import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Loader2, AlertCircle, Mail, ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdminLoginFormProps {
  onSuccess?: () => void;
}

type LoginStep = "credentials" | "otp";

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<LoginStep>("credentials");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [resendCooldown, setResendCooldown] = useState(0);

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

  // STEP 1: Submit email + password
  const handleLoginClick = async () => {
    if (isLoading) return;

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    if (!password) {
      setError("Please enter your password");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/oauth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim(), password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.success) {
        if (data.requiresOTP) {
          // Move to OTP step
          setSessionId(data.sessionId);
          setStep("otp");
          setCountdown(600); // 10 minutes
          setResendCooldown(60); // 60 seconds before allowing resend
          setError(null);
        } else {
          // Direct login (OTP disabled)
          if (onSuccess) {
            onSuccess();
          } else {
            window.location.href = "/admin";
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Verify OTP code
  const handleVerifyOTP = async () => {
    if (isLoading) return;

    if (!otpCode.trim()) {
      setError("Please enter the verification code");
      return;
    }

    if (otpCode.trim().length !== 6) {
      setError("Verification code must be 6 digits");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/oauth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sessionId, code: otpCode.trim() }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      if (data.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = "/admin";
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    if (resendCooldown > 0 || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/oauth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code");
      }

      if (data.success) {
        setSessionId(data.sessionId);
        setCountdown(600);
        setResendCooldown(60);
        setOtpCode("");
        setError(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Go back to credentials step
  const handleBack = () => {
    setStep("credentials");
    setOtpCode("");
    setSessionId(null);
    setError(null);
    setCountdown(0);
  };

  // Format countdown as MM:SS
  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
              {step === "credentials" ? (
                <Building2 className="w-8 h-8 text-primary" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-primary" />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-2">
              {step === "credentials" ? "Admin Portal" : "Email Verification"}
            </h1>
            <p className="text-muted-foreground">
              {step === "credentials"
                ? "Sign in to access the admin dashboard"
                : "Enter the 6-digit code sent to your email"}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* STEP 1: Email & Password */}
          {step === "credentials" && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="login-email" className="text-sm font-medium leading-none">
                  Email
                </label>
                <input
                  id="login-email"
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="admin@3bsolution.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="login-password" className="text-sm font-medium leading-none">
                  Password
                </label>
                <input
                  id="login-password"
                  type="password"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>

              <Button
                type="button"
                onClick={handleLoginClick}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="mt-6 text-center text-sm text-muted-foreground">
                <p>Contact your administrator if you need access.</p>
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification */}
          {step === "otp" && (
            <div className="space-y-4">
              {/* Email sent notification */}
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium text-blue-800 dark:text-blue-200">Code sent to:</p>
                  <p className="text-blue-600 dark:text-blue-400">{email}</p>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-2">
                <label htmlFor="otp-code" className="text-sm font-medium leading-none">
                  Verification Code
                </label>
                <input
                  id="otp-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="flex h-12 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-2xl font-mono tracking-[0.5em] ring-offset-background placeholder:text-muted-foreground placeholder:text-base placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    if (val.length <= 6) setOtpCode(val);
                  }}
                  disabled={isLoading}
                  autoComplete="one-time-code"
                  autoFocus
                />
              </div>

              {/* Countdown timer */}
              {countdown > 0 && (
                <p className="text-sm text-center text-muted-foreground">
                  Code expires in <span className="font-mono font-medium">{formatCountdown(countdown)}</span>
                </p>
              )}
              {countdown === 0 && step === "otp" && (
                <p className="text-sm text-center text-destructive font-medium">
                  Code has expired. Please request a new one.
                </p>
              )}

              {/* Verify Button */}
              <Button
                type="button"
                onClick={handleVerifyOTP}
                className="w-full bg-secondary hover:bg-secondary/90 text-white"
                disabled={isLoading || otpCode.length !== 6 || countdown === 0}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 mr-2" />
                    Verify & Sign In
                  </>
                )}
              </Button>

              {/* Resend & Back buttons */}
              <div className="flex items-center justify-between pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  disabled={isLoading}
                  className="text-muted-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleResendOTP}
                  disabled={isLoading || resendCooldown > 0}
                  className="text-muted-foreground"
                >
                  <RefreshCw className="w-4 h-4 mr-1" />
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                </Button>
              </div>

              <div className="mt-4 text-center text-xs text-muted-foreground">
                <p>Check your inbox and spam folder for the verification email.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
