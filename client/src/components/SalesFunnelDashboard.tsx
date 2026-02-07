import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Users, Heart, Bookmark, Eye, MessageSquare, Calendar, TrendingUp, ArrowRight, UserCheck } from "lucide-react";
import { Link } from "wouter";

export function SalesFunnelDashboard() {
  const { data: funnelStats } = trpc.analytics.salesFunnel.useQuery();
  const { data: recentUsers } = trpc.analytics.recentUsers.useQuery({ limit: 10 });
  
  const stages = [
    {
      name: "Visitors",
      count: funnelStats?.totalVisitors || 0,
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      description: "Total unique visitors",
      link: "/admin/analytics",
    },
    {
      name: "Registered Visitors",
      count: funnelStats?.registeredVisitors || funnelStats?.registeredUsers || 0,
      icon: UserCheck,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      description: "Email-verified visitor accounts",
      conversion: funnelStats?.totalVisitors ? 
        (((funnelStats.registeredVisitors || funnelStats.registeredUsers || 0) / funnelStats.totalVisitors) * 100).toFixed(1) : 0,
      link: "/admin/leads",
    },
    {
      name: "Engaged Users",
      count: funnelStats?.engagedUsers || 0,
      icon: Heart,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      description: "Saved properties or searches",
      conversion: (funnelStats?.registeredVisitors || funnelStats?.registeredUsers) ? 
        ((funnelStats.engagedUsers / (funnelStats.registeredVisitors || funnelStats.registeredUsers || 1)) * 100).toFixed(1) : 0,
      link: "/admin/leads?filter=engaged",
    },
    {
      name: "Inquiries",
      count: funnelStats?.inquiries || 0,
      icon: MessageSquare,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      description: "Contact form submissions",
      conversion: funnelStats?.engagedUsers ? 
        ((funnelStats.inquiries / funnelStats.engagedUsers) * 100).toFixed(1) : 0,
      link: "/admin/leads?filter=inquiries",
    },
    {
      name: "Bookings",
      count: funnelStats?.bookings || 0,
      icon: Calendar,
      color: "text-red-600",
      bgColor: "bg-red-50",
      description: "Scheduled consultations",
      conversion: funnelStats?.inquiries ? 
        ((funnelStats.bookings / funnelStats.inquiries) * 100).toFixed(1) : 0,
      link: "/admin/bookings",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Sales Funnel Overview */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sales Funnel Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={stage.name}>
                <Link href={stage.link}>
                  <div className="flex items-center gap-4 cursor-pointer hover:bg-muted/30 p-3 rounded-lg transition-colors">
                  {/* Stage Icon & Info */}
                  <div className={`w-12 h-12 ${stage.bgColor} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <stage.icon className={`w-6 h-6 ${stage.color}`} />
                  </div>
                  
                  {/* Stage Details */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <p className="font-semibold text-foreground">{stage.name}</p>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{stage.count.toLocaleString()}</p>
                        {stage.conversion && (
                          <p className="text-sm text-muted-foreground">{stage.conversion}% conversion</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="w-full bg-muted rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full ${stage.color.replace('text-', 'bg-')}`}
                        style={{ 
                          width: `${stages[0].count > 0 ? (stage.count / stages[0].count * 100) : 0}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
                </Link>
                
                {/* Arrow between stages */}
                {index < stages.length - 1 && (
                  <div className="flex justify-center my-2">
                    <ArrowRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Engagement Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-50 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wishlist Actions</p>
                <p className="text-2xl font-bold">{funnelStats?.wishlistActions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-50 rounded-lg flex items-center justify-center">
                <Bookmark className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Saved Searches</p>
                <p className="text-2xl font-bold">{funnelStats?.savedSearches || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
                <Eye className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Properties Viewed</p>
                <p className="text-2xl font-bold">{funnelStats?.avgPropertiesViewed || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent User Activity */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Recent User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentUsers?.map((user: any) => (
              <Link key={user.id} href={`/admin/leads?user=${user.id}`}>
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name || user.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.wishlistCount} wishlist • {user.savedSearchCount} searches
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
            {(!recentUsers || recentUsers.length === 0) && (
              <p className="text-center text-muted-foreground py-8">No user activity yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
