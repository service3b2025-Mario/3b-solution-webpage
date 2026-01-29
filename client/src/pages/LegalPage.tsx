import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

type Language = "en" | "de" | "zh" | "both";

// Detect user's country based on timezone/locale
function detectUserCountry(): string {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const locale = navigator.language || navigator.languages?.[0] || "en";
    
    // Check for Germany
    if (timezone.includes("Berlin") || timezone.includes("Europe/Berlin") || 
        locale.startsWith("de")) {
      return "DE";
    }
    
    // Check for China
    if (timezone.includes("Shanghai") || timezone.includes("Asia/Shanghai") ||
        timezone.includes("Beijing") || timezone.includes("Chongqing") ||
        locale.startsWith("zh")) {
      return "CN";
    }
    
    return "OTHER";
  } catch {
    return "OTHER";
  }
}

// Get default language based on country
function getDefaultLanguage(country: string, slug: string): Language {
  // Cookie policy has special geo-based rules
  if (slug === "cookie-policy") {
    if (country === "DE") return "de";
    if (country === "CN") return "zh";
    return "en";
  }
  
  // Other pages default to English
  return "en";
}

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const { data: page, isLoading, error } = trpc.legalPages.getBySlug.useQuery(params.slug || "");
  
  const [userCountry, setUserCountry] = useState<string>("OTHER");
  const [language, setLanguage] = useState<Language>("en");
  const [initialized, setInitialized] = useState(false);

  // Detect country and set default language on mount
  useEffect(() => {
    const country = detectUserCountry();
    setUserCountry(country);
    
    if (params.slug && !initialized) {
      const defaultLang = getDefaultLanguage(country, params.slug);
      setLanguage(defaultLang);
      setInitialized(true);
    }
  }, [params.slug, initialized]);

  // Get content based on selected language
  const getContent = () => {
    if (!page) return "";
    
    switch (language) {
      case "de":
        return page.contentDe || page.content || "";
      case "zh":
        return page.contentZh || page.content || "";
      case "both":
        // Show English first, then German
        const enContent = page.content || "";
        const deContent = page.contentDe || "";
        if (enContent && deContent) {
          return `
            <div class="language-section">
              <h2 class="language-header">🇬🇧 English Version</h2>
              ${enContent}
            </div>
            <hr class="language-divider" />
            <div class="language-section">
              <h2 class="language-header">🇩🇪 Deutsche Version</h2>
              ${deContent}
            </div>
          `;
        }
        return enContent || deContent;
      default:
        return page.content || "";
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-secondary" />
        </div>
      </Layout>
    );
  }

  if (error || !page) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Page Not Found</h1>
            <p className="text-muted-foreground">The requested page could not be found.</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Check if page has multiple languages
  const hasGerman = !!page.contentDe;
  const hasChinese = !!page.contentZh;
  const hasMultipleLanguages = hasGerman || hasChinese;

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-16">
        <div className="container">
          <h1 className="text-3xl md:text-4xl font-bold text-white">{page.title}</h1>
        </div>
      </section>

      {/* Content Section with Legal Page Styles */}
      <section className="py-16 bg-background">
        <div className="container">
          {/* Language Switcher */}
          {hasMultipleLanguages && (
            <div className="flex items-center justify-center gap-4 mb-8 pb-6 border-b">
              <span className="text-sm text-muted-foreground font-medium">
                Language / Sprache:
              </span>
              <div className="flex gap-2">
                <Button
                  variant={language === "en" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLanguage("en")}
                  className={language === "en" ? "bg-secondary hover:bg-secondary/90" : ""}
                >
                  English
                </Button>
                {hasGerman && (
                  <Button
                    variant={language === "de" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("de")}
                    className={language === "de" ? "bg-primary hover:bg-primary/90" : ""}
                  >
                    Deutsch
                  </Button>
                )}
                {hasChinese && (
                  <Button
                    variant={language === "zh" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("zh")}
                    className={language === "zh" ? "bg-red-600 hover:bg-red-700" : ""}
                  >
                    中文
                  </Button>
                )}
                {hasGerman && (
                  <Button
                    variant={language === "both" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage("both")}
                    className={language === "both" ? "bg-gray-700 hover:bg-gray-800" : ""}
                  >
                    Both / Beide
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Custom styles for legal page content */}
          <style dangerouslySetInnerHTML={{ __html: `
            .legal-content {
              font-family: inherit;
              line-height: 1.8;
              color: inherit;
            }
            .legal-content h1 {
              color: #1a3a6e;
              border-bottom: 3px solid #f4a261;
              padding-bottom: 10px;
              margin-top: 0;
            }
            .legal-content h2 {
              color: #1a3a6e;
              margin-top: 2rem;
              border-left: 4px solid #f4a261;
              padding-left: 15px;
              font-size: 1.5rem;
            }
            .legal-content h3 {
              color: #2a5298;
              margin-top: 1.5rem;
              font-size: 1.25rem;
            }
            .legal-content h4 {
              margin-top: 0;
              margin-bottom: 0.5rem;
            }
            .legal-content .warning {
              background: #f8d7da;
              color: #721c24;
              padding: 15px;
              border-left: 4px solid #dc3545;
              margin: 15px 0;
              border-radius: 4px;
            }
            .legal-content .info {
              background: #d1ecf1;
              color: #0c5460;
              padding: 15px;
              border-left: 4px solid #17a2b8;
              margin: 15px 0;
              border-radius: 4px;
            }
            .legal-content .fee-box {
              background: #d4edda;
              color: #155724;
              padding: 15px;
              border-left: 4px solid #28a745;
              margin: 15px 0;
              border-radius: 4px;
            }
            .legal-content .notice {
              background: #fff3cd;
              color: #856404;
              padding: 15px;
              border-left: 4px solid #ffc107;
              margin: 15px 0;
              border-radius: 4px;
            }
            .legal-content .placeholder {
              background: #fff3cd;
              padding: 2px 5px;
              border-radius: 3px;
              color: #856404;
              font-weight: bold;
            }
            .legal-content .contact-box {
              background: #e9ecef;
              padding: 15px;
              border-radius: 4px;
              margin: 15px 0;
            }
            .legal-content ul {
              line-height: 2;
              margin: 1rem 0;
              padding-left: 1.5rem;
            }
            .legal-content li {
              margin-bottom: 0.5rem;
            }
            .legal-content p {
              margin-bottom: 1rem;
            }
            .legal-content a {
              color: #f4a261;
              text-decoration: underline;
            }
            .legal-content a:hover {
              color: #e76f51;
            }
            .legal-content strong {
              color: inherit;
            }
            .legal-content .footer-note {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ccc;
              font-size: 0.9em;
              color: #666;
            }
            .legal-content .language-header {
              background: #f8f9fa;
              padding: 10px 15px;
              border-radius: 4px;
              margin-bottom: 20px;
              font-size: 1.2rem;
            }
            .legal-content .language-divider {
              margin: 40px 0;
              border: none;
              border-top: 3px solid #f4a261;
            }
            .legal-content .language-section {
              margin-bottom: 20px;
            }
          `}} />
          <div 
            className="legal-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: getContent() }}
          />
        </div>
      </section>
    </Layout>
  );
}
