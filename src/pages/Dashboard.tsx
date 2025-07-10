import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/metric-card";
import { Package, ShoppingCart, Clock, Plus, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";

export function Dashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [metrics, setMetrics] = useState({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsData, activityData] = await Promise.all([
        analyticsApi.getDashboardMetrics(),
        analyticsApi.getRecentActivity(3),
      ]);
      
      setMetrics(metricsData);
      setRecentActivity(activityData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-primary rounded-2xl p-6 text-primary-foreground">
        <h1 className="text-2xl font-bold mb-2">Welcome, John!</h1>
        <p className="text-primary-foreground/80">
          Here's what's happening with your store today
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Total Orders"
          value={metrics.totalOrders.toString()}
          icon={ShoppingCart}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Total Products"
          value={metrics.totalProducts.toString()}
          icon={Package}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricCard
          title="Pending Orders"
          value={metrics.pendingOrders.toString()}
          icon={Clock}
          variant="warning"
          trend={{ value: -5, isPositive: false }}
        />
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/products/new")}
            className="h-16 text-left justify-start bg-gradient-primary hover:bg-primary-hover shadow-lg"
            size="lg"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-foreground/20 rounded-lg">
                <Plus className="h-6 w-6" />
              </div>
              <div>
                <div className="font-semibold">Add New Product</div>
                <div className="text-sm opacity-80">Create a new product listing</div>
              </div>
            </div>
          </Button>

          <Button
            onClick={() => navigate("/orders")}
            variant="outline"
            className="h-16 text-left justify-start border-2 hover:bg-secondary"
            size="lg"
          >
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-primary-light rounded-lg">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-foreground">View Orders</div>
                <div className="text-sm text-muted-foreground">Manage your recent orders</div>
              </div>
            </div>
          </Button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-card rounded-lg border border-border">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'pending' || activity.status === 'draft' ? 'bg-warning' :
                activity.status === 'completed' || activity.status === 'publish' ? 'bg-success' :
                'bg-primary'
              }`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{activity.message}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}