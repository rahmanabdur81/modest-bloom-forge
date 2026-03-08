import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

export default function ProductDetail() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");

  // Mock product - will be replaced with DB query
  const product = {
    id: id || "1",
    name: "Premium Georgette Hijab",
    price: 599,
    originalPrice: 799,
    description: "Our bestselling premium georgette hijab. Lightweight, breathable, and perfect for everyday wear. Made from high-quality georgette fabric that drapes beautifully and stays in place throughout the day.",
    category: "Georgette",
    colors: ["Black", "Dusty Rose", "Sage", "Ivory", "Burgundy"],
    sizes: ["Standard (180x70 cm)", "Large (200x80 cm)"],
    images: [""],
    inStock: true,
    stockCount: 25,
    features: [
      "Premium georgette fabric",
      "Lightweight & breathable",
      "Anti-slip texture",
      "Easy to style",
      "Machine washable",
    ],
  };

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: `${product.name} - ${selectedColor}`,
        price: product.price,
        quantity,
        image: product.images[0],
        color: selectedColor,
      },
    });
    toast.success("Added to cart!", { description: `${product.name} × ${quantity}` });
  };

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="container-page py-4">
        <div className="text-xs font-body text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-[3/4] bg-secondary overflow-hidden rounded-lg">
            <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
          </div>

          {/* Details */}
          <div className="py-4">
            <p className="section-subheading mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-6">
              <span className="font-body text-2xl font-bold">₹{product.price}</span>
              {product.originalPrice && (
                <span className="font-body text-lg text-muted-foreground line-through">₹{product.originalPrice}</span>
              )}
              {product.originalPrice && (
                <span className="bg-sale text-sale-foreground text-xs px-2 py-0.5 font-body uppercase tracking-wider rounded">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% Off
                </span>
              )}
            </div>

            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Color selector */}
            <div className="mb-6">
              <p className="font-body text-xs uppercase tracking-wider mb-3">Color: <span className="font-semibold">{selectedColor}</span></p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`px-4 py-2 text-xs font-body uppercase tracking-wider border rounded-md transition-colors ${
                      selectedColor === color
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-8">
              <p className="font-body text-xs uppercase tracking-wider mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-md">
                <button className="p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-4 w-4" />
                </button>
                <span className="px-6 font-body text-sm">{quantity}</span>
                <button className="p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <Button variant="hero" size="xl" className="w-full mb-4" onClick={addToCart}>
              <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart — ₹{product.price * quantity}
            </Button>

            {/* Stock info */}
            <p className="text-xs font-body text-muted-foreground text-center mb-8">
              {product.inStock ? `${product.stockCount} in stock` : "Out of stock"}
            </p>

            {/* Features */}
            <div className="border-t border-border pt-8">
              <h3 className="font-display text-sm font-semibold mb-4">Product Details</h3>
              <ul className="space-y-2">
                {product.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                    <span className="w-1.5 h-1.5 bg-primary rounded-full shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
