import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";

/**
 * Helper function to format project count display
 * - If count is 0, returns "In Progress"
 * - Otherwise returns the count with a "+" suffix
 */
function formatCount(count: number | undefined): string {
  if (count === undefined || count === 0) {
    return "In Progress";
  }
  return `${count}+`;
}

/**
 * GlobalProjectPortfolio Component
 * 
 * Displays the global project portfolio cards with real counts from the database.
 * Used on both Home and About pages for consistency.
 */
export function GlobalProjectPortfolio() {
  const { data: regionCounts, isLoading } = trpc.properties.countsByRegion.useQuery();

  // Get counts for each region
  const philippinesCount = regionCounts?.['Philippines'] ?? 0;
  const europeCount = regionCounts?.['Europe'] ?? 0;
  const maldivesCount = regionCounts?.['Maldives'] ?? 0;
  const usaCount = regionCounts?.['North America'] ?? regionCounts?.['United States'] ?? 0;
  const caribbeanCount = regionCounts?.['Caribbean'] ?? 0;

  return (
    <section className="py-20 bg-muted/20">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Global Project Portfolio</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Philippines - Main Focus */}
          <Link href="/investments/southeast-asia" className="block">
            <Card className="relative overflow-hidden border-4 border-secondary hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.08] hover:-translate-y-4 hover:border-secondary/50 transition-all duration-300 transform-gpu cursor-pointer h-full">
              <div className="absolute top-3 right-3 bg-secondary text-white text-xs font-bold px-3 py-1 rounded-full">
                MAIN FOCUS
              </div>
              <CardContent className="p-8 text-center bg-primary h-full flex flex-col justify-between">
                <div>
                  <div className={`font-bold text-white mb-2 ${philippinesCount === 0 ? 'text-2xl' : 'text-5xl'}`}>
                    {isLoading ? '...' : formatCount(philippinesCount)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">Philippines</div>
                  <div className="text-sm text-white/80 mt-4 pt-4 border-t border-white/20">
                    <p className="font-semibold">Focus Philippines</p>
                    <p>~50% Hospitality Portfolio</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 border-white text-white hover:bg-white hover:text-primary">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Europe */}
          <Link href="/investments/europe" className="block">
            <Card className="overflow-hidden border-2 border-border hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.08] hover:-translate-y-4 hover:border-secondary/50 transition-all duration-300 transform-gpu cursor-pointer h-full">
              <CardContent className="p-8 text-center h-full flex flex-col justify-between" style={{ backgroundColor: '#2B7A8B' }}>
                <div>
                  <div className={`font-bold text-white mb-2 ${europeCount === 0 ? 'text-2xl' : 'text-5xl'}`}>
                    {isLoading ? '...' : formatCount(europeCount)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">Europe</div>
                  <div className="text-sm text-white/80 mt-4">
                    <p>Hospitality & Mixed Use</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 border-white text-white hover:bg-white hover:text-[#2B7A8B]">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Maldives */}
          <Link href="/investments/maldives" className="block">
            <Card className="overflow-hidden border-2 border-border hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.08] hover:-translate-y-4 hover:border-secondary/50 transition-all duration-300 transform-gpu cursor-pointer h-full">
              <CardContent className="p-8 text-center h-full flex flex-col justify-between" style={{ backgroundColor: '#0FA37F' }}>
                <div>
                  <div className={`font-bold text-white mb-2 ${maldivesCount === 0 ? 'text-2xl' : 'text-5xl'}`}>
                    {isLoading ? '...' : formatCount(maldivesCount)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">Maldives</div>
                  <div className="text-sm text-white/80 mt-4">
                    <p>Luxury Resorts</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 border-white text-white hover:bg-white hover:text-[#0FA37F]">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* USA */}
          <Link href="/investments/usa" className="block">
            <Card className="overflow-hidden border-2 border-border hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.08] hover:-translate-y-4 hover:border-secondary/50 transition-all duration-300 transform-gpu cursor-pointer h-full">
              <CardContent className="p-8 text-center bg-secondary h-full flex flex-col justify-between">
                <div>
                  <div className={`font-bold text-white mb-2 ${usaCount === 0 ? 'text-2xl' : 'text-5xl'}`}>
                    {isLoading ? '...' : formatCount(usaCount)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">USA</div>
                  <div className="text-sm text-white/80 mt-4">
                    <p>Premium Hospitality</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 border-white text-white hover:bg-white hover:text-secondary">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>

          {/* Caribbean */}
          <Link href="/investments/caribbean" className="block">
            <Card className="overflow-hidden border-2 border-border hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] hover:scale-[1.08] hover:-translate-y-4 hover:border-secondary/50 transition-all duration-300 transform-gpu cursor-pointer h-full">
              <CardContent className="p-8 text-center h-full flex flex-col justify-between" style={{ backgroundColor: '#8B4513' }}>
                <div>
                  <div className={`font-bold text-white mb-2 ${caribbeanCount === 0 ? 'text-2xl' : 'text-5xl'}`}>
                    {isLoading ? '...' : formatCount(caribbeanCount)}
                  </div>
                  <div className="text-lg font-semibold text-white mb-2">Caribbean</div>
                  <div className="text-sm text-white/80 mt-4">
                    <p>Island Resorts</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="mt-4 border-white text-white hover:bg-white hover:text-[#8B4513]">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          <span className="font-semibold">Note:</span> Except Philippine projects, we also offer European, Maldives, USA, and Caribbean projects for our discerning clients.
        </p>
      </div>
    </section>
  );
}
