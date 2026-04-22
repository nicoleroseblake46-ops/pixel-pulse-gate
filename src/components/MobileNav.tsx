import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LayoutDashboard, Tag, CreditCard, Network, Wrench, Wallet, User, LogOut, Zap, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Sales", url: "/sales", icon: Tag },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Socks", url: "/socks", icon: Zap },
  { title: "Proxy", url: "/proxy", icon: Network },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "Payments", url: "/payments", icon: Wallet },
  { title: "Profile", url: "/profile", icon: User },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const { signOut } = useAuth();
  const { balance, cartItems } = useCommerce();
  const loc = useLocation();

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:hidden">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-primary flex items-center justify-center">
            <span className="font-display text-sm font-black text-background">N</span>
          </div>
          <span className="font-display text-lg font-black neon-text">NEXUS</span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink to="/payments" className="rounded-md border border-border bg-secondary/50 px-2 py-1 font-mono text-xs text-primary">
            ${balance.toFixed(0)}{cartItems.length ? ` · ${cartItems.length}` : ""}
          </NavLink>
          <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-foreground hover:bg-secondary">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 top-16 z-30 bg-background/95 backdrop-blur-xl md:hidden animate-fade-up">
          <nav className="space-y-1 p-4">
            {items.map((it) => {
              const Icon = it.icon;
              const active = loc.pathname === it.url;
              return (
                <NavLink
                  key={it.url}
                  to={it.url}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 font-medium transition-smooth",
                    active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className={cn("h-5 w-5", active && "text-primary")} />
                  {it.title}
                </NavLink>
              );
            })}
            <button
              onClick={() => { setOpen(false); signOut(); }}
              className="mt-4 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" /> Disconnect
            </button>
          </nav>
        </div>
      )}
    </>
  );
};
