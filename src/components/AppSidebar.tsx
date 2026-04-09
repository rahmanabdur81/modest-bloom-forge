import { Link, useLocation } from "react-router-dom";
import logo from "@/assets/habeeb-logo.png";
import {
  Home,
  ShoppingBag,
  Heart,
  Package,
  Shield,
  User,
  LogOut,
  Search,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCategories, buildCategoryTree } from "@/hooks/useCategories";
import { useMemo, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Build dynamic categories from DB categories table
function useDynamicCategories() {
  const { data: categories } = useCategories();

  return useMemo(() => {
    if (!categories || categories.length === 0) {
      return [
        { name: "Hijabs", path: "/products?category=Hijabs", subcategories: [] },
        { name: "Accessories", path: "/products?category=Accessories", subcategories: [] },
      ];
    }

    const tree = buildCategoryTree(categories);
    return tree.map((parent) => ({
      name: parent.name,
      path: `/products?category=${encodeURIComponent(parent.name)}`,
      subcategories: parent.children.map((child) => ({
        name: child.name,
        path: `/products?category=${encodeURIComponent(child.name)}`,
      })),
    }));
  }, [categories]);
}

function CategoryCollapsible({
  category,
  isActiveSimple,
}: {
  category: { name: string; path: string; subcategories: { name: string; path: string }[] };
  isActiveSimple: (url: string) => boolean;
}) {
  const [open, setOpen] = useState(false);
  const hasSubs = category.subcategories.length > 0;

  if (!hasSubs) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActiveSimple(category.path)} tooltip={category.name}>
          <Link to={category.path}>
            <ShoppingBag className="h-4 w-4" />
            <span>{category.name}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={category.name} className="justify-between">
            <span className="flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              <span>{category.name}</span>
            </span>
            <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-6 space-y-0.5 mt-1">
          <Link
            to={category.path}
            className={`block text-sm py-1.5 px-2 rounded-md transition-colors ${
              isActiveSimple(category.path) ? "bg-accent text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            All {category.name}
          </Link>
          {category.subcategories.map((sub) => (
            <Link
              key={sub.name}
              to={sub.path}
              className={`block text-sm py-1.5 px-2 rounded-md transition-colors ${
                isActiveSimple(sub.path) ? "bg-accent text-primary font-medium" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
              }`}
            >
              {sub.name}
            </Link>
          ))}
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}

export function AppSidebar() {
  const isMobile = useIsMobile();

  // Don't render sidebar on desktop — desktop uses the TopBar nav
  if (!isMobile) return null;

  return <AppSidebarContent />;
}

function AppSidebarContent() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems, dispatch } = useCart();
  const categories = useDynamicCategories();

  const isActiveSimple = (url: string) => {
    if (url === "/") return location.pathname === "/";
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="Habeeb's Paradise"
            className={`${collapsed ? "h-8 w-8 object-contain" : "h-10 w-auto"} transition-all duration-200`}
          />
          {!collapsed && (
            <span className="font-display text-lg font-semibold text-sidebar-foreground">
              Habeeb's Paradise
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {/* Search */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => window.dispatchEvent(new CustomEvent("toggle-search"))}
                  tooltip="Search"
                >
                  <Search className="h-4 w-4" />
                  {!collapsed && <span>Search</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main Nav */}
        <SidebarGroup>
          <SidebarGroupLabel>Shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveSimple("/")} tooltip="Home">
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveSimple("/products")} tooltip="All Products">
                  <Link to="/products">
                    <ShoppingBag className="h-4 w-4" />
                    <span>All Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Dynamic categories */}
              {categories.map((cat) => (
                <CategoryCollapsible key={cat.name} category={cat} isActiveSimple={isActiveSimple} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Account */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => dispatch({ type: "OPEN_CART" })} tooltip="Cart">
                  <ShoppingBag className="h-4 w-4" />
                  <span className="flex items-center gap-2">
                    Cart
                    {totalItems > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 text-[10px] px-1.5">
                        {totalItems}
                      </Badge>
                    )}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveSimple("/wishlist")} tooltip="Wishlist">
                  <Link to="/wishlist">
                    <Heart className="h-4 w-4" />
                    <span>Wishlist</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActiveSimple("/track-order")} tooltip="Track Order">
                  <Link to="/track-order">
                    <Package className="h-4 w-4" />
                    <span>Track Order</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={isActiveSimple("/admin")} tooltip="Admin Dashboard">
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <SidebarMenuButton onClick={async () => await signOut()} tooltip="Logout">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign In">
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
