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
  Unlock,
  Shield,
  CheckCircle,
  XCircle,
  RefreshCw,
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
  const { data: users, isLoading, refetch } = trpc.adminUsers.list.useQuery();

  // Mutations - Fixed with proper refetch after success
  const createUser = trpc.adminUsers.create.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
      await refetch();
      setIsAddDialogOpen(false);
      setNewUser({
        email: "",
        name: "",
        password: "",
        confirmPassword: "",
        role: "salesSpecialist",
      });
      toast.success("User created successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create user");
    },
  });

  const updateUser = trpc.adminUsers.update.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
      await refetch();
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update user");
    },
  });

  const resetPasswordMutation = trpc.adminUsers.resetPassword.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
      await refetch();
      setIsResetPasswordDialogOpen(false);
      setSelectedUser(null);
      setResetPassword({ newPassword: "", confirmPassword: "" });
      toast.success("Password reset successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to reset password");
    },
  });

  const unlockUser = trpc.adminUsers.unlock.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
      await refetch();
      toast.success("Account unlocked successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to unlock account");
    },
  });

  const deleteUser = trpc.adminUsers.delete.useMutation({
    onSuccess: async () => {
      await utils.adminUsers.list.invalidate();
      await refetch();
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete user");
    },
  });

  // Handlers
  const handleCreateUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(newUser.password);
    if (!validation.valid) {
      toast.error("Password requirements not met: " + validation.errors.join(", "));
      return;
    }

    createUser.mutate({
      email: newUser.email,
      name: newUser.name,
      password: newUser.password,
      role: newUser.role,
    });
  };

  const handleUpdateUser = () => {
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

    if (resetPassword.newPassword !== resetPassword.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const validation = validatePassword(resetPassword.newPassword);
    if (!validation.valid) {
      toast.error("Password requirements not met: " + validation.errors.join(", "));
      return;
    }

    resetPasswordMutation.mutate({
      id: selectedUser.id,
      newPassword: resetPassword.newPassword,
    });
  };

  const handleUnlockAccount = (user: any) => {
    unlockUser.mutate({ id: user.id });
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

  const isAccountLocked = (user: any) => {
    return user.lockedUntil && new Date(user.lockedUntil) > new Date();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <CardTitle>User Management</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>
        <CardDescription>
          Manage admin panel users and their access permissions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading users...</div>
        ) : !users || users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No users found. Click "Add User" to create the first admin user.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge className={ROLES[user.role as RoleKey]?.color || "bg-gray-500"}>
                      {ROLES[user.role as RoleKey]?.label || user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {user.isActive ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      {isAccountLocked(user) && (
                        <Badge variant="destructive" className="text-xs">
                          Locked
                        </Badge>
                      )}
                      {user.mustChangePassword && (
                        <Badge variant="outline" className="text-xs">
                          Must Change Password
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleDateString()
                      : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(user)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openResetPasswordDialog(user)}>
                          <Key className="h-4 w-4 mr-2" />
                          Reset Password
                        </DropdownMenuItem>
                        {isAccountLocked(user) && (
                          <DropdownMenuItem onClick={() => handleUnlockAccount(user)}>
                            <Unlock className="h-4 w-4 mr-2" />
                            Unlock Account
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem
                          onClick={() => openDeleteDialog(user)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new admin panel user with specific role permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="john@3bsolution.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value: RoleKey) => setNewUser({ ...newUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={(e) => setNewUser({ ...newUser, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="text-xs text-muted-foreground">
                Password must have: 8+ characters, uppercase, lowercase, number, special character
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser} disabled={createUser.isPending}>
                <Shield className="h-4 w-4 mr-2" />
                {createUser.isPending ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and permissions.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={editUser.name}
                  onChange={(e) => setEditUser({ ...editUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editUser.email}
                  onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(value: RoleKey) => setEditUser({ ...editUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
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
                  className="h-4 w-4"
                />
                <Label htmlFor="edit-active">Account Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateUser} disabled={updateUser.isPending}>
                {updateUser.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reset Password Dialog */}
        <Dialog open={isResetPasswordDialogOpen} onOpenChange={setIsResetPasswordDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Set a new password for {selectedUser?.name}. They will be required to change it on next login.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={resetPassword.newPassword}
                  onChange={(e) => setResetPassword({ ...resetPassword, newPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input
                  id="confirm-new-password"
                  type="password"
                  value={resetPassword.confirmPassword}
                  onChange={(e) => setResetPassword({ ...resetPassword, confirmPassword: e.target.value })}
                  placeholder="••••••••"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsResetPasswordDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={resetPasswordMutation.isPending}>
                {resetPasswordMutation.isPending ? "Resetting..." : "Reset Password"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete User</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
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
      </CardContent>
    </Card>
  );
}
