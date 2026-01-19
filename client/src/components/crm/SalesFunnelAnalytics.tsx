/**
 * 3B Solution Sales Funnel Analytics
 * 
 * Detailed funnel analysis with stage breakdown,
 * bottleneck identification, and conversion trends
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
  totalLeads,
  onDrillDown 
}: { 
  stage: any;
  index: number;
  totalStages: number;
  totalLeads: number;
  onDrillDown: (stage: string) => void;
}) {
  const isLast = index === totalStages - 1;
  // Calculate actual conversion rate based on data
  const conversionRate = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0;
  const conversionColor = conversionRate >= 50 ? 'text-green-500' : 
                          conversionRate >= 25 ? 'text-amber-500' : 'text-red-500';

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
              <span className="text-muted-foreground">% of Total</span>
              <span className={`font-bold ${conversionColor}`}>
                {conversionRate}%
              </span>
            </div>
            <Progress value={conversionRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {!isLast && stage.count > 0 && (
        <div className="flex justify-center py-2">
          <div className="flex flex-col items-center">
            <ArrowDown className="w-5 h-5 text-muted-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}

// Lost Deals Breakdown Component
function LostDealsBreakdown({ total }: { total: number }) {
  if (total === 0) {
    return (
      <div className="text-center py-4">
        <div className="text-3xl font-bold text-green-500">0</div>
        <div className="text-sm text-muted-foreground">Lost Deals</div>
        <p className="text-xs text-muted-foreground mt-2">No lost deals recorded</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-3xl font-bold text-red-500">{total}</div>
        <div className="text-sm text-muted-foreground">Lost Deals</div>
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
  
  if (stageLeads.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No leads in this stage
      </div>
    );
  }

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

  // Calculate totals
  const totalLeads = leadsArray.length;
  const lostLeads = leadsArray.filter((l: any) => l.status === 'lost').length;
  const convertedLeads = leadsArray.filter((l: any) => l.status === 'converted').length;
  const winRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Calculate funnel stages with metrics - all values calculated from actual data
  const funnelStages = [
    { 
      name: 'new', 
      displayName: 'New', 
      count: leadsArray.filter((l: any) => l.status === 'new').length,
      color: '#3B82F6',
    },
    { 
      name: 'contacted', 
      displayName: 'Contacted', 
      count: leadsArray.filter((l: any) => l.status === 'contacted').length,
      color: '#8B5CF6',
    },
    { 
      name: 'qualified', 
      displayName: 'Qualified', 
      count: leadsArray.filter((l: any) => l.status === 'qualified').length,
      color: '#10B981',
    },
    { 
      name: 'converted', 
      displayName: 'Converted', 
      count: convertedLeads,
      color: '#F59E0B',
    },
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
            {totalLeads > 0 ? (
              <div className="space-y-2">
                {funnelStages.map((stage, index) => (
                  <FunnelStageCard
                    key={stage.name}
                    stage={stage}
                    index={index}
                    totalStages={funnelStages.length}
                    totalLeads={totalLeads}
                    onDrillDown={setSelectedStage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No leads data available
              </div>
            )}
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
              <LostDealsBreakdown total={lostLeads} />
            </CardContent>
          </Card>

          {/* Quick Stats - calculated from actual data */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Leads</span>
                <span className="font-bold">{totalLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Win Rate</span>
                <span className={`font-bold ${winRate > 0 ? 'text-green-500' : 'text-muted-foreground'}`}>
                  {winRate}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Converted</span>
                <span className="font-bold">{convertedLeads}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Lost</span>
                <span className="font-bold text-red-500">{lostLeads}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
