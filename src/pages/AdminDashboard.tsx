import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Package, ShoppingBag, Plus, Edit, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

// Mock data
const mockOrders = [
  { id: "1", trackingId: "MG001ABC", customer: "Fatima Ahmed", total: 1248, status: "processing", date: "2026-03-07", items: 3 },
  { id: "2", trackingId: "MG002DEF", customer: "Aisha Khan", total: 899, status: "shipped", date: "2026-03-06", items: 1 },
  { id: "3", trackingId: "MG003GHI", customer: "Zainab Ali", total: 2147, status: "delivered", date: "2026-03-04", items: 4 },
];

const mockProducts = [
  { id: "1", name: "Premium Georgette Hijab", price: 599, stock: 25, category: "Georgette" },
  { id: "2", name: "Classic Jersey Hijab", price: 449, stock: 42, category: "Jersey" },
  { id: "3", name: "Korean Chiffon Hijab", price: 549, stock: 18, category: "Chiffon" },
  { id: "4", name: "Silk Satin Hijab", price: 899, stock: 8, category: "Silk" },
];

type Tab = "overview" | "products" | "orders";

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  // For development, allow access even if isAdmin is false (no DB tables yet)

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: ShoppingBag },
    { key: "products" as Tab, label: "Products", icon: Package },
    { key: "orders" as Tab, label: "Orders", icon: Users },
  ];

  const statusColors: Record<string, string> = {
    processing: "bg-gold/20 text-gold",
    shipped: "bg-blue-100 text-blue-700",
    "out-for-delivery": "bg-orange-100 text-orange-700",
    delivered: "bg-green-100 text-green-700",
  };

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container-page py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground">Manage your store</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider">View Store</Button>
          </Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.key}
                variant={activeTab === tab.key ? "default" : "ghost"}
                size="sm"
                className="text-xs uppercase tracking-wider shrink-0"
                onClick={() => setActiveTab(tab.key)}
              >
                <Icon className="h-3 w-3 mr-1" /> {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue", value: "₹45,294", change: "+12% this month" },
              { label: "Total Orders", value: "127", change: "23 pending" },
              { label: "Products", value: "64", change: "8 low stock" },
            ].map((stat) => (
              <div key={stat.label} className="bg-card p-6 border border-border">
                <p className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">{stat.label}</p>
                <p className="font-display text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs font-body text-muted-foreground">{stat.change}</p>
              </div>
            ))}
          </div>
        )}

        {/* Products */}
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between mb-4">
              <h2 className="font-display text-lg font-semibold">Products</h2>
              <Button variant="hero" size="sm" onClick={() => toast.info("Product form coming soon!")}>
                <Plus className="h-3 w-3 mr-1" /> Add Product
              </Button>
            </div>
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider font-body text-muted-foreground">
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockProducts.map((product) => (
                    <tr key={product.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-body text-sm font-medium">{product.name}</td>
                      <td className="p-4 font-body text-sm text-muted-foreground">{product.category}</td>
                      <td className="p-4 font-body text-sm">₹{product.price}</td>
                      <td className="p-4 font-body text-sm">
                        <span className={product.stock < 10 ? "text-destructive font-semibold" : ""}>{product.stock}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Orders */}
        {activeTab === "orders" && (
          <div>
            <h2 className="font-display text-lg font-semibold mb-4">Orders</h2>
            <div className="bg-card border border-border overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider font-body text-muted-foreground">
                    <th className="text-left p-4">Tracking ID</th>
                    <th className="text-left p-4">Customer</th>
                    <th className="text-left p-4">Items</th>
                    <th className="text-left p-4">Total</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="p-4 font-mono text-sm font-semibold">{order.trackingId}</td>
                      <td className="p-4 font-body text-sm">{order.customer}</td>
                      <td className="p-4 font-body text-sm text-muted-foreground">{order.items}</td>
                      <td className="p-4 font-body text-sm font-medium">₹{order.total}</td>
                      <td className="p-4">
                        <span className={`text-xs font-body uppercase tracking-wider px-2 py-1 rounded-sm ${statusColors[order.status] || ""}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-4 font-body text-sm text-muted-foreground">{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
