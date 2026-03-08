import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, User, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { totalItems, dispatch } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const categories = [
    { name: "New Arrivals", path: "/products?category=new-arrivals" },
    { name: "Hijabs", path: "/products?category=hijabs" },
    { name: "Khimars", path: "/products?category=khimars" },
    { name: "Accessories", path: "/products?category=accessories" },
    { name: "Gift Hampers", path: "/products?category=gift-hampers" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      {/* Top announcement bar */}
      <div className="bg-primary text-primary-foreground text-center py-2 text-xs tracking-[0.15em] uppercase font-body">
        Free shipping on orders above ₹798 | Cash On Delivery Available
      </div>

      <nav className="container-page flex items-center justify-between h-16">
        {/* Mobile menu button */}
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link to="/" className="font-display text-xl md:text-2xl font-bold tracking-tight">
          MODEST GRACE
        </Link>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              className="text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground transition-colors font-body"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-4 w-4" />
          </Button>

          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="text-xs uppercase tracking-wider hidden sm:inline-flex">
                    Admin
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs uppercase tracking-wider">
                Logout
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          )}

          <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-gold text-gold-foreground text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-t border-border p-4 bg-background animate-slide-up">
          <div className="container-page">
            <input
              type="text"
              placeholder="Search for hijabs, accessories..."
              className="w-full bg-secondary rounded-sm px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  navigate(`/products?search=${(e.target as HTMLInputElement).value}`);
                  setSearchOpen(false);
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-background animate-slide-up">
          <div className="flex flex-col p-4 gap-3">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={cat.path}
                className="text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground py-2 border-b border-border font-body"
                onClick={() => setMobileOpen(false)}
              >
                {cat.name}
              </Link>
            ))}
            <Link to="/track-order" className="text-sm uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground py-2 font-body" onClick={() => setMobileOpen(false)}>
              Track Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
