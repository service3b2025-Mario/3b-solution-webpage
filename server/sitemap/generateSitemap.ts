/**
 * Automated Sitemap Generator
 * 
 * This script generates a dynamic sitemap.xml based on:
 * - Static pages (Home, About, Services, Contact, etc.)
 * - Dynamic property listings from the database
 * - Team member pages
 * 
 * The sitemap is regenerated on each request or can be cached.
 */

import { getDb } from "../db";
import { properties, teamMembers } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// Base URL for the website
const BASE_URL = "https://www.3bsolution.com";

// Static pages with their priorities and change frequencies
const STATIC_PAGES = [
  { path: "/", priority: "1.0", changefreq: "weekly" },
  { path: "/properties", priority: "0.9", changefreq: "daily" },
  { path: "/services", priority: "0.8", changefreq: "monthly" },
  { path: "/about", priority: "0.8", changefreq: "monthly" },
  { path: "/team", priority: "0.7", changefreq: "monthly" },
  { path: "/insights", priority: "0.7", changefreq: "weekly" },
  { path: "/contact", priority: "0.8", changefreq: "monthly" },
  { path: "/stories", priority: "0.6", changefreq: "weekly" },
  { path: "/privacy-policy", priority: "0.3", changefreq: "yearly" },
  { path: "/terms-of-service", priority: "0.3", changefreq: "yearly" },
  { path: "/imprint", priority: "0.3", changefreq: "yearly" },
];

interface SitemapEntry {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

/**
 * Generate XML for a single URL entry
 */
function generateUrlEntry(entry: SitemapEntry ): string {
  return `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`;
}

/**
 * Generate the complete sitemap XML
 */
export async function generateSitemap(): Promise<string> {
  const entries: SitemapEntry[] = [];
  const today = new Date().toISOString().split("T")[0];
  const db = await getDb();

  // Add static pages
  for (const page of STATIC_PAGES) {
    entries.push({
      loc: `${BASE_URL}${page.path}`,
      lastmod: today,
      changefreq: page.changefreq,
      priority: page.priority,
    });
  }

  // Fetch and add dynamic properties
  if (db) {
    try {
      const allProperties = await db
        .select({
          id: properties.id,
          slug: properties.slug,
          updatedAt: properties.updatedAt,
        })
        .from(properties)
        .where(eq(properties.status, "active"));

      for (const property of allProperties) {
        const slug = property.slug || property.id.toString();
        const lastmod = property.updatedAt
          ? new Date(property.updatedAt).toISOString().split("T")[0]
          : today;

        entries.push({
          loc: `${BASE_URL}/properties/${slug}`,
          lastmod,
          changefreq: "weekly",
          priority: "0.8",
        });
      }
    } catch (error) {
      console.error("Error fetching properties for sitemap:", error);
    }

    // Fetch and add team member pages
    try {
      const allTeamMembers = await db
        .select({
          id: teamMembers.id,
          slug: teamMembers.slug,
        })
        .from(teamMembers)
        .where(eq(teamMembers.isActive, true));

      for (const member of allTeamMembers) {
        const slug = member.slug || member.id.toString();

        entries.push({
          loc: `${BASE_URL}/team/${slug}`,
          lastmod: today,
          changefreq: "monthly",
          priority: "0.5",
        });
      }
    } catch (error) {
      console.error("Error fetching team members for sitemap:", error);
    }
  }

  // Generate the XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${entries.map(generateUrlEntry ).join("\n")}
</urlset>`;

  return xml;
}

/**
 * Get cached sitemap or generate a new one
 * Cache expires after 1 hour
 */
let cachedSitemap: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds

export async function getCachedSitemap(): Promise<string> {
  const now = Date.now();

  if (cachedSitemap && now - cacheTimestamp < CACHE_DURATION) {
    return cachedSitemap;
  }

  cachedSitemap = await generateSitemap();
  cacheTimestamp = now;

  return cachedSitemap;
}

/**
 * Invalidate the sitemap cache
 * Call this when properties are added/updated/deleted
 */
export function invalidateSitemapCache(): void {
  cachedSitemap = null;
  cacheTimestamp = 0;
}
