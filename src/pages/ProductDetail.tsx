import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import imgGeorgette from "@/assets/product-georgette-hijab.jpg";
import imgJersey from "@/assets/product-jersey-hijab.jpg";
import imgChiffon from "@/assets/product-chiffon-hijab.jpg";
import imgSilkSatin from "@/assets/product-silk-satin.jpg";
import imgCotton from "@/assets/product-cotton-hijab.jpg";
import imgOmbre from "@/assets/product-ombre-jersey.jpg";
import imgModal from "@/assets/product-modal-hijab.jpg";
import imgOrganza from "@/assets/product-organza-hijab.jpg";
import imgTurkish from "@/assets/product-turkish-cotton.jpg";
import imgEmbroidered from "@/assets/product-embroidered-georgette.jpg";
import imgUAE from "@/assets/product-uae-luxury.jpg";
import imgKhimar from "@/assets/product-khimar.jpg";
import imgMuna from "@/assets/product-muna-satin.jpg";
import imgCap from "@/assets/product-hijab-cap.jpg";
import imgPins from "@/assets/product-magnetic-pins.jpg";
import imgHamper from "@/assets/product-gift-hamper.jpg";

const productMap: Record<string, any> = {
  "1": { name: "Premium Georgette Hijab", price: 599, originalPrice: 799, category: "Georgette", images: [imgGeorgette], stockCount: 25 },
  "2": { name: "Classic Jersey Hijab", price: 449, category: "Jersey", images: [imgJersey], stockCount: 42 },
  "3": { name: "Korean Chiffon Hijab", price: 549, category: "Chiffon", images: [imgChiffon], stockCount: 18 },
  "4": { name: "Silk Satin Hijab", price: 899, category: "Silk Satin", images: [imgSilkSatin], stockCount: 15 },
  "5": { name: "Cotton 2.0 Hijab", price: 349, originalPrice: 549, category: "Cotton", images: [imgCotton], stockCount: 30 },
  "6": { name: "Ombre Premium Jersey", price: 649, category: "Jersey", images: [imgOmbre], stockCount: 12 },
  "7": { name: "Modal Classic Hijab", price: 399, category: "Modal", images: [imgModal], stockCount: 35 },
  "8": { name: "Organza Hijab", price: 799, category: "Organza", images: [imgOrganza], stockCount: 8 },
  "9": { name: "Turkish Cotton Hijab", price: 499, category: "Cotton", images: [imgTurkish], stockCount: 22 },
  "10": { name: "Embroidered Georgette", price: 699, category: "Georgette", images: [imgEmbroidered], stockCount: 10 },
  "11": { name: "UAE Luxury Hijab", price: 1299, category: "Luxury", images: [imgUAE], stockCount: 5 },
  "12": { name: "Fish Tail Khimar", price: 899, originalPrice: 1099, category: "Khimars", images: [imgKhimar], stockCount: 14 },
  "13": { name: "Muna Satin Hijab", price: 749, category: "Satin", images: [imgMuna], stockCount: 20 },
  "14": { name: "Hijab Cap", price: 199, category: "Accessories", images: [imgCap], stockCount: 50 },
  "15": { name: "Magnetic Pins Set", price: 149, category: "Accessories", images: [imgPins], stockCount: 100 },
  "16": { name: "Gift Hamper Premium", price: 1999, category: "Gift Hampers", images: [imgHamper], stockCount: 7 },
};

export default function ProductDetail() {
  const { id } = useParams();
  const { dispatch } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState("Black");

  const data = productMap[id || "1"] || productMap["1"];
  const product = {
    id: id || "1",
    ...data,
    description: "Premium quality fabric with beautiful drape and finish. Lightweight, breathable, and perfect for everyday wear. Stays in place throughout the day with anti-slip texture.",
    colors: ["Black", "Dusty Rose", "Sage", "Ivory", "Burgundy"],
    inStock: data.stockCount > 0,
    features: [
      "Premium quality fabric",
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
          <Link to="/products" className="hover:text-primary">Shop</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </div>
      </div>

      <div className="container-page pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Image */}
          <div className="aspect-square bg-secondary overflow-hidden rounded-lg">
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
                {product.colors.map((color: string) => (
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
                {product.features.map((f: string) => (
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
