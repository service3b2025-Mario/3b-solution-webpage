import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { FileText, Download, TrendingUp, Globe, BarChart3, Bell, MapPin, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import DownloadGateModal from "@/components/DownloadGateModal";
import { Breadcrumb } from "@/components/Breadcrumb";

function ReportSchema({ report }: { report: any }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Report",
    "name": report.title,
    "description": report.description,
    "url": `https://www.3bsolution.com/market-insights#report-${report.id}`,
    "datePublished": report.publishedAt || report.createdAt,
    "author": {
      "@type": "Organization",
      "name": "3B Solution",
      "url": "https://www.3bsolution.com"
    },
    "publisher": {
      "@type": "Organization",
      "name": "3B Solution",
      "logo": {
        "@type": "ImageObject",
        "url": "https://cdn.3bsolution.com/assets/3b-logo.webp"
      }
    },
    "about": {
      "@type": "Thing",
      "name": report.region || "Real Estate Investment"
    },
    "keywords": `${report.region || ""} real estate investment, ${report.category?.replace("_", " ") || "market report"}`,
    "inLanguage": "en"
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export default function MarketInsights() {
  const { data: reports } = trpc.marketReports.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertRegions, setAlertRegions] = useState<string[]>([]);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ id: number; title: string; fileUrl: string } | null>(null);

  const createAlert = trpc.alerts.subscribe.useMutation();

  const filteredReports = (reports || []).filter(report => {
    if (selectedCategory !== "all" && report.category !== selectedCategory) return false;
    if (selectedRegion !== "all" && report.region !== selectedRegion) return false;
    return true;
  });

  const handleDownloadClick = (report: { id: number; title: string; fileUrl?: string | null }) => {
    if (!report.fileUrl) {
      toast.error("Report file not available");
      return;
    }
    setSelectedReport({ id: report.id, title: report.title, fileUrl: report.fileUrl });
    setDownloadModalOpen(true);
  };

  const handleAlertSubscribe = async () => {
    if (!alertEmail) {
      toast.error("Please enter your email");
      return;
    }
    
    try {
      await createAlert.mutateAsync({
        email: alertEmail,
        regions: alertRegions,
        frequency: "weekly",
      });
      toast.success("Successfully subscribed to market alerts!");
      setAlertEmail("");
      setAlertRegions([]);
    } catch (error) {
      toast.error("Failed to subscribe. Please try again.");
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/90 py-20">
        <div className="container">
          <Breadcrumb items={[{ label: "Insights" }]} />
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Market Insights
            </h1>
            <p className="text-xl text-white/80">
              Expert analysis and reports on global real estate opportunities
            </p>
          </div>
        </div>
      </section>

      {/* Market Overview */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {[
              { icon: TrendingUp, title: "Market Performance", value: "+18.5%", desc: "Average portfolio return YTD" },
              { icon: Globe, title: "Active Markets", value: "12", desc: "Countries with active investments" },
              { icon: BarChart3, title: "Deal Pipeline", value: "$750M+", desc: "Projects under evaluation" },
            ].map((item, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-secondary/10 rounded-xl flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.title}</p>
                      <p className="text-3xl font-bold text-foreground">{item.value}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="market_analysis">Market Analysis</SelectItem>
                <SelectItem value="investment_guide">Property Market Guide</SelectItem>
                <SelectItem value="sector_report">Sector Report</SelectItem>
                <SelectItem value="regional_outlook">Regional Outlook</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                <SelectItem value="SouthEastAsia">South East Asia</SelectItem>
                <SelectItem value="Maldives">Maldives</SelectItem>
                <SelectItem value="Europe">Europe</SelectItem>
                <SelectItem value="NorthAmerica">North America</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredReports.map((report) => (
              <Card key={report.id} id={`report-${report.id}`} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                <ReportSchema report={report} />
                <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative overflow-hidden">
                  {report.thumbnailUrl ? (
                    <img 
                      src={report.thumbnailUrl} 
                      alt={report.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-16 h-16 text-primary/30" />
                  )}
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <span className="px-2 py-0.5 bg-secondary/10 text-secondary rounded text-xs">
                      {report.category?.replace("_", " ")}
                    </span>
                    {report.region && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {report.region}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{report.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{report.description}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <span className="text-xs text-muted-foreground">
                      {report.createdAt ? 
                        new Date(report.createdAt).toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' }).replace('/', '/') 
                        : "Recent"}
                    </span>
                    <Button 
                      size="sm" 
                      className="bg-secondary hover:bg-secondary/90 text-white"
                      onClick={() => handleDownloadClick(report)}
                      disabled={!report.fileUrl}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {report.fileUrl ? 'Download' : 'Not Available'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Market Alerts Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="max-w-3xl mx-auto">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary/90 p-8 text-primary-foreground">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                    <Bell className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">Personalized Market Alerts</h3>
                    <p className="text-primary-foreground/80">Stay ahead with customized investment insights</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Email Address</label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Regions of Interest</label>
                    <div className="grid grid-cols-2 gap-3">
                      {["SouthEastAsia", "Maldives", "Europe", "NorthAmerica", "Caribbean"].map((region) => (
                        <label key={region} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={alertRegions.includes(region)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setAlertRegions([...alertRegions, region]);
                              } else {
                                setAlertRegions(alertRegions.filter(r => r !== region));
                              }
                            }}
                            className="w-4 h-4 rounded border-border"
                          />
                          <span className="text-sm">{region.replace(/([A-Z])/g, ' $1').trim()}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-secondary hover:bg-secondary/90 text-white h-12"
                    onClick={handleAlertSubscribe}
                  >
                    Subscribe to Market Alerts
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Receive market updates and exclusive property opportunities. Unsubscribe anytime.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-background">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Want Personalized Investment Advice?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our experts can provide tailored recommendations based on your investment goals and risk profile.
          </p>
          <Link href="/contact">
            <Button size="lg" className="bg-secondary hover:bg-secondary/90 text-white font-medium px-8">
              Schedule Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Download Gate Modal */}
      {selectedReport && (
        <DownloadGateModal
          open={downloadModalOpen}
          onOpenChange={setDownloadModalOpen}
          resourceType="report"
          resourceId={selectedReport.id}
          resourceTitle={selectedReport.title}
          resourceUrl={selectedReport.fileUrl}
        />
      )}
    </Layout>
  );
}
