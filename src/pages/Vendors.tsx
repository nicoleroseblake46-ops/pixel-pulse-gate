import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Crown, Medal, Star, Trophy, ChevronLeft, ShoppingCart } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/Loader";
import { supabase } from "@/integrations/supabase/client";
import { useCommerce } from "@/contexts/CommerceContext";
import { toast } from "sonner";

type Vendor = {
  id: string;
  handle: string;
  name: string;
  bio: string | null;
  avatar_url: string | null;
  rating: number;
  sales_count: number;
  sales_total: number;
};

const rankIcon = (i: number) =>
  i === 0 ? <Crown className="h-5 w-5 text-warning" /> : i === 1 ? <Trophy className="h-5 w-5 text-primary" /> : i === 2 ? <Medal className="h-5 w-5 text-accent" /> : null;

const Leaderboard = () => {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase
      .from("vendors")
      .select("id,handle,name,bio,avatar_url,rating,sales_count,sales_total")
      .eq("is_active", true)
      .order("sales_total", { ascending: false })
      .order("rating", { ascending: false })
      .then(({ data }) => {
        if (!mounted) return;
        setVendors((data ?? []) as Vendor[]);
        setLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary glow-primary">
            <Trophy className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Vendors</div>
            <h1 className="font-display text-4xl font-black tracking-tight md:text-5xl"><span className="neon-text">Leaderboard</span></h1>
          </div>
        </div>
        <p className="mt-3 text-muted-foreground">Top suppliers ranked by total sales and reputation. Tap a vendor to browse their bases.</p>
      </div>

      {loading ? <Loader /> : !vendors.length ? (
        <div className="glass rounded-xl px-6 py-12 text-center text-muted-foreground">No vendors yet.</div>
      ) : (
        <div className="space-y-3">
          {vendors.map((v, i) => (
            <button
              key={v.id}
              onClick={() => navigate(`/vendors/${v.handle}`)}
              className="glass group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-border p-4 text-left transition-smooth hover:-translate-y-0.5 hover:border-primary/50 md:p-5"
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-primary opacity-0 transition-smooth group-hover:opacity-100" />
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-primary font-display text-xl font-black text-primary-foreground">
                #{i + 1}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {rankIcon(i)}
                  <h3 className="font-display text-lg font-bold truncate">{v.name}</h3>
                  <span className="font-mono text-xs text-muted-foreground">@{v.handle}</span>
                </div>
                {v.bio && <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{v.bio}</p>}
              </div>
              <div className="hidden shrink-0 text-right sm:block">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Sales</div>
                <div className="font-display text-lg font-black text-primary">${Number(v.sales_total).toFixed(0)}</div>
                <div className="font-mono text-[10px] text-muted-foreground">{v.sales_count} orders</div>
              </div>
              <div className="shrink-0 rounded-full border border-warning/40 bg-warning/10 px-2.5 py-1 font-mono text-[11px] text-warning">
                <Star className="mr-1 inline h-3 w-3" /> {Number(v.rating).toFixed(1)}
              </div>
            </button>
          ))}
        </div>
      )}
    </AppLayout>
  );
};

const VendorDetail = ({ handle }: { handle: string }) => {
  const navigate = useNavigate();
  const { cartItems, addToCart } = useCommerce();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [bases, setBases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const run = async () => {
      const { data: v } = await supabase
        .from("vendors")
        .select("id,handle,name,bio,avatar_url,rating,sales_count,sales_total")
        .eq("handle", handle)
        .maybeSingle();
      if (!v) { if (mounted) { setLoading(false); } return; }
      const { data: p } = await supabase
        .from("products")
        .select("*")
        .eq("vendor_id", v.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (mounted) {
        setVendor(v as Vendor);
        setBases(p ?? []);
        setLoading(false);
      }
    };
    run();
    return () => { mounted = false; };
  }, [handle]);

  if (loading) return <AppLayout><Loader /></AppLayout>;
  if (!vendor) return (
    <AppLayout>
      <div className="glass rounded-xl px-6 py-12 text-center">
        <p className="text-muted-foreground">Vendor not found.</p>
        <Button className="mt-4" onClick={() => navigate("/vendors")}><ChevronLeft className="h-4 w-4" /> Back to leaderboard</Button>
      </div>
    </AppLayout>
  );

  return (
    <AppLayout>
      <button onClick={() => navigate("/vendors")} className="mb-6 inline-flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Leaderboard
      </button>
      <div className="glass mb-6 overflow-hidden rounded-2xl border border-primary/30 p-5 md:p-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Vendor</div>
            <h1 className="mt-1 font-display text-3xl font-black tracking-tight md:text-4xl"><span className="neon-text">{vendor.name}</span></h1>
            <div className="mt-1 font-mono text-xs text-muted-foreground">@{vendor.handle}</div>
            {vendor.bio && <p className="mt-3 max-w-xl text-sm text-muted-foreground">{vendor.bio}</p>}
          </div>
          <div className="flex flex-wrap gap-3">
            <Stat label="Rating" value={`★ ${Number(vendor.rating).toFixed(1)}`} />
            <Stat label="Orders" value={String(vendor.sales_count)} />
            <Stat label="Volume" value={`$${Number(vendor.sales_total).toFixed(0)}`} />
          </div>
        </div>
      </div>

      <div className="mb-3 font-mono text-xs uppercase tracking-[0.3em] text-primary">Bases ({bases.length})</div>
      {!bases.length ? (
        <div className="glass rounded-xl px-6 py-12 text-center text-muted-foreground">No active bases right now.</div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {bases.map((b: any) => {
            const cartId = `${b.category}-${b.id}`;
            const inCart = cartItems.some((c) => c.id === cartId);
            return (
              <article key={b.id} className="glass rounded-xl border border-border p-4 transition-smooth hover:-translate-y-0.5 hover:border-primary/50">
                <div className="font-mono text-[11px] text-accent uppercase tracking-wider">{b.category}</div>
                <h3 className="mt-1 font-display text-base font-bold truncate">{b.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{b.meta}</p>
                <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                  <span className="font-mono text-lg font-bold text-primary">${Number(b.price).toFixed(2)}</span>
                  <Button
                    size="sm"
                    disabled={inCart}
                    onClick={() => {
                      addToCart({ id: cartId, name: b.name, meta: b.meta ?? "", price: Number(b.price) });
                      toast.success("Added", { duration: 1200 });
                    }}
                  >
                    <ShoppingCart className="h-4 w-4" /> {inCart ? "Added" : "Add"}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </AppLayout>
  );
};

const Stat = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-secondary/30 px-3 py-2 text-center">
    <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
    <div className="font-display text-base font-black">{value}</div>
  </div>
);

const Vendors = () => {
  const { handle } = useParams();
  return handle ? <VendorDetail handle={handle} /> : <Leaderboard />;
};

export default Vendors;
