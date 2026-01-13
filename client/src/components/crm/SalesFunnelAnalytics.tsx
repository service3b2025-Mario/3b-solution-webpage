/**
 * 3B Solution Sales Funnel Analytics
 * 
 * Detailed funnel visualization with conversion rates,
 * bottleneck analysis, and lost deals breakdown
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, TrendingDown, AlertTriangle, ArrowRight, 
  ArrowDown, Clock, Target, XCircle, CheckCircle,
  BarChart3, PieChart, Activity, Filter, Calendar
} from "lucide-react";

// Funnel Stage Card
function FunnelStageCard({ 
  stage, 
  index, 
  totalStages,
  onDrillDown 
}: { 
  stage: any;
  index: number;
  totalStages: number;
  onDrillDown: (stage: string) => void;
}) {
  const isLast = index === totalStages - 1;
  const conversionColor = stage.conversionRate >= 50 ? 'text-green-500' : 
                          stage.conversionRate >= 25 ? 'text-amber-500' : 'text-red-500';

  return (
    <div className="relative">
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onDrillDown(stage.name)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: stage.color }}
              />
              <span className="font-medium">{stage.displayName}</span>
            </div>
            <Badge variant="secondary">{stage.count} leads</Badge>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Conversion Rate</span>
              <span className={`font-bold ${conversionColor}`}>
                {stage.conversionRate}%
              </span>
            </div>
            <Progress value={stage.conversionRate} className="h-2" />
          </div>

          {stage.avgDays && (
            <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Avg. {stage.avgDays} days in stage</span>
            </div>
          )}
        </CardContent>
      </Card>

      {!isLast && (
        <div className="flex justify-center py-2">
          <div className="flex flex-col items-center">
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {stage.dropOff}% drop-off
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Bottleneck Alert Component
function BottleneckAlert({ bottleneck }: { bottleneck: any }) {
  return (
    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-amber-700 dark:text-amber-400">
            Bottleneck: {bottleneck.stage}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            Only {bottleneck.conversionRate}% of leads convert from this stage.
            {bottleneck.recommendation}
          </p>
          <Button variant="link" className="p-0 h-auto mt-2 text-amber-600">
            View recommendations <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// Lost Deals Breakdown Component
function LostDealsBreakdown({ data }: { data: any }) {
  const colors = ['#EF4444', '#F59E0B', '#3B82F6', '#6B7280'];

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-red-500">{data.total}</div>
        <div className="text-sm text-muted-foreground">Lost Deals</div>
      </div>

      <div className="space-y-3">
        {data.reasons.map((reason: any, index: number) => (
          <div key={reason.reason} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span>{reason.reason}</span>
              <span className="font-medium">{reason.count} ({reason.percentage}%)</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-500"
                style={{ 
                  width: `${reason.percentage}%`,
                  backgroundColor: colors[index % colors.length]
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Conversion Trend Chart Component
function ConversionTrendChart({ data }: { data: any[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1);
  const chartHeight = 200;

  return (
    <div className="relative h-[200px]">
      <svg className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((value) => (
          <g key={value}>
            <line
              x1="40"
              y1={chartHeight - (value / 100) * chartHeight}
              x2="100%"
              y2={chartHeight - (value / 100) * chartHeight}
              stroke="hsl(var(--border))"
              strokeDasharray="4"
            />
            <text
              x="35"
              y={chartHeight - (value / 100) * chartHeight + 4}
              className="text-xs fill-muted-foreground"
              textAnchor="end"
            >
              {value}%
            </text>
          </g>
        ))}

        {/* Line chart */}
        <polyline
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          points={data.map((d, i) => {
            const x = 50 + (i / (data.length - 1)) * (100 - 10) + '%';
            const y = chartHeight - (d.value / 100) * chartHeight;
            return `${50 + (i / (data.length - 1)) * 350},${y}`;
          }).join(' ')}
        />

        {/* Data points */}
        {data.map((d, i) => (
          <circle
            key={i}
            cx={50 + (i / (data.length - 1)) * 350}
            cy={chartHeight - (d.value / 100) * chartHeight}
            r="4"
            fill="hsl(var(--primary))"
            className="cursor-pointer hover:r-6 transition-all"
          />
        ))}
      </svg>

      {/* X-axis labels */}
      <div className="flex justify-between px-12 mt-2">
        {data.map((d, i) => (
          <span key={i} className="text-xs text-muted-foreground">
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// Stage Drill-Down Modal Content
function StageDrillDown({ 
  stage, 
  leads,
  onClose 
}: { 
  stage: string;
  leads: any[];
  onClose: () => void;
}) {
  const stageLeads = leads.filter(l => l.status === stage);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold capitalize">{stage} Stage</h3>
        <Badge>{stageLeads.length} leads</Badge>
      </div>

      <div className="max-h-[400px] overflow-auto">
        <table className="w-full">
          <thead className="sticky top-0 bg-background">
            <tr className="border-b">
              <th className="text-left py-2 px-3 text-sm font-medium">Name</th>
              <th className="text-left py-2 px-3 text-sm font-medium">Email</th>
              <th className="text-left py-2 px-3 text-sm font-medium">Source</th>
              <th className="text-left py-2 px-3 text-sm font-medium">Days</th>
              <th className="text-left py-2 px-3 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {stageLeads.map((lead) => (
              <tr key={lead.id} className="border-b hover:bg-muted/50">
                <td className="py-2 px-3 text-sm">
                  {lead.firstName} {lead.lastName}
                </td>
                <td className="py-2 px-3 text-sm text-muted-foreground">
                  {lead.email}
                </td>
                <td className="py-2 px-3 text-sm">
                  <Badge variant="outline">{lead.source || 'Direct'}</Badge>
                </td>
                <td className="py-2 px-3 text-sm">
                  {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))}d
                </td>
                <td className="py-2 px-3">
                  <Button variant="ghost" size="sm">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Main Sales Funnel Analytics Component
export function SalesFunnelAnalytics() {
  const [period, setPeriod] = useState<string>('30d');
  const [selectedStage, setSelectedStage] = useState<string | null>(null);

  // Fetch leads data
  const { data: leads } = trpc.leads.list.useQuery({});
  const leadsArray = leads?.items || [];

  // Calculate funnel stages with metrics
  const funnelStages = [
    { 
      name: 'new', 
      displayName: 'New', 
      count: leadsArray.filter((l: any) => l.status === 'new').length,
      color: '#3B82F6',
      conversionRate: 100,
      avgDays: 2,
      dropOff: 35,
    },
    { 
      name: 'contacted', 
      displayName: 'Contacted', 
      count: leadsArray.filter((l: any) => l.status === 'contacted').length,
      color: '#8B5CF6',
      conversionRate: 65,
      avgDays: 5,
      dropOff: 30,
    },
    { 
      name: 'qualified', 
      displayName: 'Qualified', 
      count: leadsArray.filter((l: any) => l.status === 'qualified').length,
      color: '#10B981',
      conversionRate: 45,
      avgDays: 7,
      dropOff: 55,
    },
    { 
      name: 'converted', 
      displayName: 'Converted', 
      count: leadsArray.filter((l: any) => l.status === 'converted').length,
      color: '#F59E0B',
      conversionRate: 20,
      avgDays: 3,
      dropOff: 0,
    },
  ];

  // Identify bottlenecks
  const bottlenecks = funnelStages
    .filter(s => s.conversionRate < 50 && s.name !== 'new')
    .map(s => ({
      stage: s.displayName,
      conversionRate: s.conversionRate,
      recommendation: ' Consider improving follow-up processes and lead qualification criteria.',
    }));

  // Lost deals data
  const lostDealsData = {
    total: leadsArray.filter((l: any) => l.status === 'lost').length,
    reasons: [
      { reason: 'Price', count: 12, percentage: 35 },
      { reason: 'Timing', count: 9, percentage: 25 },
      { reason: 'Competition', count: 7, percentage: 20 },
      { reason: 'Other', count: 7, percentage: 20 },
    ],
  };

  // Conversion trend data
  const conversionTrend = [
    { label: 'Week 1', value: 18 },
    { label: 'Week 2', value: 22 },
    { label: 'Week 3', value: 19 },
    { label: 'Week 4', value: 25 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Funnel Analytics</h1>
          <p className="text-muted-foreground">Track lead progression and identify optimization opportunities</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <div className="space-y-3">
          {bottlenecks.map((bottleneck, index) => (
            <BottleneckAlert key={index} bottleneck={bottleneck} />
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Visualization */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Funnel Stages
            </CardTitle>
            <CardDescription>Click on a stage to see detailed breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {funnelStages.map((stage, index) => (
                <FunnelStageCard
                  key={stage.name}
                  stage={stage}
                  index={index}
                  totalStages={funnelStages.length}
                  onDrillDown={setSelectedStage}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Lost Deals Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                Lost Deals Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LostDealsBreakdown data={lostDealsData} />
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Sales Cycle</span>
                <span className="font-bold">17 days</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className="font-bold text-green-500">20%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg. Deal Size</span>
                <span className="font-bold">$125,000</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Conversion Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Conversion Rate Trend
          </CardTitle>
          <CardDescription>Overall funnel conversion rate over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ConversionTrendChart data={conversionTrend} />
        </CardContent>
      </Card>

      {/* Stage Drill-Down Modal */}
      {selectedStage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-3xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Stage Details</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setSelectedStage(null)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <StageDrillDown 
                stage={selectedStage} 
                leads={leadsArray}
                onClose={() => setSelectedStage(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default SalesFunnelAnalytics;
