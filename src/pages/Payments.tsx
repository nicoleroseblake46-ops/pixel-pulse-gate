import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AlertCircle, Check, Copy, CreditCard, ShoppingCart, Wallet, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCommerce } from "@/contexts/CommerceContext";
import { toast } from "sonner";

const wallets = {
  BTC: "bc1qrz7zdzjrht9njz24zhpzvyta82yqdpa59cthsq",
  LTC: "ltc1qu78zvrz0u6n0z4cxn34280p9fag6qrjxunz442",
  "USDT/TRC20": "TBTM7mbjaptqK2sKr8hxqDSMdmaQawd2t8",
};
const presetAmounts = [50, 100, 200, 500, 1000];
const bonuses: Record<number, number> = { 50: 2.5, 100: 8, 200: 20, 500: 65 };

const Payments = () => {
  const { balance, cartItems, cartTotal, createPendingPayment, purchaseCartWithBalance } = useCommerce();
  const [amount, setAmount] = useState("");
  const [selected, setSelected] = useState<number | null>(null);
  const [coin, setCoin] = useState<keyof typeof wallets>("BTC");
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [purchasing, setPurchasing] = useState(false);

  const checkoutAmount = selected ?? Number(amount);
  const bonus = bonuses[checkoutAmount] ?? 0;
  const walletAddress = wallets[coin];

  const copyWallet = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success("Wallet copied");
    setTimeout(() => setCopied(false), 1600);
  };

  const checkout = async () => {
    if (!checkoutAmount || checkoutAmount < 50) {
      toast.error("Minimum top up is $50");
      return;
    }
    setSubmitting(true);
    try {
      const paymentId = await createPendingPayment(checkoutAmount, bonus, coin, walletAddress);
      toast.success("Payment pending", { description: `Order ${paymentId.slice(0, 8)} is awaiting confirmation.` });
      setAmount("");
      setSelected(null);
    } catch (error) {
      toast.error("Checkout failed", { description: error instanceof Error ? error.message : "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const buyCart = async () => {
    setPurchasing(true);
    try {
      const orderId = await purchaseCartWithBalance();
      toast.success("Purchase complete", { description: `Order ${orderId.slice(0, 8)} is now in My Orders.` });
    } catch (error) {
      toast.error("Purchase failed", { description: error instanceof Error ? error.message : "Please top up first." });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <AppLayout>
      <div className="mx-auto max-w-3xl animate-fade-up">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-[0.3em] text-primary">Crypto Wallet</div>
            <h1 className="mt-2 font-display text-4xl font-black tracking-tight neon-text">Add money to your account</h1>
          </div>
          <div className="glass rounded-xl px-4 py-3 text-right">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Balance</div>
            <div className="font-display text-2xl font-black text-primary text-glow">${balance.toFixed(2)}</div>
          </div>
        </div>

        <section className="glass-strong rounded-2xl border border-border p-5 shadow-2xl md:p-8">
          <div className="mb-5 flex items-start justify-between gap-4">
            <h2 className="font-display text-2xl font-black">Add money to your account</h2>
            <X className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mb-5 rounded-xl border border-border bg-secondary/20 p-4">
            <div className="flex gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-foreground" />
              <div>
                <div className="font-bold">Caution</div>
                <p className="mt-1 text-sm font-semibold leading-relaxed text-muted-foreground">
                  We are not responsible for any loss of funds. Make sure to use the right currency, address, and amount.
                </p>
              </div>
            </div>
          </div>

          {!!cartItems.length && (
            <div className="mb-5 rounded-xl border border-primary/30 bg-primary/10 p-4">
              <div className="mb-2 flex items-center justify-between gap-3 font-mono text-xs uppercase tracking-widest text-primary">
                <span className="flex items-center gap-2"><ShoppingCart className="h-4 w-4" /> Cart checkout</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted-foreground">{item.id} · {item.name}</span>
                    <span className="font-mono text-foreground">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="font-display text-lg font-bold">Top up amount (USD)</label>
          <Input
            type="number"
            min={50}
            value={amount}
            onChange={(event) => { setAmount(event.target.value); setSelected(null); }}
            placeholder="Minimum $50"
            className="mt-3 h-12 rounded-lg border-2 border-border bg-input/70 px-4 text-base font-semibold focus-visible:ring-primary"
          />

          <div className="mt-4 grid grid-cols-3 gap-3">
            {(Object.keys(wallets) as (keyof typeof wallets)[]).map((value) => (
              <button key={value} onClick={() => setCoin(value)} className={`rounded-lg border p-3 font-display font-bold transition-smooth ${coin === value ? "border-primary bg-primary text-primary-foreground glow-primary" : "border-border bg-secondary/20 hover:border-primary/60"}`}>
                {value}
              </button>
            ))}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {presetAmounts.map((value) => (
              <button
                key={value}
                onClick={() => { setSelected(value); setAmount(String(value)); }}
                className={`rounded-lg border p-4 text-center transition-smooth hover:border-primary/60 ${selected === value ? "border-primary bg-primary/15 glow-primary" : "border-border bg-secondary/20"}`}
              >
                <div className="font-display text-xl font-black">${value.toFixed(2)}</div>
                {!!bonuses[value] && <div className="mt-1 font-semibold text-muted-foreground">+ ${bonuses[value].toFixed(2)} bonus</div>}
              </button>
            ))}
          </div>

          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-border bg-secondary/20 p-4 sm:flex-row sm:items-center">
            <div className="rounded-lg bg-foreground p-3">
              <QRCodeSVG value={walletAddress} size={108} bgColor="#fafafa" fgColor="#0a0a0f" level="M" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"><Wallet className="h-4 w-4" /> {coin} deposit address</div>
              <code className="block truncate rounded-md bg-background/70 px-3 py-2 font-mono text-xs">{walletAddress}</code>
            </div>
            <Button variant="secondary" onClick={copyWallet} className="shrink-0">
              {copied ? <Check /> : <Copy />} Copy
            </Button>
          </div>

          <div className="mt-5 flex items-center justify-end gap-4">
            <Button variant="ghost" onClick={() => { setAmount(""); setSelected(null); }}>Cancel</Button>
            <Button onClick={checkout} disabled={submitting} className="h-11 bg-gradient-primary px-8 font-display font-bold text-background glow-primary hover:opacity-90">
              {submitting ? "Submitting..." : "Submit Top Up"}
            </Button>
          </div>
        </section>

        {!!cartItems.length && (
          <section className="glass-strong mt-5 rounded-2xl border border-border p-5 shadow-2xl md:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="font-mono text-xs uppercase tracking-widest text-primary">Balance checkout</div>
                <h2 className="mt-1 font-display text-2xl font-black">Buy cart with confirmed balance</h2>
                <p className="mt-1 text-sm text-muted-foreground">Top ups must be confirmed by admin before this balance can be used.</p>
              </div>
              <Button onClick={buyCart} disabled={purchasing || balance < cartTotal} className="h-11 bg-gradient-primary px-6 font-display font-bold text-background glow-primary hover:opacity-90">
                <CreditCard /> {purchasing ? "Buying..." : `Buy · $${cartTotal.toFixed(2)}`}
              </Button>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
};

export default Payments;