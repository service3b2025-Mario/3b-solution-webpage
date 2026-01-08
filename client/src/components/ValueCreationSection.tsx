import { Card, CardContent } from "@/components/ui/card";
import { MapPin, FileCheck, Hammer, TrendingUp, RefreshCw, Target, Building, Shield, Leaf, Eye } from "lucide-react";
import { useState } from "react";

const steps = [
  {
    id: 1,
    icon: MapPin,
    title: "SOURCE",
    subtitle: "Identifying the Right Opportunities",
    description: "We begin with disciplined opportunity sourcing in markets where fundamentals drive performance.",
    points: [
      "Focus on hospitality, branded residences, mixed-use and island assets",
      "Markets selected based on tourism demand, supply dynamics, and capital flows",
      "Preference for off-market and complexity-driven situations",
      "Local intelligence combined with global perspective"
    ],
    tagline: "We invest in markets with structural demand, not short-term hype."
  },
  {
    id: 2,
    icon: FileCheck,
    title: "ACQUIRE",
    subtitle: "Disciplined Entry & Structuring",
    description: "Every opportunity is subjected to conservative underwriting and structured for downside protection.",
    points: [
      "Multiple scenario and sensitivity analyses",
      "Conservative assumptions on revenue, cost, and exit",
      "Legal, tax, and jurisdictional structuring with local experts",
      "Entry pricing aligned with risk, not optimism"
    ],
    tagline: "Capital is committed only when risk is clearly understood."
  },
  {
    id: 3,
    icon: Hammer,
    title: "OPTIMIZE",
    subtitle: "Active Value Creation",
    description: "Value is created through active involvement — not passive ownership.",
    points: [
      "Asset repositioning and brand strategy",
      "Design, product, and guest experience enhancement",
      "Cost efficiency and operational optimization",
      "ESG, sustainability, and long-term asset resilience integration"
    ],
    tagline: "Returns are created through execution, not market timing."
  },
  {
    id: 4,
    icon: TrendingUp,
    title: "OPERATE",
    subtitle: "Performance-Driven Management",
    description: "Operational performance is continuously monitored and optimized.",
    points: [
      "Operator selection and benchmarking",
      "Revenue management and pricing strategy",
      "Cost control and margin improvement",
      "Transparent reporting and performance tracking"
    ],
    tagline: "Operational discipline turns assets into durable income generators."
  },
  {
    id: 5,
    icon: RefreshCw,
    title: "EXIT",
    subtitle: "Strategic Capital Realization",
    description: "Exit strategy is defined before acquisition — not after.",
    points: [
      "Multiple exit pathways evaluated from day one",
      "Timing aligned with market cycles and asset maturity",
      "Sale to institutional buyers, strategic operators, or long-term holders",
      "Focus on liquidity, not forced exits"
    ],
    tagline: "We exit when value is realized — not when pressure dictates."
  }
];

const drivers = [
  { icon: Target, title: "Market Fundamentals", description: "Data-driven market selection" },
  { icon: Building, title: "Asset Repositioning", description: "Strategic value enhancement" },
  { icon: TrendingUp, title: "Operational Excellence", description: "Performance optimization" },
  { icon: Shield, title: "Risk Management", description: "Downside protection first" },
  { icon: Leaf, title: "Sustainability & ESG", description: "Long-term resilience" },
  { icon: Eye, title: "Transparency & Governance", description: "Clear reporting standards" }
];

export function ValueCreationSection() {
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  return (
    <section className="py-20 bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            How We Create Value in Real Estate
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            A disciplined framework built for long-term, risk-adjusted performance
          </p>
          <p className="text-lg text-muted-foreground mt-4 max-w-4xl mx-auto">
            At 3B Solution, value creation is not accidental. It is the result of a structured, data-driven approach that combines careful market selection, active asset management, and institutional risk discipline. Our focus is on <span className="font-semibold text-foreground">protecting capital first</span> — and growing it through execution, not speculation.
          </p>
        </div>

        {/* Process Flow */}
        <div className="mb-16">
          <div className="flex items-center justify-center mb-8 overflow-x-auto pb-4">
            <div className="flex items-center gap-2 md:gap-4 min-w-max px-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:scale-105 ${
                      expandedStep === step.id 
                        ? 'bg-primary text-primary-foreground shadow-lg' 
                        : 'bg-card hover:bg-accent'
                    }`}
                  >
                    <step.icon className="w-8 h-8" />
                    <span className="font-bold text-sm whitespace-nowrap">{step.title}</span>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-8 md:w-16 h-0.5 bg-border mx-2" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Expanded Step Details */}
          {expandedStep !== null && (
            <Card className="border-2 border-primary/20 shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
              <CardContent className="p-8">
                {steps.map((step) => {
                  if (step.id !== expandedStep) return null;
                  const Icon = step.icon;
                  return (
                    <div key={step.id}>
                      <div className="flex items-start gap-4 mb-6">
                        <div className="p-3 bg-primary/10 rounded-lg">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground mb-1">{step.title}</h3>
                          <p className="text-lg text-muted-foreground mb-3">{step.subtitle}</p>
                          <p className="text-foreground font-medium">{step.description}</p>
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-6 ml-4">
                        {step.points.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                            <span className="text-primary mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="bg-accent/50 rounded-lg p-4 border-l-4 border-primary">
                        <p className="text-foreground font-semibold italic">{step.tagline}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Value Creation Drivers */}
        <div className="mt-20">
          <h3 className="text-3xl font-bold text-center text-foreground mb-12">
            Value Creation Drivers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((driver, index) => {
              const Icon = driver.icon;
              return (
                <Card 
                  key={index} 
                  className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
                >
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h4 className="font-bold text-lg text-foreground mb-2">{driver.title}</h4>
                    <p className="text-sm text-muted-foreground">{driver.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
