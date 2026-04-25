import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommerce } from "@/contexts/CommerceContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { MessageSquareText, ShoppingCart, User, Wallet } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { balance, cartItems } = useCommerce();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setUsername((data.username as string) || "");
        setAvatarUrl((data.avatar_url as string) || "");
      }
    });
  }, [user]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ username, avatar_url: avatarUrl }).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message); else toast.success("Profile updated");
  };

  const initial = (username || user?.email || "?").charAt(0).toUpperCase();

  return (
    <AppLayout>
      <div className="mb-8 animate-fade-up">
        <div className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">/ Agent profile</div>
        <h1 className="mt-2 font-display text-4xl font-black tracking-tight md:text-5xl">
          <span className="neon-text">Profile</span>
        </h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Avatar card */}
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 text-center animate-fade-up">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/30 blur-[80px]" />
          <div className="relative mx-auto h-28 w-28">
            <div className="absolute inset-0 rounded-full bg-gradient-primary animate-pulse-glow" />
            <div className="absolute inset-1 flex items-center justify-center rounded-full bg-background">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full rounded-full object-cover" />
              ) : (
                <span className="font-display text-4xl font-black neon-text">{initial}</span>
              )}
            </div>
          </div>
          <div className="mt-4 font-display text-xl font-bold">{username || "Unnamed Agent"}</div>
          <div className="mt-4 inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> ACTIVE
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2">
            <NavLink to="/payments" className="rounded-lg bg-secondary/40 p-3 transition-smooth hover:bg-primary hover:text-primary-foreground">
              <Wallet className="mx-auto h-4 w-4" />
              <div className="mt-1 font-display text-lg font-bold">${balance.toFixed(0)}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest">Balance</div>
            </NavLink>
            <NavLink to="/payments" className="rounded-lg bg-secondary/40 p-3 transition-smooth hover:bg-primary hover:text-primary-foreground">
              <ShoppingCart className="mx-auto h-4 w-4" />
              <div className="mt-1 font-display text-lg font-bold">{cartItems.length}</div>
              <div className="font-mono text-[9px] uppercase tracking-widest">Cart</div>
            </NavLink>
            <NavLink to="/tickets" className="rounded-lg bg-secondary/40 p-3 transition-smooth hover:bg-primary hover:text-primary-foreground">
              <MessageSquareText className="mx-auto h-4 w-4" />
              <div className="mt-1 font-display text-lg font-bold">Open</div>
              <div className="font-mono text-[9px] uppercase tracking-widest">Tickets</div>
            </NavLink>
          </div>
        </div>

        {/* Edit form */}
        <div className="glass-strong relative overflow-hidden rounded-2xl p-8 lg:col-span-2 animate-fade-up">
          <h3 className="font-display text-xl font-bold">Identity</h3>
          <p className="mt-1 text-sm text-muted-foreground">Update how you appear across NEXUS.</p>

          <div className="mt-6 space-y-4">
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Username</Label>
              <div className="relative mt-2">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={username} onChange={(e) => setUsername(e.target.value)} className="border-border bg-input/50 pl-10 font-mono" />
              </div>
            </div>
            <div>
              <Label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Avatar URL</Label>
              <Input value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://..." className="mt-2 border-border bg-input/50 font-mono" />
            </div>
            <Button onClick={save} disabled={saving} className="bg-gradient-primary font-display font-bold uppercase tracking-widest text-background glow-primary hover:opacity-90">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;
