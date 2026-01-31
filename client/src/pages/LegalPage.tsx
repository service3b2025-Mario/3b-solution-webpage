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
