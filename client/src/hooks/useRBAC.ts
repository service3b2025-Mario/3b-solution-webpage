import { useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

// Role types matching backend
export type Role = 'admin' | 'director' | 'dataEditor' | 'propertySpecialist' | 'salesSpecialist';
export type Permission = 'create' | 'read' | 'update' | 'delete';
export type Resource = 
  | 'userManagement'
  | 'systemSettings'
  | 'apiCredentials'
  | 'dashboards'
  | 'crmDashboard'
  | 'properties'
  | 'leads'
  | 'bookings'
  | 'content'
  | 'teamMembers'
  | 'successStories';

// Permission matrix (must match backend)
const ROLE_PERMISSIONS: Record<Role, Record<Resource, Permission[]>> = {
  admin: {
    userManagement: ['create', 'read', 'update', 'delete'],
    systemSettings: ['create', 'read', 'update', 'delete'],
    apiCredentials: ['create', 'read', 'update', 'delete'],
    dashboards: ['create', 'read', 'update', 'delete'],
    crmDashboard: ['create', 'read', 'update', 'delete'],
    properties: ['create', 'read', 'update', 'delete'],
    leads: ['create', 'read', 'update', 'delete'],
    bookings: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    teamMembers: ['create', 'read', 'update', 'delete'],
    successStories: ['create', 'read', 'update', 'delete'],
  },
  director: {
    userManagement: [],
    systemSettings: [],
    apiCredentials: [],
    dashboards: ['create', 'read', 'update', 'delete'],
    crmDashboard: ['create', 'read', 'update', 'delete'],
    properties: ['create', 'read', 'update', 'delete'],
    leads: ['create', 'read', 'update', 'delete'],
    bookings: ['create', 'read', 'update', 'delete'],
    content: ['create', 'read', 'update', 'delete'],
    teamMembers: ['create', 'read', 'update', 'delete'],
    successStories: ['create', 'read', 'update', 'delete'],
  },
  dataEditor: {
    userManagement: [],
    systemSettings: [],
    apiCredentials: [],
    dashboards: ['read'],
    crmDashboard: [],
    properties: [],
    leads: [],
    bookings: [],
    content: ['create', 'read', 'update', 'delete'],
    teamMembers: ['create', 'read', 'update', 'delete'],
    successStories: ['create', 'read', 'update', 'delete'],
  },
  propertySpecialist: {
    userManagement: [],
    systemSettings: [],
    apiCredentials: [],
    dashboards: ['read'],
    crmDashboard: ['read'],
    properties: ['create', 'read', 'update', 'delete'],
    leads: ['read'],
    bookings: ['read'],
    content: ['read'],
    teamMembers: ['read'],
    successStories: ['read'],
  },
  salesSpecialist: {
    userManagement: [],
    systemSettings: [],
    apiCredentials: [],
    dashboards: ['read'],
    crmDashboard: ['read'],
    properties: ['read'],
    leads: ['read', 'update'],
    bookings: ['read', 'update'],
    content: [],
    teamMembers: [],
    successStories: [],
  },
};

// Role display names
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  admin: 'Administrator',
  director: 'Director',
  dataEditor: 'Data Editor',
  propertySpecialist: 'Property Specialist',
  salesSpecialist: 'Sales Specialist',
};

// Map sidebar items to resources
const SIDEBAR_RESOURCE_MAP: Record<string, Resource> = {
  'dashboard': 'dashboards',
  'crm-dashboard': 'crmDashboard',
  'sales-funnel': 'crmDashboard',
  'channels': 'crmDashboard',
  'expansion': 'crmDashboard',
  'properties': 'properties',
  'leads': 'leads',
  'bookings': 'bookings',
  'downloads': 'dashboards',
  'feedback': 'dashboards',
  'team': 'teamMembers',
  'content': 'content',
  'analytics': 'dashboards',
  'api-credentials': 'apiCredentials',
  'whatsapp': 'systemSettings',
  'settings': 'systemSettings',
  'user-management': 'userManagement',
};

export function useRBAC() {
  const { user } = useAuth();
  
  // Get user role - default to 'user' if not set
  // Map 'admin' database role to actual role from user data
  const userRole = useMemo((): Role => {
    if (!user) return 'salesSpecialist'; // Most restrictive by default
    
    // If user has extended role info, use it
    if ((user as any).extendedRole) {
      return (user as any).extendedRole as Role;
    }
    
    // Fallback: if user.role is 'admin', treat as admin
    if (user.role === 'admin') {
      return 'admin';
    }
    
    return 'salesSpecialist';
  }, [user]);

  // Check if user has specific permission on a resource
  const hasPermission = useMemo(() => {
    return (resource: Resource, permission: Permission): boolean => {
      const rolePermissions = ROLE_PERMISSIONS[userRole];
      if (!rolePermissions) return false;
      
      const resourcePermissions = rolePermissions[resource];
      if (!resourcePermissions) return false;
      
      return resourcePermissions.includes(permission);
    };
  }, [userRole]);

  // Check if user can access a resource (has any permission)
  const canAccess = useMemo(() => {
    return (resource: Resource): boolean => {
      const rolePermissions = ROLE_PERMISSIONS[userRole];
      if (!rolePermissions) return false;
      
      const resourcePermissions = rolePermissions[resource];
      return resourcePermissions && resourcePermissions.length > 0;
    };
  }, [userRole]);

  // Check if user can access a sidebar item
  const canAccessSidebar = useMemo(() => {
    return (sidebarId: string): boolean => {
      const resource = SIDEBAR_RESOURCE_MAP[sidebarId];
      if (!resource) return true; // Allow access if not mapped
      return canAccess(resource);
    };
  }, [canAccess]);

  // Get filtered sidebar items based on permissions
  const getFilteredSidebarItems = useMemo(() => {
    return (items: Array<{ id: string; label: string; icon: any }>) => {
      return items.filter(item => canAccessSidebar(item.id));
    };
  }, [canAccessSidebar]);

  // Check if user can perform CRUD operations
  const canCreate = (resource: Resource) => hasPermission(resource, 'create');
  const canRead = (resource: Resource) => hasPermission(resource, 'read');
  const canUpdate = (resource: Resource) => hasPermission(resource, 'update');
  const canDelete = (resource: Resource) => hasPermission(resource, 'delete');

  return {
    userRole,
    roleName: ROLE_DISPLAY_NAMES[userRole],
    hasPermission,
    canAccess,
    canAccessSidebar,
    getFilteredSidebarItems,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    isAdmin: userRole === 'admin',
    isDirector: userRole === 'director',
  };
}
