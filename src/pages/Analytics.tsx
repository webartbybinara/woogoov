import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { TrendingUp, DollarSign, Users, ShoppingBag, Calendar, Filter } from "lucide-react";
import { analyticsApi, productsApi } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";
import { DateFilter, DateRange } from "@/components/analytics/DateFilter";
import { SalesChart } from "@/components/analytics/SalesChart";
import { OrderStatusChart } from "@/components/analytics/OrderStatusChart";
import { LowStockAlerts } from "@/components/analytics/LowStockAlerts";
import { OutOfStockProducts } from "@/components/analytics/OutOfStockProducts";

export function Analytics() {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    totalRevenue: 0,
    totalCustomers: 0,
    totalOrders: 0,
    averageOrderValue: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    to: new Date(),
    label: "Last 30 days"
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedDateRange]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [metricsData, products, salesChartData, orderStatus] = await Promise.all([
        analyticsApi.getDashboardMetrics(selectedDateRange.from, selectedDateRange.to),
        productsApi.getAll({ per_page: 10 }),
        analyticsApi.getSalesChartData(selectedDateRange.from, selectedDateRange.to),
        analyticsApi.getOrderStatusData(selectedDateRange.from, selectedDateRange.to),
      ]);
      
      setMetrics({
        totalRevenue: metricsData.totalRevenue,
        totalCustomers: metricsData.totalCustomers,
        totalOrders: metricsData.totalOrders,
        averageOrderValue: metricsData.totalRevenue / metricsData.totalOrders || 0,
      });

      setSalesData(salesChartData);
      setOrderStatusData(orderStatus);

      // Mock top products data for now
      setTopProducts([
        { name: products[0]?.name || "Product 1", sales: 156, revenue: "$15,600" },
        { name: products[1]?.name || "Product 2", sales: 89, revenue: "$17,800" },
        { name: products[2]?.name || "Product 3", sales: 67, revenue: "$3,350" },
      ]);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeChange = (range: DateRange) => {
    setSelectedDateRange(range);
  };

  if (loading) {
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Track your store's performance</p>
        </div>
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <DateFilter 
            selectedRange={selectedDateRange}
            onDateRangeChange={handleDateRangeChange}
          />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Revenue"
          value={`$${metrics.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend={{ value: 15, isPositive: true }}
        />
        <MetricCard
          title="Total Customers"
          value={metrics.totalCustomers.toString()}
          icon={Users}
          trend={{ value: 8, isPositive: true }}
        />
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          icon={TrendingUp}
          trend={{ value: -2, isPositive: false }}
        />
        <MetricCard
          title="Avg Order Value"
          value={`$${metrics.averageOrderValue.toFixed(2)}`}
          icon={ShoppingBag}
          trend={{ value: 5, isPositive: true }}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SalesChart data={salesData} />
        <OrderStatusChart data={orderStatusData} />
      </div>

      {/* Stock Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LowStockAlerts />
        <OutOfStockProducts />
      </div>

      {/* Additional Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
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
    </div>
  );
}
