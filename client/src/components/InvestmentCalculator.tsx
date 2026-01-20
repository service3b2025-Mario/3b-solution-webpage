import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "wouter";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { Calculator, TrendingUp, Calendar, DollarSign, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

const currencies = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "PHP", symbol: "₱", name: "Philippine Peso" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
];

// Fallback FX rates (used if API fails)
const fallbackRates: Record<string, number> = {
  USD: 1,
  EUR: 0.95,
  GBP: 0.79,
  PHP: 58.5,
  SGD: 1.35,
  CNY: 7.25,
};

export default function InvestmentCalculator() {
  const [currency, setCurrency] = useState("USD");
  // Base investment amount is always in USD
  const [investmentAmountUSD, setInvestmentAmountUSD] = useState(500000);
  const [inputValue, setInputValue] = useState("");
  const [timeline, setTimeline] = useState(5);
  const [expectedReturn, setExpectedReturn] = useState(18);
  const [projectionData, setProjectionData] = useState<any[]>([]);
  // Fetch exchange rates from server-side tRPC endpoint
  const { data: exchangeRateData, isLoading: isLoadingRates } = trpc.exchangeRates.get.useQuery();
  
  const fxRates = exchangeRateData?.rates || fallbackRates;
  const rateDate = exchangeRateData?.date || "";
  const rateError = exchangeRateData ? !exchangeRateData.success : false;

  const selectedCurrency = currencies.find(c => c.code === currency) || currencies[0];
  const rate = fxRates[currency] || 1;

  /**
   * Convert USD amount to selected currency and round to clean multiples of 100
   * Example: USD 500,000 → EUR 475,000 (not EUR 474,890)
   */
  const convertAndRoundAmount = (usdAmount: number): number => {
    if (currency === "USD") {
      return usdAmount;
    }
    
    const convertedAmount = usdAmount * rate;
    
    // Round to nearest 100 for clean display
    // For amounts over 10,000: round to nearest 1,000
    // For amounts over 100,000: round to nearest 10,000
    // For amounts over 1,000,000: round to nearest 100,000
    
    let roundTo = 100;
    if (convertedAmount >= 1000000) {
      roundTo = 100000;
    } else if (convertedAmount >= 100000) {
      roundTo = 10000;
    } else if (convertedAmount >= 10000) {
      roundTo = 1000;
    }
    
    return Math.round(convertedAmount / roundTo) * roundTo;
  };

  /**
   * Convert from selected currency back to USD
   */
  const convertToUSD = (displayAmount: number): number => {
    if (currency === "USD") {
      return displayAmount;
    }
    return Math.round(displayAmount / rate);
  };

  const formatCurrency = (amount: number) => {
    return `${selectedCurrency.symbol}${amount.toLocaleString()}`;
  };

  // Get the displayed investment amount in selected currency (rounded)
  const displayedInvestmentAmount = convertAndRoundAmount(investmentAmountUSD);

  // Format number with thousand separators
  const formatInputValue = (value: number): string => {
    return value.toLocaleString('en-US');
  };

  // Update input value when slider changes or currency changes
  // This ensures the green input field stays in sync with the slider
  useEffect(() => {
    setInputValue(formatInputValue(displayedInvestmentAmount));
  }, [investmentAmountUSD, currency, rate]);

  // Handle input change - update slider and blue display in real-time as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    
    if (value) {
      const numValue = parseInt(value);
      // Update the input field with formatted value
      setInputValue(numValue.toLocaleString('en-US'));
      
      // Update the USD amount (which controls the slider and blue display)
      // Convert from display currency to USD and clamp to valid range
      const usdAmount = convertToUSD(numValue);
      const clampedUSD = Math.max(100000, Math.min(100000000, usdAmount));
      setInvestmentAmountUSD(clampedUSD);
    } else {
      setInputValue("");
    }
  };

  // Handle input blur (when user finishes typing)
  const handleInputBlur = () => {
    // Remove commas before parsing
    const numValue = parseInt(inputValue.replace(/,/g, "")) || 0;
    
    // Convert to USD and clamp to min/max
    const usdAmount = convertToUSD(numValue);
    const clampedUSD = Math.max(100000, Math.min(100000000, usdAmount));
    
    setInvestmentAmountUSD(clampedUSD);
    // Update input to show the clamped/rounded value with formatting
    setInputValue(formatInputValue(convertAndRoundAmount(clampedUSD)));
  };

  // Handle Enter key in input
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleInputBlur();
      (e.target as HTMLInputElement).blur();
    }
  };

  // Handle slider change - this updates the USD amount which triggers the useEffect
  // to update the input field and the blue display amount
  const handleSliderChange = (value: number[]) => {
    setInvestmentAmountUSD(value[0]);
  };

  useEffect(() => {
    // Calculate projection data using USD base amounts
    const data = [];
    let currentValue = investmentAmountUSD;
    
    for (let year = 0; year <= timeline; year++) {
      const yearValue = Math.round(currentValue);
      const traditionalValue = Math.round(investmentAmountUSD * Math.pow(1.03, year));
      
      data.push({
        year: `Year ${year}`,
        // Convert to selected currency for display
        value: convertAndRoundAmount(yearValue),
        traditional: convertAndRoundAmount(traditionalValue),
      });
      currentValue = currentValue * (1 + expectedReturn / 100);
    }
    
    setProjectionData(data);
  }, [investmentAmountUSD, timeline, expectedReturn, currency, rate]);

  const finalValue = projectionData[projectionData.length - 1]?.value || displayedInvestmentAmount;
  const totalReturn = finalValue - displayedInvestmentAmount;
  const percentageGain = ((finalValue - displayedInvestmentAmount) / displayedInvestmentAmount * 100).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Controls */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-secondary" aria-hidden="true" />
              Configure Your Investment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Currency Selection */}
            <div>
              {/* FIXED: Added proper label with htmlFor and id for accessibility */}
              <label htmlFor="currency-select" className="text-sm font-medium text-foreground mb-2 block">
                Select Currency
              </label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="w-full" id="currency-select" aria-label="Select currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.symbol} {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 mt-2">
                {isLoadingRates ? (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <RefreshCw className="w-3 h-3 animate-spin" aria-hidden="true" />
                    <span>Loading live rates...</span>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {rateError ? (
                      <span className="text-amber-600">Using fallback rates. Live rates unavailable.</span>
                    ) : (
                      <>
                        <span className="text-green-600 font-medium">● Live rates</span>
                        {" "}from European Central Bank. Updated: {rateDate}
                      </>
                    )}
                  </p>
                )}
              </div>
              {currency !== "USD" && !isLoadingRates && (
                <p className="text-xs text-muted-foreground mt-1">
                  1 USD = {fxRates[currency]?.toFixed(4)} {currency}
                </p>
              )}
            </div>

            {/* Investment Amount */}
            <div>
              <div className="flex justify-between items-start mb-2">
                {/* FIXED: Added proper label with htmlFor for accessibility */}
                <label htmlFor="investment-amount" className="text-sm font-medium text-foreground">Investment Amount</label>
                <div className="flex flex-col items-end gap-2">
                  {/* Blue display - shows formatted currency amount */}
                  <span className="text-lg font-bold text-primary" aria-live="polite">{formatCurrency(displayedInvestmentAmount)}</span>
                  {/* Green input field - Direct Input Field - Right Aligned */}
                  <div className="relative w-64">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-base" aria-hidden="true">
                      {selectedCurrency.symbol}
                    </span>
                    {/* FIXED: Added id and aria-label for accessibility */}
                    <Input
                      id="investment-amount"
                      type="text"
                      value={inputValue}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      className="pl-8 pr-3 text-right text-base font-semibold h-10"
                      placeholder="Enter amount"
                      aria-label={`Investment amount in ${selectedCurrency.name}`}
                    />
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-right mb-4">
                Enter amount or use slider below
              </p>

              {/* FIXED: Added aria-label to slider for accessibility */}
              <Slider
                value={[investmentAmountUSD]}
                onValueChange={handleSliderChange}
                min={100000}
                max={100000000}
                step={50000}
                className="w-full"
                aria-label="Investment amount slider"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>{formatCurrency(convertAndRoundAmount(100000))}</span>
                <span>{formatCurrency(convertAndRoundAmount(100000000))}</span>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="timeline-slider" className="text-sm font-medium text-foreground">Investment Timeline</label>
                <span className="text-lg font-bold text-primary" aria-live="polite">{timeline} Years</span>
              </div>
              {/* FIXED: Added aria-label to slider for accessibility */}
              <Slider
                value={[timeline]}
                onValueChange={(v) => setTimeline(v[0])}
                min={1}
                max={15}
                step={1}
                className="w-full"
                aria-label="Investment timeline in years"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>1 Year</span>
                <span>15 Years</span>
              </div>
            </div>

            {/* Expected Return */}
            <div>
              <div className="flex justify-between mb-2">
                <label htmlFor="return-slider" className="text-sm font-medium text-foreground">Expected Annual Return</label>
                <span className="text-lg font-bold text-secondary" aria-live="polite">{expectedReturn}%</span>
              </div>
              {/* FIXED: Added aria-label to slider for accessibility */}
              <Slider
                value={[expectedReturn]}
                onValueChange={(v) => setExpectedReturn(v[0])}
                min={10}
                max={30}
                step={1}
                className="w-full"
                aria-label="Expected annual return percentage"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>10%</span>
                <span>30%</span>
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground">
                * Projections are estimates based on historical performance. Actual returns may vary. 
                Investment involves risk. Past performance is not indicative of future results.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-primary to-primary/90">
              <CardContent className="p-6 text-primary-foreground">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-5 h-5 opacity-70" aria-hidden="true" />
                  <span className="text-sm opacity-70">Projected Value</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold" aria-live="polite">{formatCurrency(finalValue)}</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary to-secondary/90">
              <CardContent className="p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 opacity-70" aria-hidden="true" />
                  <span className="text-sm opacity-70">Total Return</span>
                </div>
                <div className="text-2xl md:text-3xl font-bold" aria-live="polite">+{percentageGain}%</div>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">Investment Projection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64" role="img" aria-label="Investment projection chart showing growth over time">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.65 0.15 75)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="oklch(0.65 0.15 75)" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTraditional" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="oklch(0.45 0.02 250)" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="oklch(0.45 0.02 250)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.25 0.02 250)" opacity={0.1} />
                    <XAxis 
                      dataKey="year" 
                      stroke="oklch(0.45 0.02 250)"
                      tick={{ fill: 'oklch(0.45 0.02 250)' }}
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="oklch(0.45 0.02 250)"
                      tick={{ fill: 'oklch(0.45 0.02 250)' }}
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${selectedCurrency.symbol}${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'oklch(0.98 0 0)',
                        border: '1px solid oklch(0.85 0.02 250)',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                      }}
                      formatter={(value: any) => formatCurrency(value)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="oklch(0.65 0.15 75)" 
                      strokeWidth={3}
                      fill="url(#colorValue)" 
                      name="3B Solution"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="traditional" 
                      stroke="oklch(0.45 0.02 250)" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="url(#colorTraditional)" 
                      name="Traditional (3%)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-secondary rounded" aria-hidden="true"></div>
                  <span className="text-muted-foreground">3B Solution</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-1 bg-muted-foreground rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, currentColor 0, currentColor 2px, transparent 2px, transparent 5px)' }} aria-hidden="true"></div>
                  <span className="text-muted-foreground">Traditional (3%)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <Card className="border-0 shadow-lg bg-gradient-to-br from-secondary to-secondary/90 text-white">
            <CardContent className="p-6 text-center">
              {/* FIXED: Changed from h3 to h2 for proper heading hierarchy */}
              <h2 className="text-xl font-bold mb-2">Schedule Consultation to Learn More</h2>
              <p className="text-sm opacity-90 mb-4">
                Speak with our investment advisors to explore opportunities tailored to your goals
              </p>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="bg-white text-secondary hover:bg-white/90 border-0">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
