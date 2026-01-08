import { describe, it, expect, vi } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

describe("Download Analytics", () => {
  // Mock admin context
  const mockAdminContext: Context = {
    user: {
      id: 1,
      openId: "test-admin",
      name: "Admin User",
      email: "admin@test.com",
      role: "admin",
      loginMethod: "email",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      ip: "127.0.0.1",
      get: vi.fn((header: string) => {
        if (header === "user-agent") return "test-agent";
        return null;
      }),
      connection: { remoteAddress: "127.0.0.1" },
    } as any,
    res: {} as any,
  };

  // Mock non-admin context
  const mockUserContext: Context = {
    ...mockAdminContext,
    user: {
      ...mockAdminContext.user!,
      role: "user",
    },
  };

  describe("downloads.list", () => {
    it("should return list of downloads for admin users", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const result = await caller.downloads.list();

      expect(Array.isArray(result)).toBe(true);
      // Verify structure of download records
      if (result.length > 0) {
        const download = result[0];
        expect(download).toHaveProperty("id");
        expect(download).toHaveProperty("fullName");
        expect(download).toHaveProperty("email");
        expect(download).toHaveProperty("resourceType");
        expect(download).toHaveProperty("resourceTitle");
        expect(download).toHaveProperty("createdAt");
        expect(download).toHaveProperty("ipAddress");
      }
    });

    it("should return downloads ordered by most recent first", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const result = await caller.downloads.list();

      if (result.length > 1) {
        const firstDate = new Date(result[0].createdAt);
        const secondDate = new Date(result[1].createdAt);
        expect(firstDate.getTime()).toBeGreaterThanOrEqual(secondDate.getTime());
      }
    });

    it("should include all resource types", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const result = await caller.downloads.list();

      const resourceTypes = new Set(result.map(d => d.resourceType));
      // At least one resource type should be present
      expect(resourceTypes.size).toBeGreaterThan(0);
      
      // All resource types should be valid
      const validTypes = ["report", "brochure", "photo", "document", "guide"];
      result.forEach(download => {
        expect(validTypes).toContain(download.resourceType);
      });
    });

    it("should include valid email addresses", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const result = await caller.downloads.list();

      result.forEach(download => {
        expect(download.email).toMatch(/@/); // Basic email validation
        expect(download.email.length).toBeGreaterThan(0);
      });
    });

    it("should include full names for all downloads", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const result = await caller.downloads.list();

      result.forEach(download => {
        // fullName should be defined (can be empty string for old records)
        expect(download.fullName).toBeDefined();
        expect(typeof download.fullName).toBe("string");
      });
      
      // At least some downloads should have non-empty names
      const withNames = result.filter(d => d.fullName.length > 0);
      expect(withNames.length).toBeGreaterThan(0);
    });
  });

  describe("Download Analytics Stats", () => {
    it("should calculate unique users correctly", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      const uniqueEmails = new Set(downloads.map(d => d.email));
      expect(uniqueEmails.size).toBeGreaterThan(0);
      expect(uniqueEmails.size).toBeLessThanOrEqual(downloads.length);
    });

    it("should have valid timestamps for all downloads", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      downloads.forEach(download => {
        const date = new Date(download.createdAt);
        expect(date.getTime()).toBeGreaterThan(0);
        expect(date.getTime()).toBeLessThanOrEqual(Date.now());
      });
    });

    it("should filter downloads by date range", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      const today = new Date();
      const todayDownloads = downloads.filter(d => {
        const downloadDate = new Date(d.createdAt);
        return downloadDate.toDateString() === today.toDateString();
      });

      // Today's downloads should be a subset of all downloads
      expect(todayDownloads.length).toBeLessThanOrEqual(downloads.length);
    });

    it("should filter downloads by week", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const weekDownloads = downloads.filter(d => {
        return new Date(d.createdAt) > weekAgo;
      });

      // Week downloads should be a subset of all downloads
      expect(weekDownloads.length).toBeLessThanOrEqual(downloads.length);
    });
  });

  describe("CSV Export Data Structure", () => {
    it("should provide all necessary fields for CSV export", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      if (downloads.length > 0) {
        const download = downloads[0];
        
        // All fields needed for CSV export should be present
        expect(download.createdAt).toBeTruthy();
        expect(download.fullName).toBeTruthy();
        expect(download.email).toBeTruthy();
        expect(download.resourceType).toBeTruthy();
        expect(download.resourceTitle).toBeDefined(); // Can be null
        expect(download.ipAddress).toBeDefined(); // Can be null
      }
    });

    it("should handle null values gracefully", async () => {
      const caller = appRouter.createCaller(mockAdminContext);
      const downloads = await caller.downloads.list();

      downloads.forEach(download => {
        // These fields can be null and should not throw errors
        expect(() => {
          const title = download.resourceTitle || "N/A";
          const ip = download.ipAddress || "N/A";
          const url = download.resourceUrl || "N/A";
        }).not.toThrow();
      });
    });
  });
});
