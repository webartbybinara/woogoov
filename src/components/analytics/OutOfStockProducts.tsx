
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PackageX, Package, RefreshCw } from "lucide-react";
import { productsApi } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";

interface OutOfStockProduct {
  id: number;
  name: string;
  stock_quantity: number;
  manage_stock: boolean;
  stock_status: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
}

export function OutOfStockProducts() {
  const [outOfStockProducts, setOutOfStockProducts] = useState<OutOfStockProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchOutOfStockProducts();
  }, []);

  const fetchOutOfStockProducts = async () => {
    try {
      setLoading(true);
      console.log('Fetching products for out of stock analysis...');
      
      // Fetch all products
      const products = await productsApi.getAll({ 
        per_page: 100,
        status: 'publish'
      });
      
      console.log('Total products fetched:', products.length);
      
      // Filter for out of stock products
      const outOfStock = products.filter((product) => {
        const stockQuantity = Number(product.stock_quantity) || 0;
        const isOutOfStock = product.stock_status === 'outofstock' || 
                            (product.manage_stock && stockQuantity <= 0);
        
        console.log(`Product: ${product.name}, Stock: ${stockQuantity}, Stock Status: ${product.stock_status}, Is Out of Stock: ${isOutOfStock}`);
        
        return isOutOfStock;
      });
      
      console.log('Out of stock products found:', outOfStock.length);
      setOutOfStockProducts(outOfStock);
      
      if (outOfStock.length > 0) {
        toast({
          title: "Out of Stock Alert",
          description: `Found ${outOfStock.length} products that are out of stock.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching out of stock products:', error);
      toast({
        title: "Error",
        description: "Failed to load out of stock products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageX className="h-5 w-5" />
            Out of Stock Products
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
          <PackageX className="h-5 w-5" />
          Out of Stock Products
          <Badge variant="destructive" className="ml-auto">
            {outOfStockProducts.length}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={fetchOutOfStockProducts}
            className="ml-2"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {outOfStockProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No out of stock products</p>
            <p className="text-sm text-muted-foreground">All products are in stock</p>
          </div>
        ) : (
          <div className="space-y-3">
            {outOfStockProducts.map((product) => {
              const thumbnail = product.images?.[0]?.src || "/placeholder.svg";
              
              return (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border rounded-lg"
                >
                  <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-muted">
                    <img
                      src={thumbnail}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder.svg";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">{product.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.manage_stock 
                        ? `Stock: ${product.stock_quantity} units` 
                        : `Status: ${product.stock_status}`
                      }
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="destructive">
                      Out of Stock
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
