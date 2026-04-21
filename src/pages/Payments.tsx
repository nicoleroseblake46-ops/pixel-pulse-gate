import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check, Bitcoin, Shield, Clock, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const COINS = [
  { id: "BTC", name: "Bitcoin", wallet: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh", color: "from-orange-500 to-yellow-400" },
  { id: "ETH", name: "Ethereum", wallet: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1", color: "from-indigo-500 to-purple-500" },
  { id: "USDT", name: "Tether (TRC20)", wallet: "TXyZ4VnhPxRn6tLp8Q3vBzC9aN5kJ2mQwR", color: "from-emerald-500 to-teal-400" },
] as const;

interface Payment { id: string; coin: string; amount: number; wallet_address: string; status: string; created_at: string; }

const Payments = () => {
  const { user } = useAuth();
  const [coin, setCoin] = useState<typeof COINS[number]>(COINS[0]);
  const [amount, setAmount] = useState("");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<Payment[]>([]);

  const loadHistory = () => {
    if (!user) return;
    supabase.from("payments").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10)
      .then(({ data }) => data && setHistory(data as Payment[]));
  };

  useEffect(loadHistory, [user]);

  const copyWallet = () => {
    navigator.clipboard.writeText(coin.wallet);
    setCopied(true);
    toast.success("Wallet copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const createOrder = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { toast.error("Enter a valid amount"); return; }
    if (!user) return;
    setSubmitting(true);
    const { error } = await supabase.from("payments").insert({
      user_id: user.id, coin: coin.id, amount: amt, wallet_address: coin.wallet, status: "pending",
    });
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Order created — awaiting blockchain confirmation");
    setAmount("");
    loadHistory();
  };

  const statusBadge = (s: string) => {
    const map: Record<string, string> = {
      pending: "bg-warning/15 text-warning border-warning/30",
      confirmed: "bg-success/15 text-success border-success/30",
      failed: "bg-destructive/15 text-destructive border-destructive/30",
    };
    return map[s] || map.pending;
  };

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-accent text-glow-accent">CRYPTO ONLY · NO KYC</div>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
          <span className="neon-text">Payments</span>
        </h1>
        <p className="mt-2 text-muted-foreground">Top up your NEXUS wallet using Bitcoin, Ethereum or USDT.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Coin selection + QR */}
        <div className="glass-strong relative overflow-hidden rounded-2xl p-6 md:p-8 animate-fade-up">
          <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-primary/20 blur-[100px]" />

          <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Select Coin</Label>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {COINS.map((c) => (
              <button
                key={c.id}
                onClick={() => setCoin(c)}
                className={`rounded-lg border-2 p-3 transition-smooth ${
                  coin.id === c.id
                    ? "border-primary bg-primary/10 glow-primary"
                    : "border-border bg-secondary/30 hover:border-primary/40"
                }`}
              >
                <div className={`mx-auto h-8 w-8 rounded-full bg-gradient-to-br ${c.color}`} />
                <div className="mt-2 font-display text-sm font-bold">{c.id}</div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-center">
            <div className="relative rounded-2xl bg-foreground p-4 glow-primary">
              <QRCodeSVG value={coin.wallet} size={180} bgColor="#fafafa" fgColor="#0a0a0f" level="M" />
            </div>
            <div className="mt-2 text-center font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Scan to pay · {coin.name}
            </div>
          </div>

          <div className="mt-6">
            <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Wallet Address</Label>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-border bg-input/50 p-2">
              <code className="flex-1 truncate font-mono text-xs text-foreground">{coin.wallet}</code>
              <Button size="sm" variant="ghost" onClick={copyWallet} className="shrink-0 hover:text-primary">
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Order form */}
        <div className="glass-strong relative overflow-hidden rounded-2xl p-6 md:p-8 animate-fade-up">
          <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-accent/20 blur-[100px]" />

          <h3 className="font-display text-xl font-bold">Create Order</h3>
          <p className="mt-1 text-sm text-muted-foreground">After sending, click "Create order" so we can match the transaction.</p>

          <div className="mt-6 space-y-4">
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Amount ({coin.id})</Label>
              <Input
                type="number"
                step="0.0001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-2 border-border bg-input/50 font-mono text-lg"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {["0.001", "0.01", "0.1"].map((v) => (
                <button
                  key={v}
                  onClick={() => setAmount(v)}
                  className="rounded-lg border border-border bg-secondary/30 py-2 font-mono text-sm transition-smooth hover:border-primary/50 hover:text-primary"
                >
                  {v}
                </button>
              ))}
            </div>

            <Button
              onClick={createOrder}
              disabled={submitting}
              className="w-full bg-gradient-primary font-display font-bold uppercase tracking-widest text-background h-12 glow-primary hover:opacity-90"
            >
              {submitting ? "Creating..." : "Create Order"}
            </Button>

            <div className="grid grid-cols-3 gap-2 pt-4">
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/30 p-3">
                <Shield className="h-4 w-4 text-success" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Encrypted</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/30 p-3">
                <Bitcoin className="h-4 w-4 text-warning" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Crypto Only</span>
              </div>
              <div className="flex flex-col items-center gap-1 rounded-lg bg-secondary/30 p-3">
                <Clock className="h-4 w-4 text-accent" />
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">~10 min</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <section className="mt-10">
        <h2 className="mb-4 font-display text-2xl font-bold tracking-wider">TRANSACTION LOG</h2>
        {history.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center text-muted-foreground">
            No transactions yet. Your first order will appear here.
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-xl">
            <div className="hidden grid-cols-5 gap-4 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:grid">
              <span>Date</span><span>Coin</span><span>Amount</span><span>Wallet</span><span className="text-right">Status</span>
            </div>
            {history.map((p, i) => (
              <div
                key={p.id}
                className="grid grid-cols-2 gap-4 border-b border-border/50 px-5 py-4 transition-smooth hover:bg-primary/5 last:border-0 md:grid-cols-5 animate-fade-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
                </span>
                <span className="font-display font-bold">{p.coin}</span>
                <span className="font-mono">{p.amount}</span>
                <span className="hidden truncate font-mono text-xs text-muted-foreground md:inline">{p.wallet_address.slice(0, 16)}…</span>
                <span className="md:text-right">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${statusBadge(p.status)}`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
                    {p.status}
                  </span>
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </AppLayout>
  );
};

export default Payments;
