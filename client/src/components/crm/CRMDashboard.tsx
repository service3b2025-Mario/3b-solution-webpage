/**
 * 3B Solution CRM Dashboard
 * 
 * Executive dashboard with KPIs, funnel visualization,
 * channel performance, and actionable alerts
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Target, 
  AlertTriangle, ArrowRight, BarChart3, PieChart, Activity,
  Calendar, RefreshCw, Download, Filter
} from "lucide-react";

// KPI Card Component
function KPICard({ 
  title, 
  value, 
  change, 
  changeLabel,
  icon: Icon,
  trend 
}: { 
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: any;
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Activity;

  return (
    <Card className="bg-gradient-to-br from-card to-card/80 border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 ${trendColor}`}>
                <TrendIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
                {changeLabel && (
                  <span className="text-xs text-muted-foreground ml-1">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Alert Card Component
function AlertCard({ alert }: { alert: any }) {
  const bgColor = alert.type === 'warning' ? 'bg-amber-500/10 border-amber-500/20' :
                  alert.type === 'error' ? 'bg-red-500/10 border-red-500/20' :
                  'bg-blue-500/10 border-blue-500/20';
  const iconColor = alert.type === 'warning' ? 'text-amber-500' :
                    alert.type === 'error' ? 'text-red-500' :
                    'text-blue-500';

  return (
    <div className={`p-4 rounded-lg border ${bgColor}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className={`w-5 h-5 mt-0.5 ${iconColor}`} />
        <div className="flex-1">
          <h4 className="font-medium">{alert.title}</h4>
          <p className="text-sm text-muted-foreground mt-1">{alert.message}</p>
          {alert.action && (
            <Button variant="link" className="p-0 h-auto mt-2 text-primary">
              {alert.action} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Funnel Visualization Component
function FunnelVisualization({ stages }: { stages: any[] }) {
  const maxCount = Math.max(...stages.map(s => s.count), 1);

  return (
    <div className="space-y-3">
      {stages.map((stage, index) => (
        <div key={stage.name} className="relative">
          <div className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium text-right">
              {stage.displayName}
            </div>
            <div className="flex-1 relative">
              <div 
                className="h-10 rounded-r-lg transition-all duration-500"
                style={{ 
                  width: `${(stage.count / maxCount) * 100}%`,
                  backgroundColor: stage.color || `hsl(${220 - index * 30}, 70%, 50%)`,
                  minWidth: '40px'
                }}
              >
                <div className="absolute inset-0 flex items-center justify-end pr-3">
                  <span className="text-sm font-bold text-white drop-shadow">
                    {stage.count}
                  </span>
                </div>
              </div>
            </div>
            <div className="w-16 text-sm text-muted-foreground">
              {stage.conversionRate}%
            </div>
          </div>
          {index < stages.length - 1 && (
            <div className="ml-24 pl-4 py-1">
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowRight className="w-3 h-3" />
                {stages[index + 1].conversionRate}% conversion
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Channel Performance Chart Component
function ChannelPerformanceChart({ data }: { data: any[] }) {
  const maxLeads = Math.max(...data.map(d => d.leads), 1);

  const channelIcons: Record<string, string> = {
    'Website': '🌐',
    'LinkedIn': '💼',
    'Facebook': '📘',
    'Instagram': '📸',
    'WhatsApp': '💬',
    'Tidio': '🤖',
    'Email': '📧',
    'TikTok': '🎵',
    'Referral': '🤝',
    'Direct': '🎯',
  };

  return (
    <div className="space-y-3">
      {data.slice(0, 8).map((channel) => (
        <div key={channel.channel} className="flex items-center gap-3">
          <div className="w-8 text-center text-lg">
            {channelIcons[channel.channel] || '📊'}
          </div>
          <div className="w-20 text-sm font-medium truncate">
            {channel.channel}
          </div>
          <div className="flex-1">
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                style={{ width: `${(channel.leads / maxLeads) * 100}%` }}
              />
            </div>
          </div>
          <div className="w-12 text-sm font-bold text-right">
            {channel.leads}
          </div>
        </div>
      ))}
    </div>
  );
}

// Lead Sources Pie Chart Component
function LeadSourcesPieChart({ data }: { data: any[] }) {
  const colors = [
    '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  const total = data.reduce((sum, d) => sum + d.count, 0);
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative w-40 h-40">
        <svg viewBox="0 0 100 100" className="transform -rotate-90">
          {data.map((source, index) => {
            const percentage = (source.count / total) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            currentAngle += angle;
            
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={source.source}
                d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={colors[index % colors.length]}
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            );
          })}
          <circle cx="50" cy="50" r="25" fill="hsl(var(--card))" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-2">
        {data.slice(0, 6).map((source, index) => (
          <div key={source.source} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: colors[index % colors.length] }}
            />
            <span className="text-sm flex-1 truncate">{source.source}</span>
            <span className="text-sm font-medium">{source.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main CRM Dashboard Component
export function CRMDashboard() {
  const [period, setPeriod] = useState<string>('30d');

  // Fetch dashboard data
  const { data: kpis, isLoading: kpisLoading } = trpc.analytics.summary.useQuery({});
  const { data: leads } = trpc.leads.list.useQuery({});
  
  // Calculate KPIs from leads data
  const totalLeads = leads?.items?.length || 0;
  const newLeads = leads?.items?.filter((l: any) => l.status === 'new').length || 0;
  const convertedLeads = leads?.items?.filter((l: any) => l.status === 'converted').length || 0;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  // Calculate funnel stages
  const funnelStages = [
    { name: 'new', displayName: 'New', count: leads?.items?.filter((l: any) => l.status === 'new').length || 0, color: '#3B82F6', conversionRate: 100 },
    { name: 'contacted', displayName: 'Contacted', count: leads?.items?.filter((l: any) => l.status === 'contacted').length || 0, color: '#8B5CF6', conversionRate: 65 },
    { name: 'qualified', displayName: 'Qualified', count: leads?.items?.filter((l: any) => l.status === 'qualified').length || 0, color: '#10B981', conversionRate: 45 },
    { name: 'converted', displayName: 'Converted', count: convertedLeads, color: '#F59E0B', conversionRate: 20 },
  ];

  // Calculate channel performance
  const channelData = leads?.items?.reduce((acc: any, lead: any) => {
    const source = lead.source || 'Direct';
    if (!acc[source]) acc[source] = { channel: source, leads: 0 };
    acc[source].leads++;
    return acc;
  }, {});
  const channelPerformance = Object.values(channelData || {}).sort((a: any, b: any) => b.leads - a.leads);

  // Calculate lead sources
  const leadSources = channelPerformance.map((c: any) => ({
    source: c.channel,
    count: c.leads,
    percentage: totalLeads > 0 ? Math.round((c.leads / totalLeads) * 100) : 0,
  }));

  // Sample alerts
  const alerts = [
    ...(newLeads > 5 ? [{
      type: 'warning',
      title: 'Leads Need Follow-up',
      message: `${newLeads} new leads are waiting for initial contact`,
      action: 'View Leads',
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">CRM Dashboard</h1>
          <p className="text-muted-foreground">Overview of your sales and marketing performance</p>
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
          <Button variant="outline" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <AlertCard key={index} alert={alert} />
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Leads"
          value={totalLeads}
          change={12}
          changeLabel="vs last period"
          icon={Users}
          trend="up"
        />
        <KPICard
          title="New Leads"
          value={newLeads}
          change={8}
          changeLabel="vs last period"
          icon={Target}
          trend="up"
        />
        <KPICard
          title="Conversion Rate"
          value={`${conversionRate}%`}
          change={-2}
          changeLabel="vs last period"
          icon={TrendingUp}
          trend="down"
        />
        <KPICard
          title="Pipeline Value"
          value="$2.4M"
          change={15}
          changeLabel="vs last period"
          icon={DollarSign}
          trend="up"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Sales Funnel
            </CardTitle>
            <CardDescription>Lead progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <FunnelVisualization stages={funnelStages} />
          </CardContent>
        </Card>

        {/* Lead Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              Lead Sources
            </CardTitle>
            <CardDescription>Where your leads come from</CardDescription>
          </CardHeader>
          <CardContent>
            {leadSources.length > 0 ? (
              <LeadSourcesPieChart data={leadSources} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No lead source data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Channel Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Channel Performance
            </CardTitle>
            <CardDescription>Leads generated by marketing channel</CardDescription>
          </CardHeader>
          <CardContent>
            {channelPerformance.length > 0 ? (
              <ChannelPerformanceChart data={channelPerformance as any[]} />
            ) : (
              <div className="text-center text-muted-foreground py-8">
                No channel data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default CRMDashboard;
