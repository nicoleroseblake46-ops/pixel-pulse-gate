import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type SettingsMap = Record<string, unknown>;

let cache: SettingsMap | null = null;
const listeners = new Set<(s: SettingsMap) => void>();

const load = async () => {
  const { data } = await supabase.from("app_settings").select("key,value");
  cache = Object.fromEntries((data ?? []).map((row) => [row.key, row.value]));
  listeners.forEach((fn) => fn(cache!));
};

export const useAppSettings = () => {
  const [settings, setSettings] = useState<SettingsMap>(cache ?? {});

  useEffect(() => {
    listeners.add(setSettings);
    if (!cache) load();

    const channel = supabase
      .channel(`app_settings_changes_${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "app_settings" }, () => load())
      .subscribe();

    return () => {
      listeners.delete(setSettings);
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    settings,
    salesHidden: settings.sales_hidden === true,
    setSetting: async (key: string, value: unknown) => {
      await supabase.from("app_settings").upsert({ key, value: value as never });
      await load();
    },
  };
};
