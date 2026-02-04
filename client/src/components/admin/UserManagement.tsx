import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Key,
  Lock,
  Unlock,
  Shield,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";

// Role display names and colors
const ROLES = {
  admin: { label: "Administrator", color: "bg-red-500" },
  director: { label: "Director", color: "bg-purple-500" },
  dataEditor: { label: "Data Editor", color: "bg-blue-500" },
  propertySpecialist: { label: "Property Specialist", color: "bg-green-500" },
  salesSpecialist: { label: "Sales Specialist", color: "bg-orange-500" },
} as const;

type RoleKey = keyof typeof ROLES;

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

export function UserManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form state for new user
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    confirmPassword: "",
    role: "salesSpecialist" as RoleKey,
    isActive: true,
  });

  // Form state for edit user
  const [editUser, setEditUser] = useState({
    email: "",
    name: "",
    role: "salesSpecialist" as RoleKey,
    isActive: true,
  });

  // Form state for reset password
  const [resetPassword, setResetPassword] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const utils = trpc.useUtils();

  // Fetch users
  const { data: users, isLoading, error } = trpc.adminUser.list.useQuery();

  // Mutations
  const createUser = trpc.adminUser.create.useMutation({
    onSuccess: () => {
      utils.adminUser.list.invalidate();
      setIsAddDialogOpen(false);
      setNewUser({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        role: "salesSpecialist",
        isActive: true,
      });
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const updateUser = trpc.adminUser.update.useMutation({
    onSuccess: () => {
      utils.adminUser.list.invalidate();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const deleteUser = trpc.adminUser.delete.useMutation({
    onSuccess: () => {
      utils.adminUser.list.invalidate();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  const resetUserPassword = trpc.adminUser.resetPassword.useMutation({
    onSuccess: () => {
      utils.adminUser.list.invalidate();
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setResetPassword({ newPassword: "", confirmPassword: "" });
      toast.success("Password reset successfully. User must change password on next login.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const unlockAccount = trpc.adminUser.unlockAccount.useMutation({
    onSuccess: () => {
      utils.adminUser.list.invalidate();
      toast.success("Account unlocked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlock account");
    },
  });

  // Handlers
  const handleCreateUser = () => {
    const passwordValidation = validatePassword(newUser.password);
    if (!passwordValidation.valid) {
      toast.error("Password requirements: " + passwordValidation.errors.join(", "));
      return;
    }
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    createUser.mutate({
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
      isActive: newUser.isActive,
    });
  };

  const handleEditUser = () => {
    if (!selectedUser) return;
    updateUser.mutate({
      id: selectedUser.id,
      email: editUser.email,
      name: editUser.name,
      role: editUser.role,
      isActive: editUser.isActive,
    });
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    const passwordValidation = validatePassword(resetPassword.newPassword);
    if (!passwordValidation.valid) {
      toast.error("Password requirements: " + passwordValidation.errors.join(", "));
      return;
    }
    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    resetUserPassword.mutate({
      id: selectedUser.id,
      newPassword: resetPassword.newPassword,
    });
  };

  const handleDeleteUser = () => {
    if (!selectedUser) return;
    deleteUser.mutate({ id: selectedUser.id });
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setEditUser({
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setResetPassword({ newPassword: "", confirmPassword: "" });
    setIsResetPasswordDialogOpen(true);
  };

  const openDeleteDialog = (user: any) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Password strength indicator
  const PasswordStrength = ({ password }: { password: string }) => {
    const validation = validatePassword(password);
    if (!password) return null;
    
    return (
      <div className="mt-2 space-y-1">
        <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
        <div className="grid grid-cols-2 gap-1 text-xs">
          {[
            { check: password.length >= 8, label: "8+ characters" },
            { check: /[A-Z]/.test(password), label: "Uppercase letter" },
            { check: /[a-z]/.test(password), label: "Lowercase letter" },
            { check: /[0-9]/.test(password), label: "Number" },
            { check: /[^A-Za-z0-9]/.test(password), label: "Special character" },
          ].map((req, i) => (
            <div key={i} className={`flex items-center gap-1 ${req.check ? "text-green-600" : "text-muted-foreground"}`}>
              {req.check ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
              {req.label}
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-amber-600">
            <AlertCircle className="w-5 h-5" />
            <p>User management is not available. The database table may not be created yet.</p>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Run the database migration to enable this feature.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            User Management
          </h1>
          <p className="text-muted-foreground">
            Manage admin users and their access permissions
          </p>
        </div>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Admin Users
          </CardTitle>
          <CardDescription>
            {users?.length || 0} users with dashboard access
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">Loading users...</div>
          ) : users?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No users found. Add your first user to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users?.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-semibold text-primary">
                            {user.name?.charAt(0)?.toUpperCase() || "?"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ROLES[user.role as RoleKey]?.color || "bg-gray-500"} text-white`}>
                        {ROLES[user.role as RoleKey]?.label || user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {user.isActive ? (
                          <Badge variant="outline" className="text-green-600 border-green-600 w-fit">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-red-600 border-red-600 w-fit">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                        {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                          <Badge variant="outline" className="text-amber-600 border-amber-600 w-fit">
                            <Lock className="w-3 h-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                        {user.mustChangePassword && (
                          <Badge variant="outline" className="text-blue-600 border-blue-600 w-fit">
                            <Key className="w-3 h-3 mr-1" />
                            Must change password
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "Never"}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                            <Key className="w-4 h-4 mr-2" />
                            Reset Password
                          </DropdownMenuItem>
                          {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                            <DropdownMenuItem onClick={() => unlockAccount.mutate({ id: user.id })}>
                              <Unlock className="w-4 h-4 mr-2" />
                              Unlock Account
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(user)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new admin user with dashboard access
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-name">Full Name *</Label>
              <Input
                id="new-name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-email">Email Address *</Label>
              <Input
                id="new-email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="john@3bsolution.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-role">Role *</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: RoleKey) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">Initial Password *</Label>
              <Input
                id="new-password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                placeholder="••••••••"
              />
              <PasswordStrength password={newUser.password} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-confirm-password">Confirm Password *</Label>
              <Input
                id="new-confirm-password"
                type="password"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {newUser.confirmPassword && newUser.password !== newUser.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={createUser.isPending}>
              {createUser.isPending ? "Creating..." : "Create User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address *</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role *</Label>
              <Select
                value={editUser.role}
                onValueChange={(value: RoleKey) => setEditUser({ ...editUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLES).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="edit-active"
                checked={editUser.isActive}
                onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="edit-active">Account is active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditUser} disabled={updateUser.isPending}>
              {updateUser.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name}. They will be required to change it on next login.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reset-password">New Password *</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword.newPassword}
                onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
                placeholder="••••••••"
              />
              <PasswordStrength password={resetPassword.newPassword} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reset-confirm-password">Confirm Password *</Label>
              <Input
                id="reset-confirm-password"
                type="password"
                value={resetPassword.confirmPassword}
                onChange={(e) => setResetPassword({ ...resetPassword, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
              {resetPassword.confirmPassword && resetPassword.newPassword !== resetPassword.confirmPassword && (
                <p className="text-xs text-red-600">Passwords do not match</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetUserPassword.isPending}>
              {resetUserPassword.isPending ? "Resetting..." : "Reset Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">Warning</p>
            </div>
            <p className="text-sm text-red-700 mt-1">
              This will permanently remove the user's access to the admin dashboard.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser} disabled={deleteUser.isPending}>
              {deleteUser.isPending ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
