import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { User, Wallet } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { supabase } from "@/integrations/supabase/client";

export const AccountTopBar = () => {
  const { user } = useAuth();
  const { balance, cartItems } = useCommerce();
  const [displayName, setDisplayName] = useState("User");

  useEffect(() => {
    if (!user) {
      setDisplayName("User");
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
    <div className="sticky top-0 z-30 hidden border-b border-border bg-background/80 px-8 py-3 backdrop-blur-xl md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-end gap-3">
        <NavLink
          to="/payments"
          className="flex h-11 min-w-36 items-center justify-center gap-2 rounded-lg border border-primary/25 bg-primary/15 px-4 font-mono text-sm font-bold text-primary transition-smooth hover:bg-primary/20"
        >
          <Wallet className="h-5 w-5" />
          ${balance.toFixed(2)}{cartItems.length ? ` · ${cartItems.length}` : ""}
        </NavLink>
        <NavLink
          to="/profile"
          className="flex h-11 min-w-40 items-center gap-2 rounded-lg border border-border bg-card/70 px-3 font-semibold text-foreground transition-smooth hover:border-primary/40 hover:bg-card"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 text-primary">
            <User className="h-4 w-4" />
          </span>
          <span className="max-w-40 truncate">{displayName}</span>
        </NavLink>
      </div>
    </div>
  );
};