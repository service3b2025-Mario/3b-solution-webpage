import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

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
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page Not Found</h1>
          <p className="text-gray-600">The legal page you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  // Get content based on selected language
  const getContent = () => {
    if (selectedLang === "de" && page.contentDe) return page.contentDe;
    if (selectedLang === "zh" && page.contentZh) return page.contentZh;
    return page.content || "";
  };

  // Check if translations are available
  const hasGerman = !!page.contentDe;
  const hasChinese = !!page.contentZh;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">{page.title}</h1>
          {page.updatedAt && (
            <p className="mt-2 text-white/80">
              Last updated: {new Date(page.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>

      {/* Language Switcher */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Language:</span>
            <button
              onClick={() => setSelectedLang("en")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "en"
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setSelectedLang("de")}
              disabled={!hasGerman}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "de"
                  ? "bg-primary text-white"
                  : hasGerman
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              Deutsch
            </button>
            <button
              onClick={() => setSelectedLang("zh")}
              disabled={!hasChinese}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedLang === "zh"
                  ? "bg-primary text-white"
                  : hasChinese
                  ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  : "bg-gray-50 text-gray-400 cursor-not-allowed"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
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
    </div>
  );
}
