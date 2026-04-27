import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Zap, Mail, Lock, User as UserIcon, Shield, RefreshCw } from "lucide-react";
import { z } from "zod";
import loginDesk from "@/assets/login-desk-reference.png";

const generateCaptcha = () => {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
};

const schema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(72),
  username: z.string().trim().min(2).max(32).optional(),
});

const emailSchema = z.string().trim().email("Invalid email").max(255);
const productionUrl = "https://nexuscc.vercel.app";

const Auth = () => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate("/", { replace: true }); }, [user, navigate]);

  const refreshCaptcha = useCallback(() => {
    setCaptcha(generateCaptcha());
    setCaptchaInput("");
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseInt(captchaInput, 10) !== captcha.answer) {
      toast.error("Captcha incorrect", { description: "Please solve the math challenge to continue." });
      refreshCaptcha();
      return;
    }
    const parsed = schema.safeParse({ email, password, username: mode === "signup" ? username : undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/`, data: { username } },
        });
        if (error) throw error;
        toast.success("Welcome to NEXUS — you're in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Access granted.");
      }
    } catch (err: any) {
      toast.error(err.message || "Authentication failed");
      refreshCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const sendPasswordReset = async () => {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      toast.error("Enter your email first");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: `${productionUrl}/reset-password`,
    });
    setLoading(false);

    if (error) {
      toast.error("Reset failed", { description: error.message });
    } else {
      toast.success("Reset link sent", { description: "Check your email to create a new password." });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      <img src={loginDesk} alt="Secure marketplace login workspace" className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-0 bg-background/10 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-md animate-fade-up">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center sr-only">
          <div className="relative mb-4">
            <div className="h-16 w-16 rounded-xl bg-gradient-primary animate-pulse-glow flex items-center justify-center">
              <Zap className="h-8 w-8 text-background" strokeWidth={3} />
            </div>
          </div>
          <div className="font-display text-4xl font-black tracking-[0.2em] neon-text">NEXUS</div>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            Premium Marketplace · Crypto Only
          </p>
        </div>

        <div className="relative overflow-hidden rounded-sm border border-primary-foreground/20 bg-foreground/35 p-7 shadow-[var(--shadow-elevated)] backdrop-blur-md md:p-8">
          {/* Top neon line */}
          <div className="absolute left-0 right-0 top-0 h-16 bg-primary-foreground/20 blur-xl" />

          {/* Tabs */}
          <h1 className="relative mb-7 text-center font-display text-3xl font-black text-primary-foreground">{mode === "login" ? "Login" : "Create Account"}</h1>

          <div className="mb-6 flex gap-1 rounded-sm bg-primary-foreground/15 p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 rounded-md py-2 font-display text-sm font-bold tracking-wider uppercase transition-smooth ${
                  mode === m ? "bg-warning text-foreground" : "text-primary-foreground hover:bg-primary-foreground/10"
                }`}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "signup" && (
              <div className="space-y-2 animate-fade-up">
                <Label className="sr-only">Username</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="player_one"
                    className="h-14 rounded-sm border-primary-foreground/20 bg-input pl-12 text-base"
                    required
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label className="sr-only">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Login"
                  className="h-14 rounded-sm border-primary-foreground/20 bg-input pl-12 text-base"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label className="sr-only">Password</Label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={sendPasswordReset}
                    disabled={loading}
                    className="font-semibold text-warning transition-smooth hover:text-warning/80 disabled:opacity-50"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 rounded-sm border-primary-foreground/20 bg-input pl-12 text-base"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-primary-foreground/80">
                <Shield className="h-3 w-3" /> Security Check
              </Label>
              <div className="flex items-center gap-2">
                <div className="flex h-14 flex-1 items-center justify-center rounded-sm border border-primary-foreground/20 bg-input/60 px-4 font-mono text-lg font-bold tracking-widest text-primary-foreground select-none">
                  {captcha.a} + {captcha.b} = ?
                </div>
                <button
                  type="button"
                  onClick={refreshCaptcha}
                  className="flex h-14 w-14 items-center justify-center rounded-sm border border-primary-foreground/20 bg-input/60 text-primary-foreground transition-smooth hover:bg-primary-foreground/10"
                  aria-label="Refresh captcha"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
                <Input
                  type="number"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="?"
                  className="h-14 w-20 rounded-sm border-primary-foreground/20 bg-input text-center text-base font-bold"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="relative mt-6 h-14 w-full overflow-hidden rounded-sm bg-warning font-semibold text-foreground hover:bg-warning/90"
            >
              {loading ? "Connecting..." : mode === "login" ? "Login" : "Create an Account"}
            </Button>
          </form>

          <p className="mt-5 text-center text-base font-semibold text-primary-foreground">
            {mode === "login" ? "Not a member? " : "Already a member? "}
            <button type="button" onClick={() => setMode(mode === "login" ? "signup" : "login")} className="text-warning hover:text-warning/80">
              {mode === "login" ? "Create an Account" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
