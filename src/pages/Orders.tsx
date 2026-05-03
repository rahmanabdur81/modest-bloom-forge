import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon, Package, Search, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useOrderHistory } from "@/hooks/useOrderHistory";
import OrderCard from "@/components/OrderCard";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

const PAGE_SIZE = 5;

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { data: orders, isLoading } = useOrderHistory(user?.id);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const [visible, setVisible] = useState(PAGE_SIZE);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      if (status !== "all" && o.status?.toLowerCase() !== status) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.tracking_id?.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) return false;
      }
      if (range?.from) {
        const created = new Date(o.created_at);
        if (created < range.from) return false;
        if (range.to && created > new Date(range.to.getTime() + 86400000 - 1)) return false;
      }
      return true;
    });
  }, [orders, status, search, range]);

  const visibleOrders = filtered.slice(0, visible);
  const hasMore = filtered.length > visible;

  if (authLoading) {
    return <div className="container mx-auto px-4 py-12"><Skeleton className="h-32 w-full" /></div>;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="font-heading text-2xl mb-3">Sign in to view orders</h1>
        <Button onClick={() => navigate("/auth")}>Sign in</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 max-w-4xl">
      <header className="mb-6 sm:mb-8">
        <h1 className="font-heading text-2xl sm:text-3xl font-semibold mb-1">My Orders</h1>
        <p className="text-sm text-muted-foreground">View and track all your past orders.</p>
      </header>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Order ID..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE_SIZE); }}
            className="pl-9"
          />
        </div>

        <Select value={status} onValueChange={(v) => { setStatus(v); setVisible(PAGE_SIZE); }}>
          <SelectTrigger className="sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="shipped">Shipped</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn("sm:w-[240px] justify-start text-left font-normal", !range && "text-muted-foreground")}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range?.from ? (
                range.to ? (
                  <>{format(range.from, "LLL d")} - {format(range.to, "LLL d, y")}</>
                ) : (
                  format(range.from, "LLL d, y")
                )
              ) : (
                <span>Date range</span>
              )}
              {range && (
                <X
                  className="ml-auto h-4 w-4 opacity-60 hover:opacity-100"
                  onClick={(e) => { e.stopPropagation(); setRange(undefined); }}
                />
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={range}
              onSelect={(r) => { setRange(r); setVisible(PAGE_SIZE); }}
              numberOfMonths={1}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Body */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="p-5">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </Card>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-10 sm:p-14 text-center">
          <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Package className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-heading text-xl font-semibold mb-2">
            {orders?.length ? "No matching orders" : "No orders yet"}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {orders?.length
              ? "Try adjusting your filters or search."
              : "Looks like you haven't placed any orders. Start shopping to see them here."}
          </p>
          {!orders?.length && <Button onClick={() => navigate("/products")}>Browse Products</Button>}
        </Card>
      ) : (
        <>
          <div className="space-y-3 sm:space-y-4">
            {visibleOrders.map((o) => <OrderCard key={o.id} order={o} />)}
          </div>
          {hasMore && (
            <div className="mt-6 flex justify-center">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more orders
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
