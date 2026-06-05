import { load } from "@tauri-apps/plugin-store";
import { useState, useEffect, useCallback } from "react";
import type { SourceConfig } from "../../domain/entities";

async function getStore() {
  return load("settings.json", { defaults: {}, autoSave: true });
}

export function useSourceConfig() {
  const [config, setConfig] = useState<SourceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStore().then(async (store) => {
      const baseUrl = await store.get<string>("baseUrl");
      const email = await store.get<string>("email");
      const token = await store.get<string>("token");
      const devMode = await store.get<boolean>("devMode") ?? false;
      const theme = await store.get<string>("theme") ?? "emerald";
      if (!cancelled) {
        setConfig(
          baseUrl && email && token ? { baseUrl, email, token, devMode, theme } : null
        );
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveConfig = useCallback(async (next: SourceConfig) => {
    const store = await getStore();
    await store.set("baseUrl", next.baseUrl);
    await store.set("email", next.email);
    await store.set("token", next.token);
    await store.set("devMode", next.devMode ?? false);
    await store.set("theme", next.theme ?? "emerald");
    setConfig(next);
  }, []);

  return { config, loading, saveConfig };
}
