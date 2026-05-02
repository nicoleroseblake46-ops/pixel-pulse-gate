import { useEffect, useMemo, useState } from "react";
import { Clock, PackageCheck, PackageX, ShoppingBag } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface DeliveredItem {
  id: string;
  name: string;
  meta: string;
  price: number;
  orderId: string;
  orderedAt: string;
  paymentStatus: string;
}

const getCartItems = (metadata: Json): Omit<DeliveredItem, "orderId" | "orderedAt" | "paymentStatus">[] => {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return [];
  const cartItems = metadata.cart_items;
  if (!Array.isArray(cartItems)) return [];

  return cartItems.flatMap((item) => {
    if (!item || typeof item !== "object" || Array.isArray(item)) return [];
    return [{
      id: String(item.id ?? "item"),
      name: String(item.name ?? "Purchased item"),
      meta: String(item.meta ?? "Order delivery"),
      price: Number(item.price ?? 0),
    }];
  });
};

const statusCopy = (status: string) => {
  if (status === "confirmed") return { label: "Delivered", Icon: PackageCheck, className: "border-success/40 bg-success/10 text-success" };
  if (status === "rejected") return { label: "Unavailable", Icon: PackageX, className: "border-destructive/40 bg-destructive/10 text-destructive" };
  return { label: "Processing", Icon: Clock, className: "border-primary/40 bg-primary/10 text-primary" };
};

const MyOrders = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<DeliveredItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("payments")
      .select("id, created_at, status, metadata")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    setItems(
      (data ?? []).flatMap((order) =>
        getCartItems(order.metadata).map((item) => ({
          ...item,
          orderId: order.id,
          orderedAt: order.created_at,
          paymentStatus: order.status,
        })),
      ),
    );
    setLoading(false);
  };

  useEffect(() => {
    loadOrders().catch(() => setLoading(false));
  }, [user?.id]);

  const deliveredCount = useMemo(() => items.filter((item) => item.paymentStatus === "confirmed").length, [items]);

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <ShoppingBag className="h-6 w-6 text-background" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ My Orders</div>
            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl">
              <span className="neon-text">My Orders</span>
            </h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">Delivered items and current delivery status for each checkout.</p>
      </div>

      <section className="glass rounded-xl p-4 animate-fade-up md:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Order Delivery</div>
          <div className="font-mono text-xs text-muted-foreground">{deliveredCount} DELIVERED · {items.length} TOTAL</div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Delivery</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const StatusIcon = statusCopy(item.paymentStatus).Icon;
              const status = statusCopy(item.paymentStatus);
              return (
                <TableRow key={`${item.orderId}-${item.id}`}>
                  <TableCell className="min-w-[220px]">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.meta}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-mono text-xs text-primary">#{item.orderId.slice(0, 8)}</div>
                    <div className="text-xs text-muted-foreground">{new Date(item.orderedAt).toLocaleDateString()}</div>
                  </TableCell>
                  <TableCell className="font-mono font-bold text-primary">${item.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={status.className}>
                      <StatusIcon className="mr-1 h-3 w-3" />
                      {status.label}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
            {!items.length && (
              <TableRow>
                <TableCell colSpan={4} className="py-10 text-center text-muted-foreground">
                  {loading ? "Loading orders..." : "No delivered items yet. Checkout items will appear here after purchase."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <div className="mt-5 flex justify-end">
          <Button variant="secondary" onClick={loadOrders} disabled={loading}>Refresh</Button>
        </div>
      </section>
    </AppLayout>
  );
};

export default MyOrders;