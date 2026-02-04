import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Key,
  LogOut,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

type UserRole = "user" | "Admin" | "Director" | "DataEditor" | "PropertySpecialist" | "SalesSpecialist";

interface User {
  id: number;
  name: string | null;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  mfaEnabled: boolean;
  lastSignedIn: Date | null;
  createdAt: Date;
  failedLoginAttempts: number | null;
  lockedUntil: Date | null;
}

const roleColors: Record<UserRole, string> = {
  user: "bg-gray-100 text-gray-800",
  Admin: "bg-red-100 text-red-800",
  Director: "bg-purple-100 text-purple-800",
  DataEditor: "bg-blue-100 text-blue-800",
  PropertySpecialist: "bg-green-100 text-green-800",
  SalesSpecialist: "bg-orange-100 text-orange-800",
};

const roleDescriptions: Record<UserRole, string> = {
  user: "No admin access",
  Admin: "Full system access",
  Director: "Strategic oversight with full CRUD",
  DataEditor: "Content, team, and stories management",
  PropertySpecialist: "Property management",
  SalesSpecialist: "Leads and bookings management",
};

export function UserManagement() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "SalesSpecialist" as UserRole,
  });
  const [editUser, setEditUser] = useState({
    name: "",
    email: "",
    role: "SalesSpecialist" as UserRole,
    isActive: true,
  });
  const [newPassword, setNewPassword] = useState("");

  // Queries
  const { data: users, isLoading, refetch } = trpc.users.list.useQuery();
  const { data: roles } = trpc.users.getRoles.useQuery();

  // Mutations
  const createUserMutation = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("User created successfully");
      setIsCreateDialogOpen(false);
      setNewUser({ name: "", email: "", password: "", role: "SalesSpecialist" });
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("User updated successfully");
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetPasswordMutation = trpc.users.resetPassword.useMutation({
    onSuccess: () => {
      toast.success("Password reset successfully. User will need to log in again.");
      setIsResetPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedUser(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteUserMutation = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("User deactivated successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const forceLogoutMutation = trpc.users.forceLogout.useMutation({
    onSuccess: () => {
      toast.success("User has been logged out from all devices");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleCreateUser = () => {
    createUserMutation.mutate(newUser);
  };

  const handleUpdateUser = () => {
    if (!selectedUser) return;
    updateUserMutation.mutate({
      id: selectedUser.id,
      ...editUser,
    });
  };

  const handleResetPassword = () => {
    if (!selectedUser) return;
    resetPasswordMutation.mutate({
      id: selectedUser.id,
      newPassword,
    });
  };

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setEditUser({
      name: user.name || "",
      email: user.email || "",
      role: user.role,
      isActive: user.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openResetPasswordDialog = (user: User) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsResetPasswordDialogOpen(true);
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    if (password.length < 12) errors.push("At least 12 characters");
    if (!/[A-Z]/.test(password)) errors.push("One uppercase letter");
    if (!/[a-z]/.test(password)) errors.push("One lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("One number");
    if (!/[^A-Za-z0-9]/.test(password)) errors.push("One special character");
    return errors;
  };

  const passwordErrors = validatePassword(newUser.password);
  const newPasswordErrors = validatePassword(newPassword);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage admin panel users and their access permissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the admin panel with specific role permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    placeholder="john@3bsolution.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Enter secure password"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {newUser.password && passwordErrors.length > 0 && (
                    <div className="text-sm text-destructive space-y-1">
                      <p className="font-medium">Password requirements:</p>
                      <ul className="list-disc list-inside">
                        {passwordErrors.map((error, i) => (
                          <li key={i}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles?.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex flex-col">
                            <span>{role.label}</span>
                            <span className="text-xs text-muted-foreground">{role.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateUser}
                  disabled={
                    createUserMutation.isPending ||
                    !newUser.name ||
                    !newUser.email ||
                    passwordErrors.length > 0
                  }
                >
                  {createUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create User
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Role Legend */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {roles?.map((role) => (
              <div key={role.value} className="flex items-start gap-2">
                <Badge className={roleColors[role.value as UserRole]}>{role.label}</Badge>
                <span className="text-xs text-muted-foreground">{role.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users?.length || 0})</CardTitle>
          <CardDescription>All users with admin panel access</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sign In</TableHead>
                <TableHead>Security</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.map((user) => (
                <TableRow key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                  <TableCell className="font-medium">{user.name || "—"}</TableCell>
                  <TableCell>{user.email || "—"}</TableCell>
                  <TableCell>
                    <Badge className={roleColors[user.role as UserRole]}>{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {user.isActive ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                        Inactive
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.lastSignedIn
                      ? new Date(user.lastSignedIn).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.mfaEnabled ? (
                        <ShieldCheck className="w-4 h-4 text-green-600" title="MFA Enabled" />
                      ) : (
                        <Shield className="w-4 h-4 text-gray-400" title="MFA Disabled" />
                      )}
                      {user.lockedUntil && new Date(user.lockedUntil) > new Date() && (
                        <ShieldAlert className="w-4 h-4 text-red-600" title="Account Locked" />
                      )}
                      {(user.failedLoginAttempts || 0) > 0 && (
                        <span className="text-xs text-orange-600">
                          {user.failedLoginAttempts} failed
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(user)}
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openResetPasswordDialog(user)}
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => forceLogoutMutation.mutate(user.id)}
                        title="Force Logout"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" title="Deactivate User">
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Deactivate User?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will deactivate {user.name || user.email}'s account. They will no
                              longer be able to access the admin panel. This action can be reversed
                              by reactivating the account.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteUserMutation.mutate(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Deactivate
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user information and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input
                id="edit-name"
                value={editUser.name}
                onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email Address</Label>
              <Input
                id="edit-email"
                type="email"
                value={editUser.email}
                onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles?.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex flex-col">
                        <span>{role.label}</span>
                        <span className="text-xs text-muted-foreground">{role.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Account Status</Label>
                <p className="text-sm text-muted-foreground">
                  {editUser.isActive ? "User can access the admin panel" : "User is blocked from access"}
                </p>
              </div>
              <Switch
                checked={editUser.isActive}
                onCheckedChange={(checked) => setEditUser({ ...editUser, isActive: checked })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {selectedUser?.name || selectedUser?.email}. They will be
              logged out of all devices.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <p className="text-sm text-amber-800">
                This will immediately log the user out of all sessions.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <div className="relative">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {newPassword && newPasswordErrors.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  <p className="font-medium">Password requirements:</p>
                  <ul className="list-disc list-inside">
                    {newPasswordErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={resetPasswordMutation.isPending || newPasswordErrors.length > 0}
            >
              {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UserManagement;
