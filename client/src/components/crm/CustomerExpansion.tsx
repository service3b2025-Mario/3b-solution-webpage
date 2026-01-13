/**
 * 3B Solution Customer Expansion Dashboard
 * 
 * Track upsell, cross-sell, and referral opportunities
 * with existing customers
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  TrendingUp, Users, DollarSign, Gift, Heart, Star,
  ArrowUpRight, ArrowRight, Mail, Phone, Calendar,
  AlertTriangle, CheckCircle, Clock, Target
} from "lucide-react";

// Customer Health Score Indicator
function HealthScoreIndicator({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-amber-500' : 'bg-red-500';
  const label = score >= 80 ? 'Healthy' : score >= 50 ? 'At Risk' : 'Critical';

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-sm">{score}</span>
      <span className="text-xs text-muted-foreground">({label})</span>
    </div>
  );
}

// Opportunity Card
function OpportunityCard({ opportunity }: { opportunity: any }) {
  const typeColors: Record<string, string> = {
    'upsell': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'cross_sell': 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    'referral': 'bg-green-500/10 text-green-500 border-green-500/20',
  };

  const typeLabels: Record<string, string> = {
    'upsell': 'Upsell',
    'cross_sell': 'Cross-sell',
    'referral': 'Referral',
  };

  return (
    <Card className="hover:border-primary/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge className={typeColors[opportunity.type]}>
            {typeLabels[opportunity.type]}
          </Badge>
          <span className="text-lg font-bold text-green-500">
            ${opportunity.value.toLocaleString()}
          </span>
        </div>

        <h3 className="font-semibold mb-2">{opportunity.title}</h3>
        
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarFallback className="text-xs">
              {opportunity.customerName.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{opportunity.customerName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{opportunity.daysOpen} days</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">Probability:</span>
            <span className="font-medium">{opportunity.probability}%</span>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button variant="outline" size="sm" className="flex-1">
            <Mail className="w-4 h-4 mr-1" /> Email
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Phone className="w-4 h-4 mr-1" /> Call
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Card for At-Risk Section
function CustomerAtRiskCard({ customer }: { customer: any }) {
  return (
    <Card className="border-red-500/20 bg-red-500/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>
                {customer.name.split(' ').map((n: string) => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold">{customer.name}</h3>
              <p className="text-sm text-muted-foreground">{customer.email}</p>
            </div>
          </div>
          <HealthScoreIndicator score={customer.healthScore} />
        </div>

        <div className="space-y-2 mb-4">
          {customer.riskFactors.map((factor: string, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{factor}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            Schedule Call
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Referral Pipeline
function ReferralPipeline({ referrals }: { referrals: any[] }) {
  const statusColors: Record<string, string> = {
    'pending': 'bg-amber-500',
    'contacted': 'bg-blue-500',
    'qualified': 'bg-purple-500',
    'converted': 'bg-green-500',
  };

  return (
    <div className="space-y-3">
      {referrals.map((referral, index) => (
        <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
          <div className={`w-2 h-2 rounded-full ${statusColors[referral.status]}`} />
          <div className="flex-1">
            <div className="font-medium">{referral.referredName}</div>
            <div className="text-sm text-muted-foreground">
              Referred by {referral.referrerName}
            </div>
          </div>
          <Badge variant="outline">{referral.status}</Badge>
          {referral.potentialValue && (
            <span className="font-bold text-green-500">
              ${referral.potentialValue.toLocaleString()}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

// NPS Score Display
function NPSDisplay({ score, responses }: { score: number; responses: number }) {
  const color = score >= 50 ? 'text-green-500' : score >= 0 ? 'text-amber-500' : 'text-red-500';
  const label = score >= 50 ? 'Excellent' : score >= 0 ? 'Good' : 'Needs Improvement';

  return (
    <div className="text-center">
      <div className={`text-5xl font-bold ${color}`}>{score}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
      <div className="text-xs text-muted-foreground mt-2">
        Based on {responses} responses
      </div>
      
      <div className="flex justify-center gap-4 mt-4">
        <div className="text-center">
          <div className="text-lg font-bold text-green-500">65%</div>
          <div className="text-xs text-muted-foreground">Promoters</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-amber-500">20%</div>
          <div className="text-xs text-muted-foreground">Passives</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-red-500">15%</div>
          <div className="text-xs text-muted-foreground">Detractors</div>
        </div>
      </div>
    </div>
  );
}

// Main Customer Expansion Component
export function CustomerExpansion() {
  const [activeTab, setActiveTab] = useState('opportunities');

  // Sample data - would come from API
  const expansionStats = {
    totalCustomers: 48,
    activeCustomers: 42,
    avgHealthScore: 72,
    totalLTV: 5800000,
    expansionRevenue: 1200000,
    npsScore: 45,
  };

  const opportunities = [
    {
      type: 'upsell',
      title: 'Premium Villa Upgrade',
      customerName: 'John Smith',
      value: 250000,
      probability: 75,
      daysOpen: 12,
    },
    {
      type: 'cross_sell',
      title: 'Commercial Property Investment',
      customerName: 'Sarah Johnson',
      value: 500000,
      probability: 60,
      daysOpen: 8,
    },
    {
      type: 'referral',
      title: 'Partner Introduction',
      customerName: 'Michael Chen',
      value: 150000,
      probability: 40,
      daysOpen: 5,
    },
    {
      type: 'upsell',
      title: 'Additional Land Purchase',
      customerName: 'Emma Wilson',
      value: 180000,
      probability: 85,
      daysOpen: 20,
    },
  ];

  const atRiskCustomers = [
    {
      name: 'Robert Brown',
      email: 'robert@example.com',
      healthScore: 35,
      riskFactors: ['No engagement in 60 days', 'Missed last 2 calls'],
    },
    {
      name: 'Lisa Anderson',
      email: 'lisa@example.com',
      healthScore: 42,
      riskFactors: ['Expressed concerns about ROI', 'Delayed payment'],
    },
  ];

  const referrals = [
    { referredName: 'David Lee', referrerName: 'John Smith', status: 'qualified', potentialValue: 200000 },
    { referredName: 'Anna Martinez', referrerName: 'Sarah Johnson', status: 'contacted', potentialValue: 150000 },
    { referredName: 'James Wilson', referrerName: 'Michael Chen', status: 'pending', potentialValue: null },
    { referredName: 'Emily Davis', referrerName: 'Emma Wilson', status: 'converted', potentialValue: 180000 },
  ];

  const pipelineValue = opportunities.reduce((sum, o) => sum + (o.value * o.probability / 100), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Expansion</h1>
          <p className="text-muted-foreground">Upsell, cross-sell, and referral opportunities</p>
        </div>
        <Button>
          <Target className="w-4 h-4 mr-2" />
          Create Opportunity
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Customers</div>
                <div className="text-2xl font-bold">{expansionStats.activeCustomers}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Expansion Pipeline</div>
                <div className="text-2xl font-bold">${Math.round(pipelineValue).toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Heart className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg. Health Score</div>
                <div className="text-2xl font-bold">{expansionStats.avgHealthScore}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Active Referrals</div>
                <div className="text-2xl font-bold">{referrals.filter(r => r.status !== 'converted').length}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
          <TabsTrigger value="at-risk">At-Risk Customers</TabsTrigger>
          <TabsTrigger value="referrals">Referral Pipeline</TabsTrigger>
          <TabsTrigger value="nps">NPS & Satisfaction</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {opportunities.map((opportunity, index) => (
              <OpportunityCard key={index} opportunity={opportunity} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="at-risk" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {atRiskCustomers.map((customer, index) => (
              <CustomerAtRiskCard key={index} customer={customer} />
            ))}
          </div>
          {atRiskCustomers.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="font-semibold text-lg">All Customers Healthy</h3>
                <p className="text-muted-foreground">No customers are currently at risk</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="referrals" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Referral Pipeline</CardTitle>
              <CardDescription>Track referrals from existing customers</CardDescription>
            </CardHeader>
            <CardContent>
              <ReferralPipeline referrals={referrals} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nps" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Net Promoter Score</CardTitle>
                <CardDescription>Customer satisfaction metric</CardDescription>
              </CardHeader>
              <CardContent>
                <NPSDisplay score={expansionStats.npsScore} responses={38} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-green-500" />
                    <span className="font-medium">Promoter (9)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Excellent service and great investment opportunities. Highly recommend!"
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-amber-500" />
                    <span className="font-medium">Passive (7)</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    "Good experience overall, but communication could be faster."
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default CustomerExpansion;
