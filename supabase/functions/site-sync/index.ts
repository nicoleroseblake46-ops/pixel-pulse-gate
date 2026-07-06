import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const TARGET_URL = Deno.env.get('TELEGRAM_SITE_SYNC_URL') ?? 'https://telegram-first-hello.lovable.app/api/public/site-sync';
const SYNC_SECRET = Deno.env.get('TELEGRAM_SITE_SYNC_SECRET') ?? '';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // Require an authenticated admin caller
  const authHeader = req.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  );
  const token = authHeader.replace('Bearer ', '');
  const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
  if (claimsErr || !claims?.claims?.sub) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  const { data: isAdmin } = await supabase.rpc('has_role', { _user_id: claims.claims.sub, _role: 'admin' });
  if (!isAdmin) {
    return new Response(JSON.stringify({ error: 'Admin required' }), {
      status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  if (!SYNC_SECRET) {
    return new Response(JSON.stringify({ error: 'Sync secret not configured' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  let body: unknown;
  try { body = await req.json(); } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const events: unknown[] = Array.isArray(body) ? body : [body];
  const results: Array<{ ok: boolean; status: number; body?: unknown }> = [];
  for (const evt of events) {
    try {
      const r = await fetch(TARGET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Sync-Secret': SYNC_SECRET,
        },
        body: JSON.stringify(evt),
      });
      const text = await r.text();
      let parsed: unknown = text;
      try { parsed = JSON.parse(text); } catch { /* leave as text */ }
      results.push({ ok: r.ok, status: r.status, body: parsed });
    } catch (e) {
      results.push({ ok: false, status: 0, body: String(e) });
    }
  }

  return new Response(JSON.stringify({ results }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
