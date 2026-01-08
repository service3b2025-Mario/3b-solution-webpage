import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { Users, Landmark, Briefcase, TrendingUp, ArrowRight } from "lucide-react";

interface InvestorType {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
}

const investorTypes: InvestorType[] = [
  {
    title: "UHNWI",
    description: "Ultra High Net Worth Individuals with $30M+ net worth seeking exclusive opportunities",
    href: "/investors/uhnwi",
    icon: <Users className="w-6 h-6" />,
    color: "primary"
  },
  {
    title: "Institutional",
    description: "Pension funds, insurance companies, and endowments with $50M+ AUM",
    href: "/investors/institutional",
    icon: <Landmark className="w-6 h-6" />,
    color: "secondary"
  },
  {
    title: "Family Offices",
    description: "Multi-generational wealth management for families with $100M+ wealth",
    href: "/investors/family-offices",
    icon: <Briefcase className="w-6 h-6" />,
    color: "accent"
  },
  {
    title: "Individual Investors",
    description: "Building wealth through real estate with $100K+ investment capacity",
    href: "/investors/individual",
    icon: <TrendingUp className="w-6 h-6" />,
    color: "chart-2"
  }
];

interface InvestorTypesLinksProps {
  currentType?: string;
}

export function InvestorTypesLinks({ currentType }: InvestorTypesLinksProps) {
  // Filter out the current type
  const otherTypes = investorTypes.filter(type => 
    !currentType || !type.href.includes(currentType.toLowerCase())
  );

  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Explore Other Investor Types
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover investment solutions tailored to different investor profiles and requirements
          </p>
        </div>

        <div className={`grid grid-cols-1 ${otherTypes.length === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2 lg:grid-cols-4'} gap-6`}>
          {otherTypes.map((type) => (
            <Link key={type.href} href={type.href}>
              <Card className={`h-full border-2 hover:border-${type.color} transition-all cursor-pointer group`}>
                <CardContent className="p-6">
                  <div className={`w-14 h-14 bg-${type.color}/10 rounded-lg flex items-center justify-center mb-4 text-${type.color} group-hover:scale-110 transition-transform`}>
                    {type.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-${type.color} transition-colors">
                    {type.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {type.description}
                  </p>
                  <div className="flex items-center text-sm font-medium text-${type.color}">
                    Learn More
                    <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
