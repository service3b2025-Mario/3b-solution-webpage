import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, Key, Shield } from "lucide-react";

// Password validation
const validatePassword = (password: string): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  if (password.length < 8) errors.push("At least 8 characters");
  if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
  if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
  if (!/[0-9]/.test(password)) errors.push("One number");
  if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special character (!@#$%^&*)");
  return { valid: errors.length === 0, errors };
};

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isForced?: boolean; // If true, user must change password (can't close dialog)
  onSuccess?: () => void;
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
  isForced = false,
  onSuccess,
}: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePassword = trpc.adminUser.changeOwnPassword.useMutation({
    onSuccess: () => {
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to change password");
    },
  });

  const handleSubmit = () => {
    // Validate current password
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }

    // Validate new password
    const validation = validatePassword(newPassword);
    if (!validation.valid) {
      toast.error("Password requirements: " + validation.errors.join(", "));
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    // Check new password is different from current
    if (newPassword === currentPassword) {
      toast.error("New password must be different from current password");
      return;
    }

    changePassword.mutate({
      currentPassword,
      newPassword,
    });
  };

  // Password strength indicator
  const PasswordStrength = ({ password }: { password: string }) => {
    if (!password) return null;

    const requirements = [
      { check: password.length >= 8, label: "8+ characters" },
      { check: /[A-Z]/.test(password), label: "Uppercase letter" },
      { check: /[a-z]/.test(password), label: "Lowercase letter" },
      { check: /[0-9]/.test(password), label: "Number" },
      { check: /[^A-Za-z0-9]/.test(password), label: "Special character" },
    ];

    const metCount = requirements.filter((r) => r.check).length;
    const strengthLabel =
      metCount <= 2 ? "Weak" : metCount <= 4 ? "Medium" : "Strong";
    const strengthColor =
      metCount <= 2
        ? "bg-red-500"
        : metCount <= 4
        ? "bg-yellow-500"
        : "bg-green-500";

    return (
      <div className="mt-2 space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${strengthColor} transition-all`}
              style={{ width: `${(metCount / 5) * 100}%` }}
            />
          </div>
          <span className="text-xs font-medium">{strengthLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {requirements.map((req, i) => (
            <div
              key={i}
              className={`flex items-center gap-1 ${
                req.check ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              {req.check ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {req.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={isForced ? undefined : onOpenChange}
    >
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={isForced ? (e) => e.preventDefault() : undefined}
        onEscapeKeyDown={isForced ? (e) => e.preventDefault() : undefined}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {isForced ? "Password Change Required" : "Change Password"}
          </DialogTitle>
          <DialogDescription>
            {isForced
              ? "For security reasons, you must change your password before continuing."
              : "Update your password to keep your account secure."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password *</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-password">New Password *</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
            />
            <PasswordStrength password={newPassword} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-new-password">Confirm New Password *</Label>
            <Input
              id="confirm-new-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <XCircle className="w-3 h-3" />
                Passwords do not match
              </p>
            )}
            {confirmPassword && newPassword === confirmPassword && newPassword && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Passwords match
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          {!isForced && (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSubmit}
            disabled={changePassword.isPending}
            className="gap-2"
          >
            <Key className="w-4 h-4" />
            {changePassword.isPending ? "Changing..." : "Change Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ChangePasswordDialog;
