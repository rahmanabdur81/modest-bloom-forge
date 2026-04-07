import { Link, useNavigate } from "react-router-dom";
import logo from "@/assets/habeeb-logo.png";
import { Phone, Mail, ShoppingBag, User, Search, Heart, LogOut, Shield, Package, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useEffect, useState } from "react";
import SearchWithSuggestions from "@/components/SearchWithSuggestions";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

type NavItem = {
  name: string;
  path: string;
  children?: { name: string; path: string }[];
};

const navLinks: NavItem[] = [
  { name: "Home", path: "/" },
  { name: "Shop", path: "/products" },
  {
    name: "Hijabs",
    path: "/products?category=hijabs",
    children: [
      { name: "All Hijabs", path: "/products?category=hijabs" },
      { name: "Silk Hijabs", path: "/products?category=hijabs&sub=silk" },
      { name: "Cotton Hijabs", path: "/products?category=hijabs&sub=cotton" },
      { name: "Chiffon Hijabs", path: "/products?category=hijabs&sub=chiffon" },
      { name: "Jersey Hijabs", path: "/products?category=hijabs&sub=jersey" },
    ],
  },
  {
    name: "Abayas",
    path: "/products?category=abayas",
    children: [
      { name: "All Abayas", path: "/products?category=abayas" },
      { name: "Classic Abayas", path: "/products?category=abayas&sub=classic" },
      { name: "Embroidered Abayas", path: "/products?category=abayas&sub=embroidered" },
      { name: "Open Abayas", path: "/products?category=abayas&sub=open" },
    ],
  },
  {
    name: "Accessories",
    path: "/products?category=accessories",
    children: [
      { name: "All Accessories", path: "/products?category=accessories" },
      { name: "Pins & Brooches", path: "/products?category=accessories&sub=pins" },
      { name: "Underscarves", path: "/products?category=accessories&sub=underscarves" },
      { name: "Hijab Caps", path: "/products?category=accessories&sub=caps" },
    ],
  },
  { name: "New Arrivals", path: "/products?category=new" },
];

function NavDropdown({ item }: { item: NavItem }) {
  const [open, setOpen] = useState(false);
  let timeout: ReturnType<typeof setTimeout>;

  const handleEnter = () => {
    clearTimeout(timeout);
    setOpen(true);
  };
  const handleLeave = () => {
    timeout = setTimeout(() => setOpen(false), 150);
  };

  if (!item.children) {
    return (
      <Link
        to={item.path}
        className="text-sm font-body text-foreground hover:text-primary transition-colors whitespace-nowrap py-2"
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <Link
        to={item.path}
        className="text-sm font-body text-foreground hover:text-primary transition-colors whitespace-nowrap py-2 flex items-center gap-1"
      >
        {item.name}
        <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </Link>

      {/* Dropdown */}
      <div
        className={`absolute top-full left-0 pt-1 z-50 transition-all duration-200 ${
          open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
        }`}
      >
        <div className="bg-background border border-border rounded-md shadow-lg min-w-[200px] py-2">
          {item.children.map((child) => (
            <Link
              key={child.name}
              to={child.path}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm font-body text-foreground hover:bg-accent hover:text-primary transition-colors"
            >
              {child.name}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();
  const { totalItems, dispatch } = useCart();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setSearchOpen((prev) => !prev);
    window.addEventListener("toggle-search", handler);
    return () => window.removeEventListener("toggle-search", handler);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40">
        {/* Contact strip */}
        <div className="bg-primary text-primary-foreground">
          <div className="flex items-center justify-between px-4 py-1.5 text-[10px] sm:text-xs font-body">
            <div className="flex items-center gap-2 sm:gap-4">
              <a href="tel:+919123506940" className="flex items-center gap-1 hover:opacity-80 transition-opacity">
                <Phone className="h-3 w-3 shrink-0" />
                <span className="hidden sm:inline">+91 91 2350 694 0</span>
                <span className="sm:hidden">Call Us</span>
              </a>
              <a href="mailto:habeebsparadise@gmail.com" className="hidden sm:flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                <Mail className="h-3 w-3" />
                <span>habeebsparadise@gmail.com</span>
              </a>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Facebook">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Instagram">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity" aria-label="Twitter">
                <svg className="h-3 w-3 sm:h-3.5 sm:w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="bg-background border-b border-border">
          <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-6">
            {/* Mobile: hamburger trigger */}
            {isMobile && (
              <SidebarTrigger className="h-9 w-9" />
            )}

            {/* Desktop: nav links with dropdowns (left) */}
            {!isMobile && (
              <div className="flex items-center gap-5">
                {navLinks.map((link) => (
                  <NavDropdown key={link.name} item={link} />
                ))}
              </div>
            )}

            {/* Logo (center) */}
            <Link to="/" className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0">
              <img src={logo} alt="Habeeb's Paradise" className="h-7 sm:h-9 md:h-10 w-auto object-contain" />
            </Link>

            {/* Actions (right) */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => setSearchOpen(!searchOpen)}>
                <Search className="h-4 w-4" />
              </Button>

              {!isMobile && (
                <Link to="/track-order">
                  <Button variant="ghost" size="icon" className="h-9 w-9" title="Track Order">
                    <Package className="h-4 w-4" />
                  </Button>
                </Link>
              )}

              <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9 relative" onClick={() => dispatch({ type: "OPEN_CART" })}>
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center animate-scale-in">
                    {totalItems}
                  </span>
                )}
              </Button>

              <Link to="/wishlist">
                <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
                  <Heart className="h-4 w-4" />
                </Button>
              </Link>

              {!isMobile && user ? (
                <>
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <Shield className="h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="text-xs font-body">
                    Logout
                  </Button>
                </>
              ) : !isMobile && !user ? (
                <Link to="/auth">
                  <Button variant="ghost" size="icon" className="h-9 w-9">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              ) : null}
            </div>
          </div>
        </nav>
      </header>

      {searchOpen && <SearchWithSuggestions onClose={() => setSearchOpen(false)} />}
    </>
  );
}
