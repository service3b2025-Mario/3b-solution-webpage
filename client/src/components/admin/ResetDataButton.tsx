import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Trash2, RefreshCw, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

type TimePeriod = 
  | 'all' 
  | 'last_day' 
  | 'last_week' 
  | 'last_2_weeks' 
  | 'last_3_weeks' 
  | 'last_1_month' 
  | 'last_3_months' 
  | 'last_6_months' 
  | 'last_9_months' 
  | 'last_12_months';

type DataType = 
  | 'leads' 
  | 'bookings' 
  | 'downloads' 
  | 'tourFeedback' 
  | 'analyticsEvents' 
  | 'whatsappClicks' 
  | 'marketAlerts';

const TIME_PERIODS: { value: TimePeriod; label: string }[] = [
  { value: 'all', label: 'All Data' },
  { value: 'last_day', label: 'Last Day' },
  { value: 'last_week', label: 'Last 1 Week' },
  { value: 'last_2_weeks', label: 'Last 2 Weeks' },
  { value: 'last_3_weeks', label: 'Last 3 Weeks' },
  { value: 'last_1_month', label: 'Last 1 Month' },
  { value: 'last_3_months', label: 'Last 3 Months' },
  { value: 'last_6_months', label: 'Last 6 Months' },
  { value: 'last_9_months', label: 'Last 9 Months' },
  { value: 'last_12_months', label: 'Last 12 Months' },
];

const DATA_TYPES: { value: DataType; label: string; description: string }[] = [
  { value: 'leads', label: 'Leads', description: 'Contact form submissions and inquiries' },
  { value: 'bookings', label: 'Bookings', description: 'Property tour bookings and appointments' },
  { value: 'downloads', label: 'Downloads', description: 'Resource download records' },
  { value: 'tourFeedback', label: 'Tour Feedback', description: 'Feedback from property tours' },
  { value: 'analyticsEvents', label: 'Analytics Events', description: 'Page views and user interactions' },
  { value: 'whatsappClicks', label: 'WhatsApp Clicks', description: 'WhatsApp button click tracking' },
  { value: 'marketAlerts', label: 'Market Alerts', description: 'Market alert subscriptions' },
];

export function ResetDataButton() {
  const [open, setOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('all');
  const [selectedTypes, setSelectedTypes] = useState<DataType[]>([]);
  const [confirmText, setConfirmText] = useState('');
  const { toast } = useToast();
  
  // Fetch counts based on selected period
  const { data: counts, isLoading: countsLoading, refetch: refetchCounts } = trpc.adminData.getCounts.useQuery(
    { period: selectedPeriod },
    { enabled: open }
  );
  
  const resetMutation = trpc.adminData.resetByTypeAndPeriod.useMutation({
    onSuccess: (data) => {
      toast({
        title: "Data Reset Successful",
        description: `Deleted: ${Object.entries(data.deleted)
          .filter(([_, count]) => count > 0)
          .map(([type, count]) => `${type}: ${count}`)
          .join(', ') || 'No records found'}`,
      });
      setOpen(false);
      setSelectedTypes([]);
      setConfirmText('');
      refetchCounts();
    },
    onError: (error) => {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const handleTypeToggle = (type: DataType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };
  
  const handleSelectAll = () => {
    if (selectedTypes.length === DATA_TYPES.length) {
      setSelectedTypes([]);
    } else {
      setSelectedTypes(DATA_TYPES.map(t => t.value));
    }
  };
  
  const handleReset = () => {
    if (selectedTypes.length === 0) {
      toast({
        title: "No Data Selected",
        description: "Please select at least one data type to reset.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirmText !== 'DELETE') {
      toast({
        title: "Confirmation Required",
        description: "Please type DELETE to confirm.",
        variant: "destructive",
      });
      return;
    }
    
    resetMutation.mutate({
      dataTypes: selectedTypes,
      period: selectedPeriod,
    });
  };
  
  const getTotalSelectedCount = () => {
    if (!counts) return 0;
    return selectedTypes.reduce((sum, type) => {
      return sum + (counts[type as keyof typeof counts] as number || 0);
    }, 0);
  };
  
  const periodLabel = TIME_PERIODS.find(p => p.value === selectedPeriod)?.label || 'All Data';
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Reset Data
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reset Test Data
          </DialogTitle>
          <DialogDescription>
            Select which data types and time period to reset. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Time Period Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Time Period</Label>
            <Select 
              value={selectedPeriod} 
              onValueChange={(value) => setSelectedPeriod(value as TimePeriod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {TIME_PERIODS.map((period) => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === 'all' 
                ? 'This will delete ALL records regardless of date.'
                : `This will delete records created within the ${periodLabel.toLowerCase()}.`}
            </p>
          </div>
          
          {/* Data Type Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Data Types</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                {selectedTypes.length === DATA_TYPES.length ? 'Deselect All' : 'Select All'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {DATA_TYPES.map((type) => {
                const count = counts?.[type.value as keyof typeof counts] as number || 0;
                const isSelected = selectedTypes.includes(type.value);
                
                return (
                  <div 
                    key={type.value}
                    className={`flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                      isSelected ? 'border-destructive bg-destructive/5' : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => handleTypeToggle(type.value)}
                  >
                    <Checkbox 
                      id={type.value}
                      checked={isSelected}
                      onCheckedChange={() => handleTypeToggle(type.value)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <Label 
                          htmlFor={type.value} 
                          className="text-sm font-medium cursor-pointer"
                        >
                          {type.label}
                        </Label>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                          count > 0 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'
                        }`}>
                          {countsLoading ? '...' : count}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {type.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Summary */}
          {selectedTypes.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-destructive font-medium mb-2">
                <AlertTriangle className="h-4 w-4" />
                Warning: Permanent Deletion
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                You are about to delete <strong className="text-foreground">{getTotalSelectedCount()}</strong> records 
                from <strong className="text-foreground">{selectedTypes.length}</strong> data type(s) 
                for <strong className="text-foreground">{periodLabel}</strong>.
              </p>
              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-sm">
                  Type <span className="font-mono font-bold">DELETE</span> to confirm:
                </Label>
                <input
                  id="confirm"
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                  placeholder="Type DELETE"
                  className="w-full px-3 py-2 border rounded-md text-sm font-mono uppercase"
                />
              </div>
            </div>
          )}
          
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetchCounts()}
              disabled={countsLoading}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${countsLoading ? 'animate-spin' : ''}`} />
              Refresh Counts
            </Button>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReset}
            disabled={
              selectedTypes.length === 0 || 
              confirmText !== 'DELETE' || 
              resetMutation.isPending
            }
            className="gap-2"
          >
            {resetMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Selected Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
