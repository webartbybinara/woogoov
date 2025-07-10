import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { productsApi, WooCommerceProduct } from "@/lib/woocommerce";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

export function ProductList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<WooCommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productsApi.getAll({ per_page: 100 });
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      await productsApi.delete(id);
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Success",
        description: "Product deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground">Manage your product catalog</p>
        </div>
        <Button 
          onClick={() => navigate("/products/new")}
          className="bg-gradient-primary hover:bg-primary-hover shadow-lg"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Product Grid/List */}
      <div className="lg:hidden">
        {/* Mobile & Tablet Card List Layout */}
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-200 overflow-hidden bg-gradient-card border-border/50">
              <CardContent className="p-0">
                <div className="flex items-center gap-4 p-4">
                  {/* Product Image */}
                  <div className="w-16 h-16 relative overflow-hidden rounded-lg bg-muted flex-shrink-0">
                    <img
                      src={product.images?.[0]?.src || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"}
                      alt={product.images?.[0]?.alt || product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  
                  {/* Product Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm line-clamp-1">
                          {product.name}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {product.categories?.[0]?.name || "Uncategorized"}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-primary/10"
                          onClick={() => navigate(`/products/${product.id}/edit`)}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 hover:bg-destructive/10"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ${product.price || product.regular_price}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={product.status === "publish" ? "default" : "secondary"}
                          className={`text-xs px-2 py-1 ${
                            product.status === "publish" 
                              ? "bg-success/10 text-success border-success/20" 
                              : "bg-warning/10 text-warning border-warning/20"
                          }`}
                        >
                          {product.status === "publish" ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Package className="h-3 w-3" />
                        <span>Stock: {product.stock_quantity || 0}</span>
                      </div>
                      {product.variations && product.variations.length > 0 && (
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          {product.variations.length} variations
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="group hover:shadow-lg transition-all duration-200">
              <CardContent className="p-0">
                <div className="aspect-square relative overflow-hidden rounded-t-lg">
                  <img
                    src={product.images?.[0]?.src || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop"}
                    alt={product.images?.[0]?.alt || product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={product.status === "publish" ? "default" : "secondary"}>
                      {product.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-foreground line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {product.categories?.[0]?.name || "Uncategorized"}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      ${product.price || product.regular_price}
                    </span>
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Package className="h-4 w-4" />
                      <span>{product.stock_quantity || 0}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="px-3"
                      onClick={() => handleDeleteProduct(product.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "Try adjusting your search terms" : "Get started by adding your first product"}
          </p>
          <Button onClick={() => navigate("/products/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      )}
    </div>
  );
}