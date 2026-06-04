import { load } from "@tauri-apps/plugin-store";
import { useState, useEffect, useCallback } from "react";
import type { JiraConfig } from "../types/jira";

async function getStore() {
  return load("settings.json", { defaults: {}, autoSave: true });
}

export function useJiraConfig() {
  const [config, setConfig] = useState<JiraConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStore().then(async (store) => {
      const baseUrl = await store.get<string>("baseUrl");
      const email = await store.get<string>("email");
      const token = await store.get<string>("token");
      if (!cancelled) {
        setConfig(
          baseUrl && email && token ? { baseUrl, email, token } : null
        );
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveConfig = useCallback(async (next: JiraConfig) => {
    const store = await getStore();
    await store.set("baseUrl", next.baseUrl);
    await store.set("email", next.email);
    await store.set("token", next.token);
    setConfig(next);
  }, []);

  return { config, loading, saveConfig };
}
