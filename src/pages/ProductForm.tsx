import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { ArrowLeft, Upload, Plus, X, Save, Eye, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mediaApi, productsApi } from "@/lib/woocommerce";

// Mock categories data
const categories = [
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "books", label: "Books" },
  { value: "home", label: "Home & Garden" },
  { value: "sports", label: "Sports & Outdoors" },
];

interface Attribute {
  id: string;
  name: string;
  values: string[];
}

interface Variation {
  id: string;
  attributes: Record<string, string>;
  price: number;
  stock: number;
}

interface ProductFormData {
  title: string;
  price: number;
  category: string;
  stock: number;
  description: string;
  status: "draft" | "published";
}

interface ProductImage {
  id?: number;
  src: string;
  alt: string;
}

export function ProductForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { toast } = useToast();
  const isEditing = !!id;

  const form = useForm<ProductFormData>({
    defaultValues: {
      title: "",
      price: 0,
      category: "",
      stock: 0,
      description: "",
      status: "draft",
    },
  });

  const [thumbnailImage, setThumbnailImage] = useState<ProductImage | null>(null);
  const [additionalImages, setAdditionalImages] = useState<ProductImage[]>([]);
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [variations, setVariations] = useState<Variation[]>([]);
  const [newAttributeName, setNewAttributeName] = useState("");
  const [newAttributeValue, setNewAttributeValue] = useState("");
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [isUploadingAdditional, setIsUploadingAdditional] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const additionalInputRef = useRef<HTMLInputElement>(null);

  // Fetch product data when editing
  useEffect(() => {
    if (isEditing && id) {
      const fetchProduct = async () => {
        try {
          setIsLoading(true);
          const [product, variations] = await Promise.all([
            productsApi.getById(parseInt(id)),
            productsApi.getVariations(parseInt(id))
          ]);
          
          // Map product data to form
          form.reset({
            title: product.name,
            price: parseFloat(product.price),
            category: product.categories[0]?.slug || "",
            stock: product.stock_quantity,
            description: product.short_description,
            status: product.status === "publish" ? "published" : "draft",
          });

          // Set images with proper IDs
          if (product.images?.length > 0) {
            const firstImage = product.images[0];
            setThumbnailImage({
              id: firstImage.id,
              src: firstImage.src,
              alt: firstImage.alt || "Product thumbnail"
            });
            
            if (product.images.length > 1) {
              const additionalImgs = product.images.slice(1).map(img => ({
                id: img.id,
                src: img.src,
                alt: img.alt || "Product image"
              }));
              setAdditionalImages(additionalImgs);
            }
          }

          // Map WooCommerce attributes to our format
          if (product.attributes?.length > 0) {
            const mappedAttributes: Attribute[] = product.attributes.map(attr => ({
              id: `attr-${attr.id}`,
              name: attr.name,
              values: attr.options || []
            }));
            setAttributes(mappedAttributes);
          }

          // Map WooCommerce variations to our format
          if (variations?.length > 0) {
            const mappedVariations: Variation[] = variations.map((variation, index) => {
              const attributes: Record<string, string> = {};
              variation.attributes.forEach(attr => {
                attributes[attr.name] = attr.option;
              });
              
              return {
                id: `var-${variation.id}`,
                attributes,
                price: parseFloat(variation.price) || 0,
                stock: variation.stock_quantity || 0,
              };
            });
            setVariations(mappedVariations);
          }
          
        } catch (error) {
          console.error('Failed to fetch product:', error);
          toast({
            title: "Error",
            description: "Failed to load product data.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id, isEditing, form, toast]);

  // Auto-generate variations when attributes change
  useEffect(() => {
    generateVariations();
  }, [attributes]);

  // Generate variations based on attributes
  const generateVariations = () => {
    if (attributes.length === 0) {
      setVariations([]);
      return;
    }

    const combinations: Record<string, string>[] = [];
    
    const generate = (index: number, current: Record<string, string>) => {
      if (index === attributes.length) {
        combinations.push({ ...current });
        return;
      }
      
      const attr = attributes[index];
      attr.values.forEach(value => {
        generate(index + 1, { ...current, [attr.name]: value });
      });
    };

    generate(0, {});

    const newVariations: Variation[] = combinations.map((attrs, index) => ({
      id: `var-${Date.now()}-${index}`, // Use timestamp to ensure unique IDs
      attributes: attrs,
      price: form.getValues("price") || 0,
      stock: form.getValues("stock") || 0,
    }));

    setVariations(newVariations);
  };

  const addAttribute = () => {
    if (!newAttributeName.trim()) return;

    const existingAttr = attributes.find(attr => attr.name === newAttributeName);
    if (existingAttr) {
      toast({
        title: "Attribute exists",
        description: "This attribute already exists.",
        variant: "destructive",
      });
      return;
    }

    const newAttr: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttributeName,
      values: [],
    };

    setAttributes([...attributes, newAttr]);
    setNewAttributeName("");
  };

  const addAttributeValue = (attributeId: string) => {
    if (!newAttributeValue.trim()) return;

    setAttributes(attributes.map(attr => {
      if (attr.id === attributeId && !attr.values.includes(newAttributeValue)) {
        return { ...attr, values: [...attr.values, newAttributeValue] };
      }
      return attr;
    }));
    setNewAttributeValue("");
  };

  const removeAttribute = (attributeId: string) => {
    setAttributes(attributes.filter(attr => attr.id !== attributeId));
  };

  const removeAttributeValue = (attributeId: string, value: string) => {
    setAttributes(attributes.map(attr => {
      if (attr.id === attributeId) {
        return { ...attr, values: attr.values.filter(v => v !== value) };
      }
      return attr;
    }));
  };

  const updateVariation = (variationId: string, field: "price" | "stock", value: number) => {
    setVariations(variations.map(variation => {
      if (variation.id === variationId) {
        return { ...variation, [field]: value };
      }
      return variation;
    }));
  };

  const handleImageUpload = (type: "thumbnail" | "additional") => {
    if (type === "thumbnail") {
      thumbnailInputRef.current?.click();
    } else {
      additionalInputRef.current?.click();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "thumbnail" | "additional") => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (type === "thumbnail") {
        setIsUploadingThumbnail(true);
      } else {
        setIsUploadingAdditional(true);
      }

      const uploadResult = await mediaApi.upload(file, file.name);
      
      if (type === "thumbnail") {
        setThumbnailImage({
          src: uploadResult.source_url,
          alt: "Product thumbnail"
        });
        toast({
          title: "Thumbnail uploaded",
          description: "Product thumbnail has been uploaded successfully.",
        });
      } else {
        setAdditionalImages([...additionalImages, {
          src: uploadResult.source_url,
          alt: `Product image ${additionalImages.length + 1}`
        }]);
        toast({
          title: "Image uploaded",
          description: "Additional image has been uploaded successfully.",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      if (type === "thumbnail") {
        setIsUploadingThumbnail(false);
      } else {
        setIsUploadingAdditional(false);
      }
      
      // Clear the input
      event.target.value = '';
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages(additionalImages.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ProductFormData, status: "draft" | "published") => {
    try {
      setIsLoading(true);
      
      // Prepare images array properly for WooCommerce
      const images = [];
      
      if (thumbnailImage) {
        if (thumbnailImage.id) {
          // Existing image - keep the ID
          images.push({
            id: thumbnailImage.id,
            src: thumbnailImage.src,
            alt: thumbnailImage.alt
          });
        } else {
          // New image - don't include ID
          images.push({
            src: thumbnailImage.src,
            alt: thumbnailImage.alt
          });
        }
      }
      
      additionalImages.forEach(img => {
        if (img.id) {
          // Existing image - keep the ID
          images.push({
            id: img.id,
            src: img.src,
            alt: img.alt
          });
        } else {
          // New image - don't include ID
          images.push({
            src: img.src,
            alt: img.alt
          });
        }
      });
      
      // Prepare product data for WooCommerce API
      const productData = {
        name: data.title,
        type: variations.length > 0 ? "variable" : "simple",
        regular_price: data.price.toString(),
        description: data.description,
        short_description: data.description,
        categories: [{ id: 0, name: data.category, slug: data.category }],
        stock_quantity: data.stock,
        manage_stock: true,
        status: status === "published" ? "publish" as const : "draft" as const,
        images: images,
        attributes: attributes.map((attr, index) => ({
          id: parseInt(attr.id.replace('attr-', '')) || index,
          name: attr.name,
          options: attr.values,
          visible: true,
          variation: true,
          position: index
        }))
      };

      console.log('Submitting product data:', JSON.stringify(productData, null, 2));

      let product;
      if (isEditing && id) {
        // Update existing product
        product = await productsApi.update(parseInt(id), productData);
      } else {
        // Create new product
        product = await productsApi.create(productData);
      }

      // Create variations if they exist
      if (variations.length > 0 && product.id) {
        for (const variation of variations) {
          const variationData = {
            regular_price: variation.price.toString(),
            stock_quantity: variation.stock,
            manage_stock: true,
            attributes: Object.entries(variation.attributes).map(([name, value]) => ({
              name,
              option: value
            }))
          };
          
          try {
            await productsApi.createVariation(product.id, variationData);
          } catch (error) {
            console.error('Failed to create variation:', error);
          }
        }
      }

      toast({
        title: status === "published" ? "Product Published" : "Draft Saved",
        description: `Product has been ${status === "published" ? "published" : "saved as draft"} successfully.`,
      });

      navigate("/products");
    } catch (error) {
      console.error('Failed to save product:', error);
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/products")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {isEditing ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? "Update product information" : "Create a new product for your store"}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-3 text-muted-foreground">Loading product data...</span>
        </div>
      ) : (
        <Form {...form}>
          <form className="space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  rules={{ required: "Product title is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Product Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter product title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    rules={{ required: "Price is required", min: { value: 0, message: "Price must be positive" } }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            placeholder="0.00" 
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    rules={{ required: "Category is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="stock"
                  rules={{ required: "Stock quantity is required", min: { value: 0, message: "Stock must be positive" } }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Short Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter a brief description of the product..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Thumbnail */}
                <div>
                  <label className="block text-sm font-medium mb-2">Product Thumbnail</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-4">
                    {thumbnailImage ? (
                      <div className="relative w-32 h-32 mx-auto">
                        <img 
                          src={thumbnailImage.src} 
                          alt={thumbnailImage.alt} 
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => setThumbnailImage(null)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                       <div className="text-center">
                         {isUploadingThumbnail ? (
                           <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                         ) : (
                           <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                         )}
                         <Button 
                           type="button" 
                           variant="outline" 
                           onClick={() => handleImageUpload("thumbnail")}
                           disabled={isUploadingThumbnail}
                         >
                           {isUploadingThumbnail ? (
                             <>
                               <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                               Uploading...
                             </>
                           ) : (
                             "Upload Thumbnail"
                           )}
                         </Button>
                       </div>
                    )}
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-sm font-medium mb-2">Additional Images</label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                    {additionalImages.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image.src} 
                          alt={image.alt} 
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                     <button
                       type="button"
                       onClick={() => handleImageUpload("additional")}
                       disabled={isUploadingAdditional}
                       className="aspect-square border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {isUploadingAdditional ? (
                         <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
                       ) : (
                         <Plus className="h-8 w-8 text-muted-foreground" />
                       )}
                     </button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Attributes */}
            <Card>
              <CardHeader>
                <CardTitle>Product Attributes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new attribute */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Attribute name (e.g., Color, Size)"
                    value={newAttributeName}
                    onChange={(e) => setNewAttributeName(e.target.value)}
                  />
                  <Button type="button" onClick={addAttribute}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>

                {/* Existing attributes */}
                {attributes.map((attribute) => (
                  <div key={attribute.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{attribute.name}</h4>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeAttribute(attribute.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {attribute.values.map((value) => (
                        <Badge key={value} variant="outline" className="gap-1">
                          {value}
                          <button
                            type="button"
                            onClick={() => removeAttributeValue(attribute.id, value)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add value"
                        value={newAttributeValue}
                        onChange={(e) => setNewAttributeValue(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAttributeValue(attribute.id);
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => addAttributeValue(attribute.id)}
                      >
                        Add Value
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Variations */}
            {variations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Product Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {variations.map((variation) => (
                      <div key={variation.id} className="border rounded-lg p-4">
                        <div className="flex flex-wrap gap-2 mb-3">
                          {Object.entries(variation.attributes).map(([name, value]) => (
                            <Badge key={`${name}-${value}`} variant="secondary">
                              {name}: {value}
                            </Badge>
                          ))}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">Price ($)</label>
                            <Input
                              type="number"
                              step="0.01"
                              value={variation.price}
                              onChange={(e) => updateVariation(variation.id, "price", parseFloat(e.target.value) || 0)}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Stock</label>
                            <Input
                              type="number"
                              value={variation.stock}
                              onChange={(e) => updateVariation(variation.id, "stock", parseInt(e.target.value) || 0)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onSubmit(form.getValues(), "draft")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Draft
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => onSubmit(form.getValues(), "published")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Eye className="h-4 w-4 mr-2" />
                )}
                Publish
              </Button>
            </div>
          </form>
        </Form>
      )}
      
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={thumbnailInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, "thumbnail")}
      />
      <input
        type="file"
        ref={additionalInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => handleFileUpload(e, "additional")}
      />
    </div>
  );
}
