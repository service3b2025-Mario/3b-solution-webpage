
/

Collaborate

Share
I've confirmed the frontend parses JSON content with language keys and uses only the `content` field. Next, I'll remove `contentDe` and `contentZh` from `schema.ts` and `router.ts`.

I confirmed removal of `contentDe` and `contentZh` from schema and router files, leaving only the `content` field that stores multi-language JSON, completing the fix smoothly.

I confirmed the removal of contentDe and contentZh fields from the router, leaving only the JSON content field. This completes the file analysis step for the fix.

Max
I've carefully prepared the complete fix. Here's the summary of what needs to be changed:
Changes Required (2 files, 6 lines to remove)
File 1: drizzle/schema.ts
Lines to DELETE: 382-383
Plain Text
contentDe: text("content_de"),
contentZh: text("content_zh"),
File 2: server/routers.ts
Lines to DELETE in CREATE section (around line 734-735):
Plain Text
      contentDe: z.string().optional(),
contentZh: z.string().optional(),
Lines to DELETE in UPDATE section (around line 746-747):
Plain Text
      contentDe: z.string().optional(),
contentZh: z.string().optional(),
Quick Edit Links
File
Action
Link
schema.ts
Edit line 377-390
Edit on GitHub
routers.ts
Edit line 726-755
Edit on GitHub
Option A: Quick Manual Edit (Recommended)
Open each GitHub link above
Press Ctrl+G to go to the line number
Delete the specified lines
Commit each file
Option B: Full File Replacement
I've attached the complete updated files. You can:
Copy entire content from schema.ts.UPDATED
Paste into GitHub editor (replacing all)
Repeat for routers.ts.UPDATED
The detailed instructions document is also attached.
Max
Here are all the files you need to fix the legal pages error:
Files Attached
COMPLETE_FIX_INSTRUCTIONS.md - Detailed step-by-step guide with before/after code
schema.ts.UPDATED - Complete updated schema file (replace entire file)
routers.ts.UPDATED - Complete updated routers file (replace entire file)
Quick Steps
Step 1: Edit schema.ts
Open: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/drizzle/schema.ts
Select all (Ctrl+A ), delete, paste content from schema.ts.UPDATED
Commit: fix: Remove contentDe/contentZh from schema
Step 2: Edit routers.ts
Open: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/server/routers.ts
Select all (Ctrl+A ), delete, paste content from routers.ts.UPDATED
Commit: fix: Remove contentDe/contentZh from router
Step 3: Wait for Render deployment (2-3 minutes)
Step 4: Test creating a legal page in Admin panel
The frontend files (LegalPage.tsx and ContentManagement.tsx) are already correct and don't need changes.
Complete Fix for Legal Pages Multi-Language Support
Problem Summary
The "Failed to create legal page" error occurred because:
The server-side router (routers.ts) and schema (schema.ts) defined contentDe and contentZh columns
These columns don't exist in the actual database
When the frontend sent data, the database operation failed
Solution
Remove contentDe and contentZh references from server-side files. The frontend already correctly stores all languages as JSON in a single content field.
Files to Update (2 files only)
1. drizzle/schema.ts
GitHub Edit Link: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/drizzle/schema.ts
Change: Remove lines 382-383 (contentDe and contentZh )
Before (lines 377-390):
TypeScript
export const legalPages = mysqlTable("legal_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),
  contentDe: text("content_de"),
  contentZh: text("content_zh"),
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  isActive: boolean("is_active").default(true),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
After:
TypeScript
export const legalPages = mysqlTable("legal_pages", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content"),  // Stores JSON with {en, de, zh} for multi-language support
  metaTitle: varchar("meta_title", { length: 255 }),
  metaDescription: text("meta_description"),
  isActive: boolean("is_active").default(true),
  order: int("order").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
2. server/routers.ts
GitHub Edit Link: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/server/routers.ts
Change: Remove contentDe and contentZh from both create and update validation schemas (lines 734-735 and 746-747 )
Before (lines 730-751):
TypeScript
    create: adminProcedure.input(z.object({
      slug: z.string(),
      title: z.string(),
      content: z.string().optional(),
            contentDe: z.string().optional(),
      contentZh: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      isActive: z.boolean().optional(),
      order: z.number().optional(),
    })).mutation(({ input }) => db.createLegalPage(input)),
    update: adminProcedure.input(z.object({
      id: z.number(),
      slug: z.string().optional(),
      title: z.string().optional(),
      content: z.string().optio
schema.ts.UPDATED
File · 23.31 KB
routers.ts.UPDATED
File · 43.00 KB
View all files in this task
How was this result?
pls give me the complete files for replacements!
Max
I've already attached the complete files in my previous message. Let me re-send them clearly labeled for you:
Workflow Preference: Careful, Single-Pass Change Execution


Removed `contentDe` and `contentZh` fields from schema.ts and routers.ts, completing the fix. Files are updated, ready for deployment and testing.

Max
Here are the complete replacement files:
1. schema.ts
Replace: drizzle/schema.ts
GitHub Link: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/drizzle/schema.ts
2. routers.ts
Replace: server/routers.ts
GitHub Link: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/server/routers.ts
Instructions:
Click the GitHub link
Select all content in the editor (Ctrl+A )
Delete it
Open the attached file, copy all content (Ctrl+A, Ctrl+C)
Paste into GitHub editor (Ctrl+V)
Click "Commit changes"
Repeat for the second file
schema.ts
Code · 23.31 KB
routers.ts
Code · 43.00 KB
View all files in this task
How was this result?
deployed in render now, whats next
Max
Now let's test if the fix works. Please go to the Admin panel and try creating a legal page:
Go to: https://threeb-solution-webpage-staging.onrender.com/admin/content
Click on "Legal Pages" tab
Click "+ Add Legal Page"
Enter:
Title: "Test Page"
Slug: "test-page"
Add some content in the English tab
Click Save
Does it save successfully now without the "Failed to create legal page" error?
Workflow Preference: Careful, Single-Pass Change Execution


yes, shows, english, german and chinese incl. language tabs for terms of service.... rest legal pages still wrongly displayed too, but layout is deviating massively from the main pages, footer is not visible, as well, page is not on full size displayed... pls check...
Max
Good that the save works now! Let me check the frontend display issues you mentioned. I'll look at the LegalPage.tsx to identify the layout problems.
I've replaced the schema and router files, fixing previous issues. Next, I'll review the LegalPage.tsx layout to identify and correct display deviations.

Analyzed the legal page layout, noting missing footer and full-page issues. Next, I will compare the current LegalPage.tsx with the main page layout to identify fixes.

I've reviewed the current LegalPage.tsx structure. To align with the main page, I’ll check layout components, footer inclusion, and full-page styling next.

I confirmed the current LegalPage.tsx lacks layout, header, and footer. Next, I’ll add these components along with breadcrumb navigation for consistency.

The current LegalPage.tsx lacks layout, header, and footer. Next, I’ll incorporate these components and add breadcrumb navigation for consistency with the main page.

The LegalPage.tsx currently imports Layout and Breadcrumb but wraps content without layout, header, or footer. Next, I’ll add these components for consistent styling and full-page layout.

Max
I've identified and fixed the layout issue. The problem was that LegalPage.tsx was missing the Layout wrapper that includes the header and footer.
Changes Made
Added Layout wrapper - Now includes header and footer like other pages
Added Breadcrumb - Shows "Home > Legal > [Page Title]" navigation
Matching hero section - Same gradient style as About, Services, etc.
Language switcher moved to hero - Cleaner integration with page design
Content section styling - Proper container and background matching site theme
File to Update
Replace: client/src/pages/LegalPage.tsx
GitHub Edit Link: https://github.com/service3b2025-Mario/3b-solution-webpage/edit/staging/client/src/pages/LegalPage.tsx
Instructions
Click the GitHub link above
Select all (Ctrl+A ) → Delete
Open the attached LegalPage.tsx → Copy all content
Paste into GitHub editor
Commit with message: fix: Add Layout wrapper to LegalPage for header/footer
After deployment, the legal pages will have:
Full header navigation
Footer with all links
Breadcrumb navigation
Consistent styling with other pages
LegalPage.tsx
Code · 10.03 KB
View all files in this task
Task completed
How was this result?
Suggested follow-ups



LegalPage.tsx
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Breadcrumb } from "@/components/Breadcrumb";

// Detect user's country based on timezone/locale
function detectUserCountry(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone.includes("Europe/Berlin") || timezone.includes("Europe/Vienna") || timezone.includes("Europe/Zurich")) {
      return "DE";
    }
    if (timezone.includes("Asia/Shanghai") || timezone.includes("Asia/Hong_Kong") || timezone.includes("Asia/Taipei")) {
      return "CN";
    }
  } catch (e) {
    // Fallback to navigator language
  }
  
  const lang = navigator.language || "";
  if (lang.startsWith("de")) return "DE";
  if (lang.startsWith("zh")) return "CN";
  return "EN";
}

// Parse content - handles both JSON multi-language format and plain HTML
interface MultiLangContent {
  en?: string;
  de?: string;
  zh?: string;
}

function parseContent(content: string | null | undefined): MultiLangContent {
  if (!content) return { en: "", de: "", zh: "" };
  
  // Try to parse as JSON first
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "object" && (parsed.en || parsed.de || parsed.zh)) {
      return {
        en: parsed.en || "",
        de: parsed.de || "",
        zh: parsed.zh || "",
      };
    }
  } catch (e) {
    // Not JSON, treat as plain HTML (legacy format - English only)
  }
  
  // Fallback: treat entire content as English
  return { en: content, de: "", zh: "" };
}

