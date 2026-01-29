import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { Loader2, Download, Calendar, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback, useMemo } from "react";

// Placeholder replacement function - replaces {{PLACEHOLDER}} with actual values
function replacePlaceholders(content: string, placeholders: Record<string, string>): string {
  if (!content) return "";
  
  let result = content;
  
  // Replace all {{PLACEHOLDER_NAME}} patterns
  Object.entries(placeholders).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value || `[${key}]`);
  });
  
  // Highlight any remaining unfilled placeholders
  result = result.replace(
    /\{\{([A-Z_]+)\}\}/g, 
    '<span class="bg-yellow-200 text-yellow-800 px-1 rounded font-semibold">[$1 - TO BE FILLED]</span>'
  );
  
  return result;
}

// Format date for display
function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "Not available";
  const d = new Date(date);
  return d.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export default function LegalPage() {
  const params = useParams<{ slug: string }>();
  const contentRef = useRef<HTMLDivElement>(null);
  
  // Fetch the legal page content
  const { data: page, isLoading, error } = trpc.legalPages.getBySlug.useQuery(params.slug || "");
  
  // Fetch site settings for placeholders (if available)
  // Settings will be added later - for now use empty object
const settings: Record<string, string> | null = null;
  
  // Default placeholders - these can be overridden by admin settings
  const defaultPlaceholders: Record<string, string> = {
      // Default placeholders - hardcoded for now, will be dynamic later
  const defaultPlaceholders: Record<string, string> = {
    // Contact Information
    PHONE: "[PHONE NUMBER]",
    FAX: "[FAX NUMBER - OPTIONAL]",
    EMAIL: "info@3bsolution.de",
    PRIVACY_EMAIL: "privacy@3bsolution.de",
    
    // Business Registration
    GEWERBEAMT_CITY: "[CITY]",
    GEWERBESCHEIN_NUMBER: "[REGISTRATION NUMBER]",
    REGISTRATION_DATE: "[DATE]",
    
    // IHK Information
    IHK_REGION: "[IHK REGION/CITY]",
    IHK_NUMBER: "[IHK MEMBERSHIP NUMBER]",
    
    // Tax Information
    FINANZAMT_CITY: "[CITY]",
    STEUERNUMMER: "[TAX NUMBER]",
    UST_IDNR: "[VAT ID - IF APPLICABLE]",
    
    // Insurance
    INSURANCE_COMPANY: "[INSURANCE COMPANY]",
    POLICY_NUMBER: "[POLICY NUMBER]",
    COVERAGE_AMOUNT: "[COVERAGE AMOUNT]",
    INSURANCE_VALID_UNTIL: "[EXPIRY DATE]",
    
    // Licensing
    LICENSE_34C_DATE: "[LICENSE DATE]",
    LICENSE_34C_VALID_UNTIL: "[EXPIRY DATE]",
    LICENSE_34F_NUMBER: "[REGISTRATION NUMBER]",
    
    // DPO Information
    DPO_NAME: "Mario Bock",
    DPO_PHONE: "+8613701368354",
    
    // Dates (auto-filled )
    CURRENT_DATE: formatDate(new Date()),
    LAST_UPDATED: page?.updatedAt ? formatDate(page.updatedAt) : formatDate(new Date()),
  };

  // PDF Export function using browser print
  const handlePrintPDF = useCallback(() => {
    window.print();
  }, []);
  
  // PDF Export function using html2pdf (if available)
  const handleDownloadPDF = useCallback(async () => {
    if (!contentRef.current || !page) return;
    
    try {
      // Dynamic import of html2pdf
      const html2pdf = (await import('html2pdf.js')).default;
      
      const element = contentRef.current;
      const opt = {
        margin: [15, 15, 15, 15],
        filename: `3B-Solution-${page.slug || 'legal'}-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait' 
        },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };
      
      html2pdf().set(opt).from(element).save();
    } catch (err) {
      // Fallback to browser print if html2pdf fails
      console.warn('html2pdf not available, using browser print');
      window.print();
    }
  }, [page]);

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

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-primary py-16 print:bg-white print:py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h1 className="text-3xl md:text-4xl font-bold text-white print:text-primary">
              {page.title}
            </h1>
            
            {/* PDF Export Buttons - Hidden on print */}
            <div className="flex gap-2 print:hidden">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePrintPDF}
                className="bg-white/10 border-white/30 text-white hover:bg-white/20"
              >
                <Printer className="w-4 h-4 mr-2" />
                Print
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleDownloadPDF}
                className="bg-secondary text-primary hover:bg-secondary/90"
              >
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-background print:py-8">
        <div className="container max-w-4xl">
          {/* Content with placeholder replacement */}
          <div 
            ref={contentRef}
            className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted-foreground prose-strong:text-foreground prose-a:text-secondary hover:prose-a:text-secondary/80 print:prose-sm"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
          
          {/* Last Updated Footer */}
          <div className="mt-12 pt-6 border-t border-border print:mt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                <strong>Last Updated:</strong> {formatDate(page.updatedAt)}
              </span>
            </div>
            {page.metaDescription && (
              <p className="mt-2 text-xs text-muted-foreground/70 print:hidden">
                {page.metaDescription}
              </p>
            )}
          </div>
        </div>
      </section>
      
      {/* Print Styles */}
      <style>{`
        @media print {
          /* Hide non-essential elements */
          header, footer, nav, .print\\:hidden { display: none !important; }
          
          /* Reset backgrounds */
          body, .bg-background, .bg-primary { background: white !important; }
          
          /* Ensure text is black */
          * { color: black !important; }
          
          /* Page breaks */
          h2, h3 { page-break-after: avoid; }
          p, li { page-break-inside: avoid; }
          
          /* Margins */
          @page { margin: 2cm; }
          
          /* Links */
          a[href]:after { content: " (" attr(href) ")"; font-size: 0.8em; }
        }
      `}</style>
    </Layout>
  );
}
