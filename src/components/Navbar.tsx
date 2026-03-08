import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/habeeb-logo.png";
import { ShoppingBag, User, Search, Menu, X, Phone, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { totalItems } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/products" },
    { name: "Hijabs", path: "/products?category=hijabs" },
    { name: "Accessories", path: "/products?category=accessories" },
  ];

  return (
    <header className="sticky top-0 z-50">
      {/* Top contact bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container-page flex items-center justify-between py-2 text-xs font-body">
          <div className="flex items-center gap-4">
            <a href="tel:+919123506940" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Phone className="h-3 w-3" />
              <span>+91 91 2350 694 0</span>
            </a>
            <a href="mailto:habeebsparadise@gmail.com" className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity">
              <Mail className="h-3 w-3" />
              <span>habeebsparadise@gmail.com</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Twitter">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className="bg-background border-b border-border">
        <div className="container-page flex items-center justify-between h-14">
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Desktop Nav (left) */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-body text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Logo (center) */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            <img src={logo} alt="Habeeb's Paradise" className="h-9 md:h-11 w-auto object-contain" />
          </Link>

          {/* Actions (right) */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
              <Search className="h-4 w-4" />
            </Button>

            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/cart")}>
              <ShoppingBag className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {user ? (
              <div className="flex items-center gap-1">
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="ghost" size="icon">
                      <User className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={() => signOut()} className="text-xs font-body hidden sm:inline-flex">
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

            <Link to="/wishlist">
              <Button variant="ghost" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Search bar */}
      {searchOpen && (
        <div className="border-b border-border p-4 bg-background animate-slide-up">
          <div className="container-page">
            <input
              type="text"
              placeholder="Search for hijabs, accessories..."
              className="w-full bg-secondary rounded-md px-4 py-3 text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary"
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
        <div className="lg:hidden border-b border-border bg-background animate-slide-up">
          <div className="flex flex-col p-4 gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className="text-sm font-body text-foreground hover:text-primary py-2 border-b border-border"
                onClick={() => setMobileOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <Link to="/track-order" className="text-sm font-body text-foreground hover:text-primary py-2" onClick={() => setMobileOpen(false)}>
              Track Order
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
