
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { DateRange } from "./DateFilter";

interface PeriodComparisonProps {
  currentPeriod: DateRange;
  currentMetrics: {
    totalRevenue: number;
    totalCustomers: number;
    totalOrders: number;
  };
  previousMetrics: {
    totalRevenue: number;
    totalCustomers: number;
    totalOrders: number;
  };
}

export function PeriodComparison({ currentPeriod, currentMetrics, previousMetrics }: PeriodComparisonProps) {
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change >= 0
    };
  };

  const revenueChange = calculateChange(currentMetrics.totalRevenue, previousMetrics.totalRevenue);
  const ordersChange = calculateChange(currentMetrics.totalOrders, previousMetrics.totalOrders);
  const customersChange = calculateChange(currentMetrics.totalCustomers, previousMetrics.totalCustomers);

  return (
    <Card className="bg-gradient-to-r from-primary/5 to-secondary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="text-lg">Period Comparison</CardTitle>
        <p className="text-sm text-muted-foreground">
          {currentPeriod.label} vs Previous Period
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Revenue Change</p>
              <div className="flex items-center gap-2">
                {revenueChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`font-semibold ${revenueChange.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {revenueChange.isPositive ? '+' : '-'}{revenueChange.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="font-medium">${currentMetrics.totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Orders Change</p>
              <div className="flex items-center gap-2">
                {ordersChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`font-semibold ${ordersChange.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {ordersChange.isPositive ? '+' : '-'}{ordersChange.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="font-medium">{currentMetrics.totalOrders}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
            <div>
              <p className="text-sm text-muted-foreground">Customers Change</p>
              <div className="flex items-center gap-2">
                {customersChange.isPositive ? (
                  <TrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-destructive" />
                )}
                <span className={`font-semibold ${customersChange.isPositive ? 'text-success' : 'text-destructive'}`}>
                  {customersChange.isPositive ? '+' : '-'}{customersChange.value.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Current</p>
              <p className="font-medium">{currentMetrics.totalCustomers}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
