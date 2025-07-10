
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, RefreshCw } from "lucide-react";
import { productsApi } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";

interface LowStockProduct {
  id: number;
  name: string;
  stock_quantity: number;
  manage_stock: boolean;
}

export function LowStockAlerts() {
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLowStockProducts();
  }, []);

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for low stock analysis...');
      
      // Fetch all products with stock management enabled
      const products = await productsApi.getAll({ 
        per_page: 100,
        status: 'publish'
      });
      
      console.log('Total products fetched:', products.length);
      console.log('Sample product data:', products[0]);
      
      // Filter for low stock products (stock <= 10 and > 0, with stock management enabled)
      const lowStock = products.filter((product) => {
        const hasStockManagement = product.manage_stock === true;
        const stockQuantity = Number(product.stock_quantity) || 0;
        const isLowStock = stockQuantity <= 10 && stockQuantity > 0;
        
        console.log(`Product: ${product.name}, Stock: ${stockQuantity}, Manages Stock: ${hasStockManagement}, Is Low Stock: ${isLowStock}`);
        
        return hasStockManagement && isLowStock;
      });
      
      console.log('Low stock products found:', lowStock.length);
      setLowStockProducts(lowStock);
      
      if (lowStock.length > 0) {
        toast({
          title: "Low Stock Alert",
          description: `Found ${lowStock.length} products with low stock levels.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      toast({
        title: "Error",
        description: "Failed to load low stock alerts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (quantity: number) => {
    if (quantity <= 2) return { variant: "destructive" as const, label: "Critical" };
    if (quantity <= 5) return { variant: "destructive" as const, label: "Very Low" };
    return { variant: "secondary" as const, label: "Low" };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Low Stock Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-muted rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Low Stock Alerts
          <Badge variant="destructive" className="ml-auto">
            {lowStockProducts.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLowStockProducts}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {lowStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No low stock alerts</p>
            <p className="text-sm text-muted-foreground">All products are well stocked</p>
          </div>
        ) : (
          <div className="space-y-3">
            {lowStockProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock_quantity);
              return (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Stock: {product.stock_quantity} units remaining
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={stockStatus.variant}>
                      {stockStatus.label}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Restock
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
