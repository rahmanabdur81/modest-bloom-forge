import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { Package, ShoppingBag, Truck, Users, Eye, CheckCircle, XCircle, ChevronDown, Image as ImageIcon, FolderTree } from "lucide-react";
import AdminProducts from "@/components/AdminProducts";
import AdminCategories from "@/components/AdminCategories";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

type Tab = "overview" | "products" | "categories" | "orders" | "delivery" | "customers";

const ORDER_STATUSES = ["processing", "shipped", "out-for-delivery", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  processing: "bg-amber-100 text-amber-800",
  shipped: "bg-blue-100 text-blue-800",
  "out-for-delivery": "bg-orange-100 text-orange-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-800",
  pending: "bg-muted text-muted-foreground",
  paid: "bg-emerald-100 text-emerald-800",
  failed: "bg-red-100 text-red-800",
};

interface Order {
  id: string;
  tracking_id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  total: number;
  shipping: number;
  status: string;
  payment_status: string;
  created_at: string;
  estimated_delivery: string | null;
  user_id: string | null;
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  color: string | null;
  size: string | null;
  image_url: string | null;
}

interface CustomerProfile {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  order_count?: number;
  total_spent?: number;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [stats, setStats] = useState({ revenue: 0, orderCount: 0, pendingCount: 0, customerCount: 0 });

  useEffect(() => {
    if (user && isAdmin) fetchData();
  }, [user, isAdmin]);

  const fetchData = async () => {
    setDataLoading(true);
    const [ordersRes, customersRes] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);

    const ordersData = (ordersRes.data || []) as Order[];
    const customersData = (customersRes.data || []) as CustomerProfile[];

    setOrders(ordersData);
    setCustomers(customersData);

    // Calculate stats
    const revenue = ordersData.filter(o => o.payment_status === "paid").reduce((s, o) => s + o.total, 0);
    const pendingCount = ordersData.filter(o => o.status === "processing").length;
    setStats({
      revenue,
      orderCount: ordersData.length,
      pendingCount,
      customerCount: customersData.length,
    });

    setDataLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    const { data } = await supabase.from("order_items").select("*").eq("order_id", orderId);
    setOrderItems((data || []) as OrderItem[]);
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    fetchOrderItems(order.id);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(orderId);
    const { error } = await supabase.from("orders").update({ status: newStatus, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update status");
    } else {
      toast.success(`Order status updated to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    setUpdatingStatus(null);
  };

  const handleVerifyPayment = async (orderId: string, status: "paid" | "failed") => {
    const { error } = await supabase.from("orders").update({ payment_status: status, updated_at: new Date().toISOString() }).eq("id", orderId);
    if (error) {
      toast.error("Failed to update payment status");
    } else {
      toast.success(`Payment marked as ${status}`);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, payment_status: status } : o));
      if (selectedOrder?.id === orderId) setSelectedOrder(prev => prev ? { ...prev, payment_status: status } : null);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/auth" />;
  if (!isAdmin) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <XCircle className="h-12 w-12 text-destructive" />
      <p className="font-display text-lg">Access Denied</p>
      <p className="font-body text-sm text-muted-foreground">You don't have admin privileges.</p>
      <Link to="/"><Button variant="outline">Go Home</Button></Link>
    </div>
  );

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: ShoppingBag },
    { key: "products" as Tab, label: "Products", icon: ImageIcon },
    { key: "categories" as Tab, label: "Categories", icon: FolderTree },
    { key: "orders" as Tab, label: "Orders", icon: Package },
    { key: "delivery" as Tab, label: "Delivery", icon: Truck },
    { key: "customers" as Tab, label: "Customers", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-secondary">
      <div className="container-page py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold">Admin Dashboard</h1>
            <p className="font-body text-sm text-muted-foreground">Manage orders, delivery & customers</p>
          </div>
          <Link to="/"><Button variant="outline" size="sm" className="text-xs uppercase tracking-wider">View Store</Button></Link>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button key={tab.key} variant={activeTab === tab.key ? "default" : "ghost"} size="sm"
                className="text-xs uppercase tracking-wider shrink-0" onClick={() => { setActiveTab(tab.key); setSelectedOrder(null); }}>
                <Icon className="h-3 w-3 mr-1" /> {tab.label}
              </Button>
            );
          })}
        </div>

        {dataLoading ? (
          <div className="text-center py-12 font-body text-muted-foreground">Loading data...</div>
        ) : (
          <>
            {/* Overview */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₹${stats.revenue.toLocaleString()}`, sub: "From paid orders" },
                  { label: "Total Orders", value: String(stats.orderCount), sub: `${stats.pendingCount} processing` },
                  { label: "Customers", value: String(stats.customerCount), sub: "Registered users" },
                  { label: "Pending Delivery", value: String(orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length), sub: "Awaiting delivery" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card p-6 border border-border rounded-lg">
                    <p className="text-xs uppercase tracking-wider font-body text-muted-foreground mb-2">{stat.label}</p>
                    <p className="font-display text-2xl font-bold mb-1">{stat.value}</p>
                    <p className="text-xs font-body text-muted-foreground">{stat.sub}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Products Tab */}
            {activeTab === "products" && <AdminProducts />}

            {/* Categories Tab */}
            {activeTab === "categories" && <AdminCategories />}

            {/* Orders Tab */}
            {activeTab === "orders" && !selectedOrder && (
              <div>
                <h2 className="font-display text-lg font-semibold mb-4">All Orders ({orders.length})</h2>
                {orders.length === 0 ? (
                  <p className="text-center py-8 font-body text-muted-foreground">No orders yet</p>
                ) : (
                  <div className="bg-card border border-border overflow-x-auto rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider font-body text-muted-foreground">
                          <th className="text-left p-4">Tracking ID</th>
                          <th className="text-left p-4">Customer</th>
                          <th className="text-left p-4">Total</th>
                          <th className="text-left p-4">Payment</th>
                          <th className="text-left p-4">Status</th>
                          <th className="text-left p-4">Date</th>
                          <th className="text-left p-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id} className="border-b border-border last:border-0">
                            <td className="p-4 font-mono text-sm font-semibold">{order.tracking_id}</td>
                            <td className="p-4 font-body text-sm">{order.full_name}</td>
                            <td className="p-4 font-body text-sm font-medium">₹{order.total.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${statusColors[order.payment_status] || ""}`}>
                                {order.payment_status}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${statusColors[order.status] || ""}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="p-4 font-body text-sm text-muted-foreground">
                              {format(new Date(order.created_at), "dd MMM yyyy")}
                            </td>
                            <td className="p-4">
                              <Button variant="ghost" size="sm" onClick={() => handleViewOrder(order)}>
                                <Eye className="h-3 w-3 mr-1" /> View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Order Detail View */}
            {activeTab === "orders" && selectedOrder && (
              <div>
                <Button variant="ghost" size="sm" className="mb-4" onClick={() => setSelectedOrder(null)}>← Back to Orders</Button>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Order Info */}
                  <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                    <h3 className="font-display text-lg font-semibold">Order #{selectedOrder.tracking_id}</h3>
                    <div className="space-y-2 font-body text-sm">
                      <p><span className="text-muted-foreground">Customer:</span> {selectedOrder.full_name}</p>
                      <p><span className="text-muted-foreground">Phone:</span> {selectedOrder.phone}</p>
                      <p><span className="text-muted-foreground">Address:</span> {selectedOrder.address}, {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}</p>
                      <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedOrder.created_at), "dd MMM yyyy, hh:mm a")}</p>
                      <p><span className="text-muted-foreground">Total:</span> <span className="font-semibold">₹{selectedOrder.total.toLocaleString()}</span> (+ ₹{selectedOrder.shipping} shipping)</p>
                    </div>

                    {/* Payment Verification */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Payment Verification</p>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${statusColors[selectedOrder.payment_status] || ""}`}>
                          {selectedOrder.payment_status}
                        </span>
                        {selectedOrder.payment_status === "pending" && (
                          <div className="flex gap-2 ml-auto">
                            <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300" onClick={() => handleVerifyPayment(selectedOrder.id, "paid")}>
                              <CheckCircle className="h-3 w-3 mr-1" /> Verify Paid
                            </Button>
                            <Button size="sm" variant="outline" className="text-destructive border-destructive/30" onClick={() => handleVerifyPayment(selectedOrder.id, "failed")}>
                              <XCircle className="h-3 w-3 mr-1" /> Mark Failed
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Update */}
                    <div className="border-t border-border pt-4">
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Update Order Status</p>
                      <div className="flex flex-wrap gap-2">
                        {ORDER_STATUSES.map((s) => (
                          <Button key={s} size="sm"
                            variant={selectedOrder.status === s ? "default" : "outline"}
                            disabled={updatingStatus === selectedOrder.id}
                            className="text-xs uppercase tracking-wider"
                            onClick={() => handleUpdateStatus(selectedOrder.id, s)}>
                            {s.replace("-", " ")}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-card border border-border rounded-lg p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Order Items</h3>
                    {orderItems.length === 0 ? (
                      <p className="font-body text-sm text-muted-foreground">Loading items...</p>
                    ) : (
                      <div className="space-y-3">
                        {orderItems.map((item) => (
                          <div key={item.id} className="flex gap-3 items-center border-b border-border pb-3 last:border-0">
                            {item.image_url && (
                              <img src={item.image_url} alt={item.name} className="w-12 h-12 object-cover rounded" />
                            )}
                            <div className="flex-1">
                              <p className="font-body text-sm font-medium">{item.name}</p>
                              <p className="font-body text-xs text-muted-foreground">
                                Qty: {item.quantity} {item.color && `• ${item.color}`} {item.size && `• ${item.size}`}
                              </p>
                            </div>
                            <p className="font-body text-sm font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Delivery Tab */}
            {activeTab === "delivery" && (
              <div>
                <h2 className="font-display text-lg font-semibold mb-4">Delivery Management</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {ORDER_STATUSES.filter(s => s !== "cancelled").map((status) => {
                    const count = orders.filter(o => o.status === status).length;
                    return (
                      <div key={status} className="bg-card border border-border rounded-lg p-4 text-center">
                        <p className="font-display text-2xl font-bold">{count}</p>
                        <p className={`text-xs uppercase tracking-wider px-2 py-1 rounded mt-1 inline-block ${statusColors[status]}`}>{status.replace("-", " ")}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Active deliveries */}
                <div className="bg-card border border-border rounded-lg overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs uppercase tracking-wider font-body text-muted-foreground">
                        <th className="text-left p-4">Tracking ID</th>
                        <th className="text-left p-4">Customer</th>
                        <th className="text-left p-4">Location</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Update Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length === 0 ? (
                        <tr><td colSpan={5} className="p-8 text-center font-body text-muted-foreground">No active deliveries</td></tr>
                      ) : (
                        orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").map((order) => (
                          <tr key={order.id} className="border-b border-border last:border-0">
                            <td className="p-4 font-mono text-sm font-semibold">{order.tracking_id}</td>
                            <td className="p-4 font-body text-sm">
                              <p>{order.full_name}</p>
                              <p className="text-xs text-muted-foreground">{order.phone}</p>
                            </td>
                            <td className="p-4 font-body text-xs text-muted-foreground">
                              {order.city}, {order.state} - {order.pincode}
                            </td>
                            <td className="p-4">
                              <span className={`text-xs px-2 py-1 rounded uppercase tracking-wider ${statusColors[order.status] || ""}`}>
                                {order.status.replace("-", " ")}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="relative">
                                <select
                                  className="appearance-none bg-secondary border border-border rounded px-3 py-1.5 pr-8 text-xs uppercase tracking-wider font-body cursor-pointer"
                                  value={order.status}
                                  onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                  disabled={updatingStatus === order.id}
                                >
                                  {ORDER_STATUSES.map(s => (
                                    <option key={s} value={s}>{s.replace("-", " ")}</option>
                                  ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-3 w-3 pointer-events-none text-muted-foreground" />
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Customers Tab */}
            {activeTab === "customers" && (
              <div>
                <h2 className="font-display text-lg font-semibold mb-4">Customers ({customers.length})</h2>
                {customers.length === 0 ? (
                  <p className="text-center py-8 font-body text-muted-foreground">No customers yet</p>
                ) : (
                  <div className="bg-card border border-border rounded-lg overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border text-xs uppercase tracking-wider font-body text-muted-foreground">
                          <th className="text-left p-4">Name</th>
                          <th className="text-left p-4">Phone</th>
                          <th className="text-left p-4">Joined</th>
                          <th className="text-left p-4">Orders</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => {
                          const customerOrders = orders.filter(o => o.user_id === customer.id);
                          return (
                            <tr key={customer.id} className="border-b border-border last:border-0">
                              <td className="p-4 font-body text-sm font-medium">{customer.full_name || "—"}</td>
                              <td className="p-4 font-body text-sm text-muted-foreground">{customer.phone || "—"}</td>
                              <td className="p-4 font-body text-sm text-muted-foreground">
                                {format(new Date(customer.created_at), "dd MMM yyyy")}
                              </td>
                              <td className="p-4 font-body text-sm">
                                <span className="font-semibold">{customerOrders.length}</span>
                                {customerOrders.length > 0 && (
                                  <span className="text-muted-foreground ml-1">
                                    (₹{customerOrders.reduce((s, o) => s + o.total, 0).toLocaleString()})
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
