import { lazy, Suspense } from 'react';
import { Card, CardContent } from '@/components/ui/card';

const InvestmentCalculator = lazy(() => import('./InvestmentCalculator'));

export default function InvestmentCalculatorLazy() {
  return (
    <Suspense fallback={
      <Card className="w-full">
        <CardContent className="p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="space-y-3 mt-6">
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
            <div className="h-64 bg-muted rounded mt-6"></div>
          </div>
        </CardContent>
      </Card>
    }>
      <InvestmentCalculator />
    </Suspense>
  );
}
