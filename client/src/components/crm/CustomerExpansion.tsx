/**
 * 3B Solution Customer Expansion
 * 
 * Customer expansion opportunities, upsell/cross-sell tracking,
 * and referral management - shows empty state when no data
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { 
  TrendingUp, Users, DollarSign, Heart, AlertTriangle,
  ArrowUpRight, Phone, Mail, UserPlus, Target, Star
} from "lucide-react";

// Empty State Component
function EmptyState({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: any; 
  title: string; 
  description: string;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium text-muted-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1">{description}</p>
    </div>
  );
}

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  icon: Icon,
  color = "primary"
}: { 
  title: string;
  value: string | number;
  icon: any;
  color?: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-${color}/10 flex items-center justify-center`}>
            <Icon className={`w-5 h-5 text-${color}`} />
          </div>
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="text-2xl font-bold">{value}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Main Customer Expansion Component
export function CustomerExpansion() {
  const [activeTab, setActiveTab] = useState('opportunities');

  // Fetch leads data to calculate converted customers
  const { data: leads } = trpc.leads.list.useQuery({});
  const leadsArray = leads?.items || [];
  
  // Calculate stats from actual data
  const convertedLeads = leadsArray.filter((l: any) => l.status === 'converted').length;
  
  // All other metrics are 0 since we don't have real expansion tracking yet
  const stats = {
    activeCustomers: convertedLeads,
    expansionPipeline: 0,
    avgHealthScore: 0,
    activeReferrals: 0,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Expansion</h1>
          <p className="text-muted-foreground">Upsell, cross-sell, and referral opportunities</p>
        </div>
        <Button disabled>
          <UserPlus className="w-4 h-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Customers</div>
                <div className="text-2xl font-bold">{stats.activeCustomers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expansion Pipeline</div>
                <div className="text-2xl font-bold">${stats.expansionPipeline.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg. Health Score</div>
                <div className="text-2xl font-bold">{stats.avgHealthScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Referrals</div>
                <div className="text-2xl font-bold">{stats.activeReferrals}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Customers</TabsTrigger>
          <TabsTrigger value="referrals">Referral Pipeline</TabsTrigger>
          <TabsTrigger value="nps">NPS & Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Expansion Opportunities</CardTitle>
              <CardDescription>Upsell and cross-sell opportunities with existing customers</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={Target}
                title="No opportunities yet"
                description="Expansion opportunities will appear here once customer tracking is configured."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="at-risk" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>At-Risk Customers</CardTitle>
              <CardDescription>Customers that may need attention</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={AlertTriangle}
                title="No at-risk customers"
                description="At-risk customer alerts will appear here once health scoring is configured."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Pipeline</CardTitle>
              <CardDescription>Track referrals from existing customers</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={UserPlus}
                title="No referrals yet"
                description="Referrals will appear here once the referral program is set up."
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>NPS & Customer Satisfaction</CardTitle>
              <CardDescription>Net Promoter Score and satisfaction metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <EmptyState 
                icon={Star}
                title="No NPS data"
                description="NPS scores will appear here once customer surveys are configured."
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerExpansion;
