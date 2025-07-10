
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendingUp, DollarSign, Users, ShoppingBag, Calendar, Filter, RefreshCw } from "lucide-react";
import { analyticsApi, productsApi } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";
import { DateFilter, DateRange } from "@/components/analytics/DateFilter";
import { SalesChart } from "@/components/analytics/SalesChart";
import { OrderStatusChart } from "@/components/analytics/OrderStatusChart";
import { LowStockAlerts } from "@/components/analytics/LowStockAlerts";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { PeriodComparison } from "@/components/analytics/PeriodComparison";

export function Analytics() {
  const { toast } = useToast();
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: "Last 30 days"
  });
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Calculate previous period for comparison
  const getPreviousPeriod = (currentRange: DateRange) => {
    const daysDiff = Math.ceil((currentRange.to.getTime() - currentRange.from.getTime()) / (1000 * 60 * 60 * 24));
    return {
      from: new Date(currentRange.from.getTime() - daysDiff * 24 * 60 * 60 * 1000),
      to: new Date(currentRange.from.getTime() - 24 * 60 * 60 * 1000)
    };
  };

  const previousPeriod = getPreviousPeriod(selectedDateRange);

  // React Query for metrics with auto-refresh
  const { data: metrics, isLoading: metricsLoading, refetch: refetchMetrics } = useQuery({
    queryKey: ['analytics-metrics', selectedDateRange.from.toISOString(), selectedDateRange.to.toISOString()],
    queryFn: () => analyticsApi.getDashboardMetrics(selectedDateRange.from, selectedDateRange.to),
    refetchInterval: autoRefresh ? 30000 : false, // 30 seconds when auto-refresh is on
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // React Query for previous period metrics
  const { data: previousMetrics } = useQuery({
    queryKey: ['analytics-metrics-previous', previousPeriod.from.toISOString(), previousPeriod.to.toISOString()],
    queryFn: () => analyticsApi.getDashboardMetrics(previousPeriod.from, previousPeriod.to),
    staleTime: 5 * 60 * 1000,
  });

  // React Query for sales chart data
  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ['sales-chart', selectedDateRange.from.toISOString(), selectedDateRange.to.toISOString()],
    queryFn: () => analyticsApi.getSalesChartData(selectedDateRange.from, selectedDateRange.to),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 5 * 60 * 1000,
  });

  // React Query for order status data
  const { data: orderStatusData, isLoading: orderStatusLoading } = useQuery({
    queryKey: ['order-status', selectedDateRange.from.toISOString(), selectedDateRange.to.toISOString()],
    queryFn: () => analyticsApi.getOrderStatusData(selectedDateRange.from, selectedDateRange.to),
    refetchInterval: autoRefresh ? 30000 : false,
    staleTime: 5 * 60 * 1000,
  });

  // React Query for top products
  const { data: topProducts } = useQuery({
    queryKey: ['top-products'],
    queryFn: async () => {
      const products = await productsApi.getAll({ per_page: 10 });
      return [
        { name: products[0]?.name || "Product 1", sales: 156, revenue: "$15,600" },
        { name: products[1]?.name || "Product 2", sales: 89, revenue: "$17,800" },
        { name: products[2]?.name || "Product 3", sales: 67, revenue: "$3,350" },
      ];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
  };

  const handleRefresh = () => {
    refetchMetrics();
    toast({
      title: "Data Refreshed",
      description: "Analytics data has been updated.",
    });
  };

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return { value: 0, isPositive: true };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(Math.round(change)),
      isPositive: change >= 0
    };
  };

  const isLoading = metricsLoading || salesLoading || orderStatusLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your store's performance</p>
        </div>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Auto-refresh
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <DateFilter 
              selectedRange={selectedDateRange}
              onDateRangeChange={handleDateRangeChange}
            />
          </div>
        </div>
      </div>

      {/* Period Comparison */}
      {metrics && previousMetrics && (
        <PeriodComparison
          currentPeriod={selectedDateRange}
          currentMetrics={metrics}
          previousMetrics={previousMetrics}
        />
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics?.totalRevenue?.toFixed(2) || '0.00'}`}
          icon={DollarSign}
          trend={previousMetrics ? calculateTrend(metrics?.totalRevenue || 0, previousMetrics.totalRevenue) : undefined}
        />
        <MetricCard
          title="Total Customers"
          value={metrics?.totalCustomers?.toString() || '0'}
          icon={Users}
          trend={previousMetrics ? calculateTrend(metrics?.totalCustomers || 0, previousMetrics.totalCustomers) : undefined}
        />
        <MetricCard
          title="Total Orders"
          value={metrics?.totalOrders?.toString() || '0'}
          icon={TrendingUp}
          trend={previousMetrics ? calculateTrend(metrics?.totalOrders || 0, previousMetrics.totalOrders) : undefined}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${metrics ? (metrics.totalRevenue / metrics.totalOrders || 0).toFixed(2) : '0.00'}`}
          icon={ShoppingBag}
          trend={previousMetrics && metrics ? calculateTrend(
            metrics.totalRevenue / metrics.totalOrders || 0,
            previousMetrics.totalRevenue / previousMetrics.totalOrders || 0
          ) : undefined}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <SalesChart data={salesData || []} />
        <OrderStatusChart data={orderStatusData || []} />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LowStockAlerts />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Top Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts?.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors">
                  <div>
                    <p className="font-medium text-foreground truncate">{product.name}</p>
                    <p className="text-sm text-muted-foreground">{product.sales} sales</p>
                  </div>
                  <span className="font-semibold text-primary">{product.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
