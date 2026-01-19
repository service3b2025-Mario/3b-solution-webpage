import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Trash2, AlertTriangle, Loader2, CheckCircle } from "lucide-react";

export function ResetDataButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    deleted?: Record<string, number>;
    message?: string;
  } | null>(null);

  const { data: counts, isLoading: countsLoading, refetch: refetchCounts } = trpc.adminData.getCounts.useQuery(undefined, {
    enabled: isOpen,
  });

  const resetMutation = trpc.adminData.resetAll.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsConfirming(false);
      refetchCounts();
    },
    onError: (error) => {
      setResult({
        success: false,
        message: error.message || "Failed to reset data",
      });
      setIsConfirming(false);
    },
  });

  const handleReset = () => {
    setIsConfirming(true);
    resetMutation.mutate();
  };

  const handleClose = () => {
    setIsOpen(false);
    setResult(null);
    setIsConfirming(false);
  };

  const totalRecords = counts
    ? Object.values(counts).reduce((sum, count) => sum + count, 0)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Reset All Data
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reset All Test Data
          </DialogTitle>
          <DialogDescription>
            This will permanently delete all test data and reset KPIs to zero.
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        {result?.success ? (
          <div className="py-4">
            <Alert className="border-green-500 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Success!</AlertTitle>
              <AlertDescription className="text-green-700">
                All test data has been deleted. Your KPIs are now reset to zero.
              </AlertDescription>
            </Alert>
            {result.deleted && (
              <div className="mt-4 space-y-1 text-sm text-muted-foreground">
                <p className="font-medium">Deleted records:</p>
                <ul className="list-disc list-inside">
                  {Object.entries(result.deleted).map(([key, value]) => (
                    <li key={key}>
                      {key}: {value} records
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mt-4">
              <Button onClick={handleClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="py-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  The following data will be permanently deleted:
                </AlertDescription>
              </Alert>

              {countsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : counts ? (
                <div className="mt-4 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Leads:</span>
                      <span className="font-bold">{counts.leads}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Bookings:</span>
                      <span className="font-bold">{counts.bookings}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Downloads:</span>
                      <span className="font-bold">{counts.downloads}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Tour Feedback:</span>
                      <span className="font-bold">{counts.tourFeedback}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Analytics Events:</span>
                      <span className="font-bold">{counts.analyticsEvents}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>WhatsApp Clicks:</span>
                      <span className="font-bold">{counts.whatsappClicks}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted rounded">
                      <span>Market Alerts:</span>
                      <span className="font-bold">{counts.marketAlerts}</span>
                    </div>
                  </div>
                  <div className="flex justify-between p-3 bg-destructive/10 rounded border border-destructive/20 mt-4">
                    <span className="font-medium">Total Records to Delete:</span>
                    <span className="font-bold text-destructive">{totalRecords}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-4">
                  Unable to fetch data counts.
                </p>
              )}

              {result && !result.success && (
                <Alert variant="destructive" className="mt-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{result.message}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleReset}
                disabled={isConfirming || totalRecords === 0}
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete All Data
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
