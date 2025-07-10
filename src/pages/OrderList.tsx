import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Eye, Calendar, User, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ordersApi, WooCommerceOrder } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";

const statusVariants = {
  pending: "warning",
  processing: "default",
  "on-hold": "default",
  completed: "success",
  cancelled: "destructive",
  refunded: "destructive",
  failed: "destructive"
} as const;

export function OrderList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState<WooCommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getAll({ per_page: 100 });
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    const customerName = `${order.billing.first_name} ${order.billing.last_name}`;
    const matchesSearch = 
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.billing.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusCounts = () => {
    return {
      all: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing").length,
      completed: orders.filter(o => o.status === "completed").length,
    };
  };

  const statusCounts = getStatusCounts();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">Manage your customer orders</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search orders by customer, email, or order number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Status Filter Tabs */}
      <Tabs value={statusFilter} onValueChange={setStatusFilter}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({statusCounts.pending})</TabsTrigger>
          <TabsTrigger value="processing">Processing ({statusCounts.processing})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({statusCounts.completed})</TabsTrigger>
        </TabsList>

        <TabsContent value={statusFilter} className="mt-6">
          {/* Order List */}
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const customerName = `${order.billing.first_name} ${order.billing.last_name}`;
              const itemCount = order.line_items.reduce((total, item) => total + item.quantity, 0);
              
              return (
                <Card 
                  key={order.id} 
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => navigate(`/orders/${order.id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-foreground">
                            Order #{order.number || order.id}
                          </h3>
                          <Badge variant={statusVariants[order.status as keyof typeof statusVariants]}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4" />
                            <span>{customerName}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>{new Date(order.date_created).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-medium text-foreground">${order.total}</span>
                          </div>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {itemCount} item{itemCount !== 1 ? 's' : ''} • {order.billing.email}
                        </p>
                      </div>
                      
                      <Button variant="outline" size="sm" className="shrink-0">
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Try adjusting your search or filter criteria" 
                  : "Orders will appear here when customers place them"}
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}