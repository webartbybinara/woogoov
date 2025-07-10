import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Package, 
  User, 
  CreditCard, 
  Truck,
  MapPin,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Hash,
  Edit,
  Save,
  MessageSquare
} from "lucide-react";
import { ordersApi, WooCommerceOrder } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";

const statusOptions = [
  { value: "pending", label: "Pending", variant: "warning" as const },
  { value: "processing", label: "Processing", variant: "default" as const },
  { value: "on-hold", label: "On Hold", variant: "secondary" as const },
  { value: "completed", label: "Completed", variant: "success" as const },
  { value: "cancelled", label: "Cancelled", variant: "destructive" as const },
  { value: "refunded", label: "Refunded", variant: "destructive" as const },
  { value: "failed", label: "Failed", variant: "destructive" as const }
];

export function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [order, setOrder] = useState<WooCommerceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingStatus, setEditingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersApi.getById(Number(id));
      setOrder(data);
      setNewStatus(data.status);
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: "Error",
        description: "Failed to load order details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!order || newStatus === order.status) return;

    try {
      setUpdating(true);
      await ordersApi.updateStatus(order.id, newStatus);
      setOrder({ ...order, status: newStatus as any });
      setEditingStatus(false);
      toast({
        title: "Success",
        description: "Order status updated successfully.",
      });
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    const statusConfig = statusOptions.find(s => s.value === status);
    return statusConfig?.variant || "default";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-semibold text-foreground mb-2">Order not found</h3>
        <p className="text-muted-foreground mb-4">The requested order could not be found.</p>
        <Button onClick={() => navigate("/orders")}>Back to Orders</Button>
      </div>
    );
  }

  const customerName = `${order.billing.first_name} ${order.billing.last_name}`;
  const itemCount = order.line_items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/orders")}
          className="flex items-center text-muted-foreground hover:text-foreground p-0"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        
        {/* Order Header Card */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-bold text-foreground">
                    Order #{order.number || order.id}
                  </h1>
                  <Badge 
                    variant={getStatusBadgeVariant(order.status)}
                    className="text-xs font-medium"
                  >
                    {order.status.replace('-', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center flex-wrap gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Placed on {new Date(order.date_created).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start sm:gap-6">
                    <div className="flex items-center gap-1">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {itemCount} item{itemCount !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        ${order.total}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Actions */}
              <div className="flex flex-col sm:flex-row gap-2">
                {editingStatus ? (
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select value={newStatus} onValueChange={setNewStatus}>
                      <SelectTrigger className="w-full sm:w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleStatusUpdate} disabled={updating} className="flex-1 sm:flex-none">
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditingStatus(false)} className="flex-1 sm:flex-none">
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={() => setEditingStatus(true)} className="w-full sm:w-auto">
                    <Edit className="h-4 w-4 mr-1" />
                    Update Status
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4 md:space-y-6">
          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2" />
                Order Items ({itemCount} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 md:space-y-4">
                {order.line_items.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 p-3 md:p-4 border rounded-lg">
                    <div className="flex-1 space-y-1">
                      <h4 className="font-medium text-foreground text-sm md:text-base">{item.name}</h4>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-xs md:text-sm text-muted-foreground">
                        <span>Product ID: #{item.product_id}</span>
                        <span>Qty: {item.quantity} × ${item.price}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="font-semibold text-foreground text-sm md:text-base">${item.total}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Fulfillment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Truck className="h-5 w-5 mr-2" />
                Fulfillment & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div>
                <label className="text-sm md:text-base font-medium text-foreground">Tracking Number</label>
                <div className="flex flex-col sm:flex-row gap-2 mt-1">
                  <Input
                    placeholder="Enter tracking number..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                  />
                  <Button size="sm" className="w-full sm:w-auto">
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Shipping Method:</span>
                  <p className="font-medium">Standard Shipping</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Expected Delivery:</span>
                  <p className="font-medium">3-5 business days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Notes & Communication
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 md:space-y-4">
              <div>
                <label className="text-sm md:text-base font-medium text-foreground">Add Internal Note</label>
                <Textarea
                  placeholder="Add notes about this order..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1"
                />
                <Button size="sm" className="mt-2 w-full sm:w-auto">
                  Add Note
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 md:space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-foreground">{customerName}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {order.billing.email}
                </div>
                {order.billing.phone && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <Phone className="h-4 w-4 mr-1" />
                    {order.billing.phone}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Billing Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CreditCard className="h-5 w-5 mr-2" />
                Billing Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">{customerName}</p>
                <p>{order.billing.address_1}</p>
                {order.billing.address_2 && <p>{order.billing.address_2}</p>}
                <p>{order.billing.city}, {order.billing.state} {order.billing.postcode}</p>
                <p>{order.billing.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-1">
                <p className="font-medium">
                  {order.shipping.first_name} {order.shipping.last_name}
                </p>
                <p>{order.shipping.address_1}</p>
                {order.shipping.address_2 && <p>{order.shipping.address_2}</p>}
                <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postcode}</p>
                <p>{order.shipping.country}</p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DollarSign className="h-5 w-5 mr-2" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${(parseFloat(order.total) - parseFloat(order.total_tax)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax:</span>
                <span>${order.total_tax}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping:</span>
                <span>$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${order.total}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Order Placed</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(order.date_created).toLocaleString()}
                  </p>
                </div>
              </div>
              {order.date_modified !== order.date_created && (
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-muted rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Last Updated</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.date_modified).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}