import { useParams, Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag, Heart, Check } from "lucide-react";
import StickyAddToCart from "@/components/StickyAddToCart";
import { toast } from "sonner";
import { useProduct, getProductImage } from "@/hooks/useProducts";
import { useAuth } from "@/context/AuthContext";
import { useWishlist, useToggleWishlist } from "@/hooks/useWishlist";
import ReviewSection from "@/components/ReviewSection";

const colorHexMap: Record<string, string> = {
  "Black": "#1a1a1a",
  "White": "#f5f5f5",
  "Ivory": "#fffff0",
  "Beige": "#d4b896",
  "Nude": "#e3c9a8",
  "Grey": "#808080",
  "Navy": "#1b2a4a",
  "Teal": "#2a7a7a",
  "Burgundy": "#6d1a36",
  "Emerald": "#1a6b4a",
  "Gold": "#c5a44e",
  "Silver": "#b8b8b8",
  "Bronze": "#a67b4a",
  "Champagne": "#d4c39a",
  "Dusty Rose": "#c9a0a0",
  "Dusty Pink": "#d4a0a0",
  "Blush": "#e8b4b4",
  "Sage": "#8fae8b",
  "Mauve": "#b07aa1",
  "Lavender": "#9b7ec8",
  "Olive": "#6b6b3a",
  "Rust": "#b45a2e",
  "Tan": "#c4a776",
  "Brown": "#6b4226",
  "Rose Gold": "#c9856b",
  "Royal Blue": "#2a4a8b",
  "Forest Green": "#2a5a2a",
  "Navy Gold": "#1b2a4a",
  "Black Gold": "#1a1a1a",
  "Maroon Gold": "#5a1a2a",
  "Forest Green Gold": "#2a5a2a",
  "Blue Ombre": "#4a7ab5",
  "Pink Ombre": "#d48aa0",
  "Grey Ombre": "#8a8a8a",
  "Green Ombre": "#5a9a6b",
  "Classic": "#2a2a2a",
  "Premium": "#4a3a2a",
  "Deluxe": "#6b4a2e",
  "Mixed Set": "linear-gradient(135deg, #c5a44e 0%, #b8b8b8 50%, #c9856b 100%)",
};

export default function ProductDetail() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [showStickyCart, setShowStickyCart] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useProduct(id || "");
  const { data: wishlistIds } = useWishlist();
  const toggleWishlist = useToggleWishlist();

  const isWished = product ? wishlistIds?.includes(product.id) || false : false;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowStickyCart(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (addToCartRef.current) observer.observe(addToCartRef.current);
    return () => observer.disconnect();
  }, [product]);

  const isWished = product ? wishlistIds?.includes(product.id) || false : false;

  if (isLoading) {
    return (
      <div className="min-h-screen container-page py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-secondary rounded-lg animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-secondary rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-secondary rounded w-2/3 animate-pulse" />
            <div className="h-6 bg-secondary rounded w-1/4 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-4">Product not found</h1>
          <Link to="/products"><Button variant="hero">Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  const displayImage = getProductImage(product.image_url);
  const colors = product.colors || ["Black"];
  if (!selectedColor && colors.length > 0) setSelectedColor(colors[0]);

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: product.id,
        name: `${product.name} - ${selectedColor}`,
        price: product.price,
        quantity,
        image: displayImage,
        color: selectedColor,
      },
    });
    toast.success("Added to cart!", { description: `${product.name} × ${quantity}` });
  };

  const handleWishlist = () => {
    if (!user) { toast.error("Please login to add to wishlist"); return; }
    toggleWishlist.mutate({ productId: product.id, isWished });
  };

  return (
    <div className="min-h-screen">
      <div className="container-page py-4">
        <div className="text-xs font-body text-muted-foreground">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span className="mx-2">/</span>
          <Link to="/products" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          <div className="aspect-square bg-secondary overflow-hidden rounded-lg relative">
            <img src={displayImage} alt={product.name} className="w-full h-full object-cover transition-all duration-500" />
            <div
              className="absolute inset-0 mix-blend-multiply opacity-30 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }}
            />
            <div
              className="absolute inset-0 mix-blend-soft-light opacity-20 transition-all duration-500 pointer-events-none"
              style={{ backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }}
            />
          </div>

          <div className="py-4">
            <p className="section-subheading mb-2">{product.category}</p>
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-4">{product.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-body text-2xl font-bold">₹{product.price}</span>
              {product.original_price && (
                <span className="font-body text-lg text-muted-foreground line-through">₹{product.original_price}</span>
              )}
              {product.original_price && (
                <span className="bg-sale text-sale-foreground text-xs px-2 py-0.5 font-body uppercase tracking-wider rounded">
                  {Math.round((1 - product.price / product.original_price) * 100)}% Off
                </span>
              )}
            </div>

            {product.avg_rating && Number(product.avg_rating) > 0 && (
              <div className="flex items-center gap-1 mb-4">
                <span className="text-gold">★</span>
                <span className="text-sm font-body">{Number(product.avg_rating).toFixed(1)} ({product.review_count} reviews)</span>
              </div>
            )}

            <p className="font-body text-muted-foreground text-sm leading-relaxed mb-8">{product.description}</p>

            <div className="mb-6">
              <p className="font-body text-xs uppercase tracking-wider mb-3">Color: <span className="font-semibold">{selectedColor}</span></p>
              <div className="flex gap-3 flex-wrap">
                {colors.map((color) => {
                  const hex = colorHexMap[color] || "#ccc";
                  const isGradient = hex.startsWith("linear");
                  const isLight = ["White", "Ivory", "Beige", "Nude", "Champagne", "Silver"].includes(color);
                  return (
                    <button
                      key={color}
                      title={color}
                      className={`relative w-9 h-9 rounded-full transition-all duration-200 ${
                        selectedColor === color
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110"
                          : "hover:scale-110"
                      } ${isLight ? "border border-border" : ""}`}
                      style={{ background: isGradient ? hex : hex }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Check className={`absolute inset-0 m-auto h-4 w-4 ${isLight ? "text-foreground" : "text-white"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

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

            <div className="flex gap-3 mb-4">
              <Button variant="hero" size="xl" className="flex-1" onClick={addToCart}>
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart — ₹{product.price * quantity}
              </Button>
              <Button
                variant="outline"
                size="xl"
                onClick={handleWishlist}
                className={isWished ? "text-primary border-primary" : ""}
              >
                <Heart className={`h-4 w-4 ${isWished ? "fill-current" : ""}`} />
              </Button>
            </div>

            <p className="text-xs font-body text-muted-foreground text-center mb-8">
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </p>

            {product.features && product.features.length > 0 && (
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
            )}

            <ReviewSection
              productId={product.id}
              avgRating={Number(product.avg_rating) || 0}
              reviewCount={product.review_count || 0}
            />
          </div>
        </div>
      </div>

      <StickyAddToCart
        productName={product.name}
        price={product.price}
        onAddToCart={addToCart}
        visible={showStickyCart}
      />
    </div>
  );
}
