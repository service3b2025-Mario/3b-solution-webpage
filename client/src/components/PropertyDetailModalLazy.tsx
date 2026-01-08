import { lazy, Suspense } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

const PropertyDetailModal = lazy(() => import('./PropertyDetailModal'));

export function PropertyDetailModalLazy({ 
  property, 
  isOpen, 
  onClose 
}: { 
  property: any; 
  isOpen: boolean; 
  onClose: () => void;
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto p-0">
        <DialogTitle className="sr-only">{property?.title || 'Property Details'}</DialogTitle>
        <Suspense fallback={
          <div className="p-8 space-y-4">
            <div className="animate-pulse">
              <div className="h-96 bg-muted rounded-lg mb-6"></div>
              <div className="h-8 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-5/6 mb-2"></div>
              <div className="h-4 bg-muted rounded w-4/6"></div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="h-32 bg-muted rounded"></div>
                <div className="h-32 bg-muted rounded"></div>
              </div>
            </div>
          </div>
        }>
          <PropertyDetailModal property={property} isOpen={isOpen} onClose={onClose} />
        </Suspense>
      </DialogContent>
    </Dialog>
  );
}