// Map slug to display title
function getPageTitle(slug: string): string {
  const titles: Record<string, string> = {
    "terms-of-service": "Terms of Service",
    "privacy-policy": "Privacy Policy",
    "cookie-policy": "Cookie Policy",
    "imprint": "Imprint",
  };
  return titles[slug] || slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export default function LegalPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = trpc.legalPages.getBySlug.useQuery(slug || "");
  
  // Language state
  const [selectedLang, setSelectedLang] = useState<"en" | "de" | "zh">("en");
  
  // Set default language based on geo-detection (especially for cookie policy)
  useEffect(() => {
    const country = detectUserCountry();
    if (slug === "cookie-policy") {
      // Cookie policy defaults based on geography
      if (country === "DE") setSelectedLang("de");
      else if (country === "CN") setSelectedLang("zh");
      else setSelectedLang("en");
    } else {
      // Other pages default to English
      setSelectedLang("en");
    }
  }, [slug]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
            <p className="text-gray-600">The legal page you're looking for doesn't exist.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Parse the content (handles both JSON and plain HTML)
  const parsedContent = parseContent(page.content);
  
  // Get content based on selected language
  const getContent = () => {
    if (selectedLang === "de" && parsedContent.de) return parsedContent.de;
    if (selectedLang === "zh" && parsedContent.zh) return parsedContent.zh;
    return parsedContent.en || "";
  };

  const hasGerman = !!parsedContent.de;
  const hasChinese = !!parsedContent.zh;
  const pageTitle = getPageTitle(slug || "");

  return (
    <Layout>
      {/* Hero Section - Matching other pages */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-16">
        <div className="container">
          <Breadcrumb items={[{ label: "Legal" }, { label: pageTitle }]} />
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {page.title || pageTitle}
            </h1>
            <p className="text-white/80">
              Last updated: {page.updatedAt ? new Date(page.updatedAt).toLocaleDateString() : "N/A"}
            </p>
          </div>
          
          {/* Language Switcher */}
          <div className="mt-6 flex items-center gap-2">
            <span className="text-white/80 text-sm mr-2">Language:</span>
            <button
              onClick={() => setSelectedLang("en")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "en"
                  ? "bg-white text-primary"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang("de")}
              disabled={!hasGerman}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "de"
                  ? "bg-white text-primary"
                  : hasGerman
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              Deutsch
            </button>
            <button
              onClick={() => setSelectedLang("zh")}
              disabled={!hasChinese}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "zh"
                  ? "bg-white text-primary"
                  : hasChinese
                  ? "bg-white/20 text-white hover:bg-white/30"
                  : "bg-white/10 text-white/40 cursor-not-allowed"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12 bg-background">
        <div className="container">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto">
            <style>{`
              .legal-content h1 {
                font-size: 2rem;
                font-weight: 700;
                color: #1a3a6e;
                margin-bottom: 1.5rem;
                padding-bottom: 0.75rem;
                border-bottom: 3px solid #f4a261;
              }
              .legal-content h2 {
                font-size: 1.5rem;
                font-weight: 600;
                color: #1a3a6e;
                margin-top: 2rem;
                margin-bottom: 1rem;
                padding-left: 1rem;
                border-left: 4px solid #f4a261;
              }
              .legal-content h3 {
                font-size: 1.25rem;
                font-weight: 600;
                color: #2a5298;
                margin-top: 1.5rem;
                margin-bottom: 0.75rem;
              }
              .legal-content p {
                margin-bottom: 1rem;
                line-height: 1.8;
                color: #333;
              }
              .legal-content ul, .legal-content ol {
                margin-bottom: 1rem;
                padding-left: 2rem;
              }
              .legal-content li {
                margin-bottom: 0.5rem;
                line-height: 1.8;
              }
              .legal-content a {
                color: #f4a261;
                text-decoration: underline;
              }
              .legal-content a:hover {
                color: #e76f51;
              }
              .legal-content .warning {
                background-color: #f8d7da;
                border: 1px solid #dc3545;
                border-left: 4px solid #dc3545;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
                color: #721c24;
              }
              .legal-content .info {
                background-color: #d1ecf1;
                border: 1px solid #17a2b8;
                border-left: 4px solid #17a2b8;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
                color: #0c5460;
              }
              .legal-content .fee-box {
                background-color: #d4edda;
                border: 1px solid #28a745;
                border-left: 4px solid #28a745;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
                color: #155724;
              }
              .legal-content .notice {
                background-color: #fff3cd;
                border: 1px solid #ffc107;
                border-left: 4px solid #ffc107;
                padding: 1rem 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
                color: #856404;
              }
              .legal-content .contact-box {
                background-color: #e9ecef;
                border: 1px solid #6c757d;
                border-left: 4px solid #1a3a6e;
                padding: 1.5rem;
                margin: 1.5rem 0;
                border-radius: 0.5rem;
              }
              .legal-content table {
                width: 100%;
                border-collapse: collapse;
                margin: 1.5rem 0;
              }
              .legal-content th, .legal-content td {
                border: 1px solid #dee2e6;
                padding: 0.75rem;
                text-align: left;
              }
              .legal-content th {
                background-color: #1a3a6e;
                color: white;
              }
              .legal-content tr:nth-child(even) {
                background-color: #f8f9fa;
              }
            `}</style>
            <div 
              className="legal-content"
              dangerouslySetInnerHTML={{ __html: getContent() }} 
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
How to Publish and Maintain a Webpage Without Manus - Manus
