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
  Tag,
  Sparkles,
  Shirt,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
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

const mainNav = [
  { title: "Home", url: "/", icon: Home },
  { title: "Shop", url: "/products", icon: ShoppingBag },
  { title: "Hijabs", url: "/products?category=hijabs", icon: Tag },
  { title: "Abayas", url: "/products?category=abayas", icon: Shirt },
  { title: "Accessories", url: "/products?category=accessories", icon: Sparkles },
  { title: "New Arrivals", url: "/products?category=new", icon: Sparkles },
];

const utilityNav = [
  { title: "Wishlist", url: "/wishlist", icon: Heart },
  { title: "Track Order", url: "/track-order", icon: Package },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { totalItems, dispatch } = useCart();

  const isActive = (url: string) => {
    if (url === "/") return location.pathname === "/";
    return location.pathname + location.search === url || location.pathname.startsWith(url.split("?")[0]) && url !== "/products" ? location.search === url.split("?")[1] ? true : false : location.pathname === url;
  };

  const isActiveSimple = (url: string) => {
    if (url === "/") return location.pathname === "/";
    if (url.includes("?")) {
      return location.pathname + location.search === url;
    }
    return location.pathname === url;
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
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
        {/* Search shortcut */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => {
                    // Dispatch a custom event for search
                    window.dispatchEvent(new CustomEvent("toggle-search"));
                  }}
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

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Shop</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveSimple(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Utility */}
        <SidebarGroup>
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Cart */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => dispatch({ type: "OPEN_CART" })}
                  tooltip="Cart"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {!collapsed && (
                    <span className="flex items-center gap-2">
                      Cart
                      {totalItems > 0 && (
                        <Badge variant="default" className="h-5 min-w-5 text-[10px] px-1.5">
                          {totalItems}
                        </Badge>
                      )}
                    </span>
                  )}
                  {collapsed && totalItems > 0 && (
                    <Badge variant="default" className="absolute -top-1 -right-1 h-4 min-w-4 text-[9px] px-1">
                      {totalItems}
                    </Badge>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {utilityNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveSimple(item.url)}
                    tooltip={item.title}
                  >
                    <Link to={item.url}>
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={isActiveSimple("/admin")}
                    tooltip="Admin Dashboard"
                  >
                    <Link to="/admin">
                      <Shield className="h-4 w-4" />
                      {!collapsed && <span>Admin Dashboard</span>}
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
              <SidebarMenuButton
                onClick={async () => await signOut()}
                tooltip="Logout"
              >
                <LogOut className="h-4 w-4" />
                {!collapsed && <span>Logout</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Sign In">
                <Link to="/auth">
                  <User className="h-4 w-4" />
                  {!collapsed && <span>Sign In</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
