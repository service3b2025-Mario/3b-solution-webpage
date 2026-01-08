import { trpc } from "@/lib/trpc";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export function RealPropertyNameWidget() {
  const { data: stats, isLoading } = trpc.properties.realPropertyNameStats.useQuery();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Building2 className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Real Property Name Status</h3>
        </div>
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </Card>
    );
  }

  if (!stats) {
    return null;
  }

  const filledPercentage = stats.total > 0 ? Math.round((stats.filled / stats.total) * 100) : 0;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Real Property Name Status</h3>
      </div>

      {/* Statistics Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-muted/30 rounded-lg">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground mt-1">Total Properties</div>
        </div>
        <div className="text-center p-3 bg-green-500/10 rounded-lg">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.filled}</div>
          <div className="text-xs text-muted-foreground mt-1">Filled ({filledPercentage}%)</div>
        </div>
        <div className="text-center p-3 bg-orange-500/10 rounded-lg">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.empty}</div>
          <div className="text-xs text-muted-foreground mt-1">Empty</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>Completion Progress</span>
          <span>{filledPercentage}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
            style={{ width: `${filledPercentage}%` }}
          />
        </div>
      </div>

      {/* Properties Missing Real Name */}
      {stats.emptyProperties.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <h4 className="text-sm font-medium">Properties Missing Real Name</h4>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {stats.emptyProperties.map((property: { id: number; title: string; slug: string }) => (
              <div 
                key={property.id}
                className="flex items-center justify-between p-2 bg-muted/30 rounded hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{property.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{property.slug}</div>
                </div>
                <Link href={`/admin/properties`}>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    className="ml-2 h-7 px-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Complete Message */}
      {stats.emptyProperties.length === 0 && stats.total > 0 && (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
          <div className="text-sm text-green-600 dark:text-green-400 font-medium">
            All properties have real names assigned!
          </div>
        </div>
      )}
    </Card>
  );
}
