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
import SizeGuideModal from "@/components/SizeGuideModal";
import RecentlyViewed from "@/components/RecentlyViewed";
import { addToRecentlyViewed } from "@/hooks/useRecentlyViewed";
import ShareProduct from "@/components/ShareProduct";
import DeliveryEstimator from "@/components/DeliveryEstimator";
import BackInStockAlert from "@/components/BackInStockAlert";
import { useProductVariations } from "@/hooks/useProductVariations";

const colorHexMap: Record<string, string> = {
  "Black": "#1a1a1a", "White": "#f5f5f5", "Ivory": "#fffff0", "Beige": "#d4b896",
  "Nude": "#e3c9a8", "Grey": "#808080", "Navy": "#1b2a4a", "Teal": "#2a7a7a",
  "Burgundy": "#6d1a36", "Emerald": "#1a6b4a", "Gold": "#c5a44e", "Silver": "#b8b8b8",
  "Bronze": "#a67b4a", "Champagne": "#d4c39a", "Dusty Rose": "#c9a0a0",
  "Dusty Pink": "#d4a0a0", "Blush": "#e8b4b4", "Sage": "#8fae8b", "Mauve": "#b07aa1",
  "Lavender": "#9b7ec8", "Olive": "#6b6b3a", "Rust": "#b45a2e", "Tan": "#c4a776",
  "Brown": "#6b4226", "Rose Gold": "#c9856b", "Royal Blue": "#2a4a8b",
  "Forest Green": "#2a5a2a", "Navy Gold": "#1b2a4a", "Black Gold": "#1a1a1a",
  "Maroon Gold": "#5a1a2a", "Forest Green Gold": "#2a5a2a",
  "Blue Ombre": "#4a7ab5", "Pink Ombre": "#d48aa0", "Grey Ombre": "#8a8a8a",
  "Green Ombre": "#5a9a6b", "Classic": "#2a2a2a", "Premium": "#4a3a2a", "Deluxe": "#6b4a2e",
  "Mixed Set": "linear-gradient(135deg, #c5a44e 0%, #b8b8b8 50%, #c9856b 100%)",
};

