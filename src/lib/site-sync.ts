import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/hooks/use-products";

export type SyncEvent =
  | { type: "product.upsert"; data: { external_id: string; category_external_id: string; name: string; description?: string; price_usd: number; bin?: string; active: boolean } }
  | { type: "product.delete"; data: { external_id: string } }
  | { type: "category.upsert"; data: { external_id: string; name: string; sort_order?: number; active?: boolean } }
  | { type: "category.delete"; data: { external_id: string } }
  | { type: "stock.added"; data: { product_external_id: string; quantity: number } }
  | { type: "announcement"; data: { text: string } };

/**
 * Fire-and-forget sync to the Telegram bot backend via our edge function proxy.
 * Failures are swallowed with a console.warn so admin UX is never blocked.
 */
export const syncTelegram = async (events: SyncEvent | SyncEvent[]) => {
  try {
    const payload = Array.isArray(events) ? events : [events];
    if (!payload.length) return;
    const { error } = await supabase.functions.invoke("site-sync", { body: payload });
    if (error) console.warn("[site-sync] failed", error);
  } catch (e) {
    console.warn("[site-sync] error", e);
  }
};

export const productToUpsert = (
  p: Pick<Product, "id" | "category" | "name" | "meta" | "price" | "bin" | "is_active">,
): SyncEvent => ({
  type: "product.upsert",
  data: {
    external_id: p.id,
    category_external_id: p.category,
    name: p.name,
    description: p.meta ?? "",
    price_usd: Number(p.price) || 0,
    bin: p.bin && /^\d{6}$/.test(p.bin) ? p.bin : undefined,
    active: !!p.is_active,
  },
});
