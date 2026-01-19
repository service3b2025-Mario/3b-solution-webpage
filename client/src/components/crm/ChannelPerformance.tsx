/**
 * 3B Solution Channel Performance
 * 
 * Marketing channel analysis with performance metrics,
 * comparison charts, and attribution tracking
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  Globe, Linkedin, Facebook, Instagram, MessageSquare, Mail,
  TrendingUp, TrendingDown, DollarSign, Users, Target,
  BarChart3, ArrowUpRight, ArrowDownRight, Filter
} from "lucide-react";

// Channel Icons Map
const channelIcons: Record<string, any> = {
  'Website': Globe,
  'LinkedIn': Linkedin,
  'Facebook': Facebook,
  'Instagram': Instagram,
  'WhatsApp': MessageSquare,
  'Tidio': MessageSquare,
  'Email': Mail,
  'TikTok': Globe,
  'Referral': Users,
  'Direct': Target,
};

const channelColors: Record<string, string> = {
  'Website': '#3B82F6',
  'LinkedIn': '#0A66C2',
  'Facebook': '#1877F2',
  'Instagram': '#E4405F',
  'WhatsApp': '#25D366',
  'Tidio': '#1ABC9C',
  'Email': '#EA4335',
  'TikTok': '#000000',
  'Referral': '#10B981',
  'Direct': '#6B7280',
};

// Channel Performance Card
function ChannelCard({ channel }: { channel: any }) {
  const Icon = channelIcons[channel.name] || Globe;
  const color = channelColors[channel.name] || '#6B7280';

  return (
    <Card className="hover:border-primary/50 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div 
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
        </div>
        <h3 className="font-semibold mb-3">{channel.name}</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-muted-foreground">Leads</div>
            <div className="font-bold text-lg">{channel.leads}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Conv. Rate</div>
            <div className="font-bold text-lg">{channel.conversionRate}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Channel Comparison Bar Chart
function ChannelComparisonChart({ 
  data, 
  metric 
}: { 
  data: any[];
  metric: 'leads' | 'conversions';
}) {
  const getValue = (channel: any) => {
    switch (metric) {
      case 'leads': return channel.leads;
      case 'conversions': return channel.conversions;
      default: return channel.leads;
    }
  };

  const maxValue = Math.max(...data.map(d => Math.abs(getValue(d))), 1);
  const sortedData = [...data].sort((a, b) => getValue(b) - getValue(a));

  if (sortedData.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No channel data available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sortedData.map((channel) => {
        const value = getValue(channel);
        const Icon = channelIcons[channel.name] || Globe;
        const color = channelColors[channel.name] || '#6B7280';

        return (
          <div key={channel.name} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${color}20` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <div className="w-24 text-sm font-medium truncate">{channel.name}</div>
            <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
              <div 
                className="h-full rounded-lg transition-all duration-500"
                style={{ 
                  width: `${(Math.abs(value) / maxValue) * 100}%`,
                  backgroundColor: color,
                }}
              />
              <span className="absolute inset-0 flex items-center justify-end pr-3 text-sm font-bold">
                {value}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Attribution Flow Diagram
function AttributionFlow({ data }: { data: any[] }) {
  const stages = ['Awareness', 'Interest', 'Consideration', 'Conversion'];
  
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No attribution data available
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Stage Headers */}
        <div className="flex justify-between mb-4 px-4">
          {stages.map((stage) => (
            <div key={stage} className="text-center">
              <Badge variant="outline">{stage}</Badge>
            </div>
          ))}
        </div>

        {/* Flow Lines */}
        <div className="space-y-2">
          {data.slice(0, 5).map((channel, index) => {
            const color = channelColors[channel.name] || '#6B7280';
            const heights = [100, 70, 40, channel.conversionRate];
            
            return (
              <div key={channel.name} className="flex items-center gap-2">
                <div className="w-20 text-sm font-medium truncate">{channel.name}</div>
                <div className="flex-1 flex items-center">
                  {heights.map((height, i) => (
                    <div key={i} className="flex-1 flex items-center">
                      <div 
                        className="w-full h-1 rounded"
                        style={{ 
                          backgroundColor: color,
                          opacity: height / 100,
                        }}
                      />
                      {i < heights.length - 1 && (
                        <div 
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: color }}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <div className="w-12 text-sm font-bold text-right">
                  {channel.conversions}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Main Channel Performance Component
export function ChannelPerformance() {
  const [period, setPeriod] = useState<string>('30d');
  const [comparisonMetric, setComparisonMetric] = useState<'leads' | 'conversions'>('leads');

  // Fetch leads data
  const { data: leads } = trpc.leads.list.useQuery({});
  const leadsArray = leads?.items || [];

  // Calculate channel data from leads - all values calculated from actual data
  const channelData = leadsArray.reduce((acc: any, lead: any) => {
    const source = lead.source || 'Direct';
    if (!acc[source]) {
      acc[source] = { 
        name: source, 
        leads: 0, 
        conversions: 0,
        conversionRate: 0,
      };
    }
    acc[source].leads++;
    if (lead.status === 'converted') {
      acc[source].conversions++;
    }
    return acc;
  }, {});

  // Calculate conversion rates
  Object.values(channelData).forEach((channel: any) => {
    channel.conversionRate = channel.leads > 0 
      ? Math.round((channel.conversions / channel.leads) * 100) 
      : 0;
  });

  const channels = Object.values(channelData).sort((a: any, b: any) => b.leads - a.leads);

  // Summary stats - calculated from actual data
  const totalLeads = channels.reduce((sum: number, c: any) => sum + c.leads, 0);
  const totalConversions = channels.reduce((sum: number, c: any) => sum + c.conversions, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Channel Performance</h1>
          <p className="text-muted-foreground">Analyze marketing channel effectiveness and ROI</p>
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

      {/* Summary Stats - calculated from actual data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Leads</div>
            <div className="text-2xl font-bold">{totalLeads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Conversions</div>
            <div className="text-2xl font-bold">{totalConversions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total Spend</div>
            <div className="text-2xl font-bold">$0</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Avg. CPL</div>
            <div className="text-2xl font-bold">$0</div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Cards */}
      {channels.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {(channels as any[]).slice(0, 5).map((channel) => (
            <ChannelCard key={channel.name} channel={channel} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No channel data available. Leads will appear here once they are added.
          </CardContent>
        </Card>
      )}

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Channel Comparison */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Channel Comparison</CardTitle>
              <Select value={comparisonMetric} onValueChange={(v: any) => setComparisonMetric(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leads">Leads</SelectItem>
                  <SelectItem value="conversions">Conversions</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <ChannelComparisonChart data={channels as any[]} metric={comparisonMetric} />
          </CardContent>
        </Card>

        {/* Attribution Flow */}
        <Card>
          <CardHeader>
            <CardTitle>Channel Attribution</CardTitle>
            <CardDescription>How channels contribute to conversions</CardDescription>
          </CardHeader>
          <CardContent>
            <AttributionFlow data={channels as any[]} />
          </CardContent>
        </Card>
      </div>

      {/* Top Campaigns - Show empty state instead of hardcoded data */}
      <Card>
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
          <CardDescription>Best performing marketing campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No campaign data available. Campaign tracking is not yet configured.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ChannelPerformance;
