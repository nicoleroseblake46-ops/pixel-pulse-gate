import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const ipHeader =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      "";
    const ip = ipHeader.split(",")[0].trim() || null;
    const ua = req.headers.get("user-agent") || null;
    const country = req.headers.get("cf-ipcountry") || req.headers.get("x-vercel-ip-country") || null;

    let body: any = {};
    try { body = await req.json(); } catch {}

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    await admin.from("visitor_logs").insert({
      ip_address: ip,
      user_agent: ua,
      country,
      path: typeof body.path === "string" ? body.path.slice(0, 500) : null,
      referrer: typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null,
      user_id: typeof body.user_id === "string" ? body.user_id : null,
    });

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: String(e) }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