export default function ProductDetail() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const { user } = useAuth();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("");
  const [showStickyCart, setShowStickyCart] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [isZooming, setIsZooming] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const addToCartRef = useRef<HTMLDivElement>(null);

  const { data: product, isLoading } = useProduct(id || "");
  const { data: variations = [] } = useProductVariations(product?.id);
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

  useEffect(() => {
    if (product) {
      addToRecentlyViewed({
        id: product.id, slug: product.slug, name: product.name,
        price: product.price, image_url: product.image_url, category: product.category,
      });
    }
  }, [product]);

  if (isLoading) {
    return (
      <div className="min-h-screen container-page py-8 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
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
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-display text-xl sm:text-2xl mb-4">Product not found</h1>
          <Link to="/products"><Button variant="hero">Back to Shop</Button></Link>
        </div>
      </div>
    );
  }

  const hasVariations = variations.length > 0;
  const variationColors = variations.map((v) => v.color);
  const colors = hasVariations ? variationColors : (product.colors || ["Black"]);
  if (!selectedColor && colors.length > 0) setSelectedColor(colors[0]);

  const selectedVariation = hasVariations
    ? variations.find((v) => v.color === selectedColor) ?? variations[0]
    : null;

  const displayImage = selectedVariation
    ? getProductImage(selectedVariation.image_url)
    : getProductImage(product.image_url);

  const effectivePrice = selectedVariation?.price ?? product.price;
  const effectiveStock = selectedVariation?.stock ?? product.stock;

  const addToCart = () => {
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: selectedVariation ? `${product.id}:${selectedVariation.id}` : product.id,
        name: `${product.name} - ${selectedColor}`,
        price: effectivePrice, quantity, image: displayImage, color: selectedColor,
      },
    });
    dispatch({ type: "OPEN_CART" });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  };

  const handleWishlist = () => {
    if (!user) { toast.error("Please login to add to wishlist"); return; }
    toggleWishlist.mutate({ productId: product.id, isWished });
  };

  return (
    <div className="min-h-screen">
      <div className="container-page px-4 pb-8 sm:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 lg:gap-16">
          {/* Desktop image with zoom */}
          <div
            className="aspect-square bg-secondary overflow-hidden rounded-lg relative cursor-zoom-in hidden md:block"
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setZoomPos({ x: ((e.clientX - rect.left) / rect.width) * 100, y: ((e.clientY - rect.top) / rect.height) * 100 });
            }}
          >
            <img src={displayImage} alt={`${product.name} - ${selectedColor}`}
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                filter: !hasVariations && selectedColor ? 'saturate(0.15) brightness(1.05)' : 'none',
                transform: isZooming ? 'scale(2)' : 'scale(1)',
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              }}
            />
            {!hasVariations && (
              <>
                <div className="absolute inset-0 mix-blend-color transition-all duration-500 pointer-events-none"
                  style={{ opacity: 0.75, backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }} />
                <div className="absolute inset-0 mix-blend-multiply transition-all duration-500 pointer-events-none"
                  style={{ opacity: 0.35, backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }} />
              </>
            )}
          </div>

          {/* Mobile image */}
          <div className="aspect-square bg-secondary overflow-hidden rounded-lg relative md:hidden">
            <img src={displayImage} alt={`${product.name} - ${selectedColor}`} className="w-full h-full object-cover transition-all duration-500"
              style={{ filter: !hasVariations && selectedColor ? 'saturate(0.15) brightness(1.05)' : 'none' }} />
            {!hasVariations && (
              <>
                <div className="absolute inset-0 mix-blend-color transition-all duration-500 pointer-events-none"
                  style={{ opacity: 0.75, backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }} />
                <div className="absolute inset-0 mix-blend-multiply transition-all duration-500 pointer-events-none"
                  style={{ opacity: 0.35, backgroundColor: colorHexMap[selectedColor]?.startsWith("linear") ? "transparent" : (colorHexMap[selectedColor] || "transparent") }} />
              </>
            )}
          </div>

          <div className="py-2 sm:py-4">
            <p className="section-subheading mb-1 sm:mb-2 text-xs sm:text-sm">{product.category}</p>
            <h1 className="font-display text-xl sm:text-2xl md:text-3xl font-semibold mb-3 sm:mb-4">{product.name}</h1>

            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <span className="font-body text-xl sm:text-2xl font-bold">₹{effectivePrice}</span>
              {product.original_price && (
                <span className="font-body text-sm sm:text-lg text-muted-foreground line-through">₹{product.original_price}</span>
              )}
              {product.original_price && (
                <span className="bg-sale text-sale-foreground text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 font-body uppercase tracking-wider rounded">
                  {Math.round((1 - effectivePrice / product.original_price) * 100)}% Off
                </span>
              )}
            </div>

            {product.avg_rating && Number(product.avg_rating) > 0 && (
              <div className="flex items-center gap-1 mb-3 sm:mb-4">
                <span className="text-gold text-sm">★</span>
                <span className="text-xs sm:text-sm font-body">{Number(product.avg_rating).toFixed(1)} ({product.review_count} reviews)</span>
              </div>
            )}

            <p className="font-body text-muted-foreground text-xs sm:text-sm leading-relaxed mb-4 sm:mb-8">{product.description}</p>

            {/* Colors */}
            <div className="mb-4 sm:mb-6">
              <p className="font-body text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3">Color: <span className="font-semibold">{selectedColor}</span></p>
              <div className="flex gap-2 sm:gap-3 flex-wrap">
                {colors.map((color) => {
                  const hex = colorHexMap[color] || "#ccc";
                  const isGradient = hex.startsWith("linear");
                  const isLight = ["White", "Ivory", "Beige", "Nude", "Champagne", "Silver"].includes(color);
                  return (
                    <button key={color} title={color}
                      className={`relative w-7 h-7 sm:w-9 sm:h-9 rounded-full transition-all duration-200 ${
                        selectedColor === color ? "ring-2 ring-primary ring-offset-2 ring-offset-background scale-110" : "hover:scale-110"
                      } ${isLight ? "border border-border" : ""}`}
                      style={{ background: isGradient ? hex : hex }}
                      onClick={() => setSelectedColor(color)}
                    >
                      {selectedColor === color && (
                        <Check className={`absolute inset-0 m-auto h-3 w-3 sm:h-4 sm:w-4 ${isLight ? "text-foreground" : "text-white"}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4 sm:mb-8">
              <p className="font-body text-[10px] sm:text-xs uppercase tracking-wider mb-2 sm:mb-3">Quantity</p>
              <div className="inline-flex items-center border border-border rounded-md">
                <button className="p-2 sm:p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(Math.max(1, quantity - 1))}>
                  <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
                <span className="px-4 sm:px-6 font-body text-xs sm:text-sm">{quantity}</span>
                <button className="p-2 sm:p-3 hover:bg-secondary transition-colors" onClick={() => setQuantity(quantity + 1)}>
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                </button>
              </div>
            </div>

            {/* Add to cart */}
            <div ref={addToCartRef} className="flex gap-2 sm:gap-3 mb-3 sm:mb-4">
              <Button variant="hero" size="lg" className={`flex-1 text-xs sm:text-sm h-10 sm:h-12 transition-all duration-300 ${justAdded ? "bg-primary/90" : ""}`} onClick={addToCart}>
                {justAdded ? (
                  <><Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Added to Cart!</>
                ) : (
                  <><ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Add to Cart — ₹{effectivePrice * quantity}</>
                )}
              </Button>
              <Button variant="outline" size="lg" className="h-10 sm:h-12 w-10 sm:w-12 p-0" onClick={handleWishlist}>
                <Heart className={`h-4 w-4 ${isWished ? "fill-current text-primary" : ""}`} />
              </Button>
            </div>

            <div className="flex items-center justify-between mb-4 sm:mb-8">
              <p className="text-[10px] sm:text-xs font-body text-muted-foreground">
                {effectiveStock > 0 ? `${effectiveStock} in stock` : "Out of stock"}
              </p>
              <div className="flex items-center gap-2 sm:gap-4">
                <ShareProduct productName={product.name} price={effectivePrice} />
                <SizeGuideModal />
              </div>
            </div>

            {effectiveStock === 0 && <BackInStockAlert productName={product.name} productId={product.id} />}
            <DeliveryEstimator />

            {product.features && product.features.length > 0 && (
              <div className="border-t border-border pt-4 sm:pt-8">
                <h3 className="font-display text-xs sm:text-sm font-semibold mb-3 sm:mb-4">Product Details</h3>
                <ul className="space-y-1.5 sm:space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs sm:text-sm font-body text-muted-foreground">
                      <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-primary rounded-full shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ReviewSection productId={product.id} avgRating={Number(product.avg_rating) || 0} reviewCount={product.review_count || 0} />
          </div>
        </div>
      </div>

      <RecentlyViewed excludeId={product.id} />
      <StickyAddToCart productName={product.name} price={product.price} onAddToCart={addToCart} visible={showStickyCart} />
    </div>
  );
}
