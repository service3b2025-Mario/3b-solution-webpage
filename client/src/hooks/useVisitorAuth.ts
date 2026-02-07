import { useState, useEffect, useCallback } from "react";

interface VisitorUser {
  id: number;
  email: string;
  name: string | null;
  status: string;
}

interface UseVisitorAuthReturn {
  visitor: VisitorUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Hook to check visitor authentication status.
 * This is separate from the admin useAuth hook and checks the /api/visitor/me endpoint.
 * 
 * Note: Since visitors also get the main session cookie (app_session_id),
 * the existing useAuth hook will also work for visitors. This hook provides
 * additional visitor-specific data from the visitors table.
 */
export function useVisitorAuth(): UseVisitorAuthReturn {
  const [visitor, setVisitor] = useState<VisitorUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVisitor = useCallback(async () => {
    try {
      const response = await fetch("/api/visitor/me", {
        credentials: "include",
      });
      const data = await response.json();
      setVisitor(data.visitor || null);
    } catch (error) {
      console.warn("[VisitorAuth] Failed to fetch visitor:", error);
      setVisitor(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitor();
  }, [fetchVisitor]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    await fetchVisitor();
  }, [fetchVisitor]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/visitor/logout", {
        method: "POST",
        credentials: "include",
      });
      setVisitor(null);
      // Reload to clear all auth state
      window.location.reload();
    } catch (error) {
      console.error("[VisitorAuth] Logout failed:", error);
    }
  }, []);

  return {
    visitor,
    isLoading,
    isAuthenticated: !!visitor,
    refresh,
    logout,
  };
}
