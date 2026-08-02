import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/hooks/use-admin";
import { AppLayout } from "@/components/AppLayout";
import { toast } from "sonner";

type VisitorLog = {
  id: string;
  ip_address: string | null;
  user_agent: string | null;
  path: string | null;
  referrer: string | null;
  country: string | null;
  user_id: string | null;
  created_at: string;
};

const AdminVisitors = () => {
  const { isAdmin, loading: adminLoading } = useAdmin();
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      // Exclude staff/admin traffic so this only shows real site visitors
      const [{ data: roles }, { data, error }] = await Promise.all([
        supabase.from("user_roles").select("user_id").eq("role", "admin"),
        supabase
          .from("visitor_logs")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1000),
      ]);
      const adminIds = new Set((roles || []).map((r: { user_id: string }) => r.user_id));
      if (error) toast.error(error.message);
      else
        setLogs(
          ((data as VisitorLog[]) || [])
            .filter((l) => !(l.user_id && adminIds.has(l.user_id)))
            .slice(0, 500)
        );
      setLoading(false);
    })();
  }, [isAdmin]);


  if (adminLoading) return null;
  if (!isAdmin) {
    return (
      <AppLayout>
        <div className="p-8 text-muted-foreground">Admin access required.</div>
      </AppLayout>
    );
  }

  const uniqueIps = new Set(logs.map((l) => l.ip_address).filter(Boolean)).size;

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="font-display text-3xl font-black">Visitor IPs</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {logs.length} recent visits · {uniqueIps} unique IPs
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">IP</th>
                <th className="px-4 py-3">Country</th>
                <th className="px-4 py-3">Path</th>
                <th className="px-4 py-3">Referrer</th>
                <th className="px-4 py-3">User Agent</th>
                <th className="px-4 py-3">User</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">Loading…</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No visits logged yet.</td></tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                    <td className="whitespace-nowrap px-4 py-2 font-mono text-xs">{new Date(l.created_at).toLocaleString()}</td>
                    <td className="whitespace-nowrap px-4 py-2 font-mono">{l.ip_address || "—"}</td>
                    <td className="px-4 py-2">{l.country || "—"}</td>
                    <td className="px-4 py-2">{l.path || "—"}</td>
                    <td className="max-w-[200px] truncate px-4 py-2 text-muted-foreground" title={l.referrer || ""}>{l.referrer || "—"}</td>
                    <td className="max-w-[260px] truncate px-4 py-2 text-xs text-muted-foreground" title={l.user_agent || ""}>{l.user_agent || "—"}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{l.user_id ? l.user_id.slice(0, 8) : "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminVisitors;
