import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Newspaper, Tag, CreditCard, Network, Wrench, Wallet, User, LogOut, ShoppingBag, Menu, X, ShieldCheck, FilePenLine } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { cn } from "@/lib/utils";

const items = [
  { title: "News", url: "/", icon: Newspaper },
  { title: "Sales", url: "/sales", icon: Tag },
  { title: "Cards", url: "/cards", icon: CreditCard },
  { title: "Proxy", url: "/proxy", icon: Network },
  { title: "Tools", url: "/tools", icon: Wrench },
  { title: "My Orders", url: "/orders", icon: ShoppingBag },
  { title: "Payments", url: "/payments", icon: Wallet },
  { title: "Profile", url: "/profile", icon: User },
];

export const MobileNav = () => {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const { signOut, user } = useAuth();
  const { balance, cartItems } = useCommerce();
  const { isAdmin } = useAdmin();
  const loc = useLocation();
  const visibleItems = isAdmin
    ? [...items, { title: "News Admin", url: "/admin/news", icon: FilePenLine }, { title: "Payments Admin", url: "/admin/payments", icon: ShieldCheck }]
    : items;

  useEffect(() => {
    if (!user) {
      setDisplayName("");
      return;
    }

    supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => setDisplayName((data?.username as string) || user.email?.split("@")[0] || "User"));
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/80 backdrop-blur-xl px-4 md:hidden">
        <NavLink to="/payments" className="flex h-10 items-center gap-2 rounded-lg bg-primary/15 px-3 font-mono text-sm font-bold text-primary">
          <Wallet className="h-5 w-5" />
          ${balance.toFixed(2)}{cartItems.length ? ` · ${cartItems.length}` : ""}
        </NavLink>
        <div className="flex items-center gap-2">
          <NavLink to="/profile" className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background/60 px-2.5 text-sm font-semibold text-foreground">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 font-display text-sm font-black text-primary">
              {(displayName || user?.email || "U").charAt(0).toUpperCase()}
            </span>
            <span className="max-w-20 truncate">{displayName || "User"}</span>
          </NavLink>
          <button onClick={() => setOpen(!open)} className="rounded-md p-2 text-foreground hover:bg-secondary">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 top-16 z-30 bg-background/95 backdrop-blur-xl md:hidden animate-fade-up">
          <nav className="space-y-1 p-4">
            {visibleItems.map((it) => {
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
