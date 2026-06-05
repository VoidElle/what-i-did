import { load } from "@tauri-apps/plugin-store";
import { useState, useEffect, useCallback } from "react";
import type { JiraConnection, SourceConfig } from "../../domain/entities";

async function getStore() {
  return load("settings.json", { defaults: {}, autoSave: true });
}

function makeId(): string {
  return crypto.randomUUID();
}

export function useSourceConfig() {
  const [config, setConfig] = useState<SourceConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getStore().then(async (store) => {
      // Migration: old flat keys → connections array
      const legacyBaseUrl = await store.get<string>("baseUrl");
      const legacyEmail   = await store.get<string>("email");
      const legacyToken   = await store.get<string>("token");
      const hasConnections = await store.has("connections");

      if (!hasConnections && legacyBaseUrl && legacyEmail && legacyToken) {
        const migrated: JiraConnection[] = [{
          id: makeId(),
          name: "Jira",
          baseUrl: legacyBaseUrl,
          email: legacyEmail,
          token: legacyToken,
        }];
        await store.set("connections", migrated);
        await store.delete("baseUrl");
        await store.delete("email");
        await store.delete("token");
      }

      const connections = await store.get<JiraConnection[]>("connections") ?? [];
      const devMode = await store.get<boolean>("devMode") ?? false;
      const theme   = await store.get<string>("theme") ?? "emerald";
      const language = await store.get<"en" | "it">("language") ?? "en";

      if (!cancelled) {
        setConfig({ connections, devMode, theme, language });
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const saveConfig = useCallback(async (next: SourceConfig) => {
    const store = await getStore();
    await store.set("connections", next.connections);
    await store.set("devMode", next.devMode ?? false);
    await store.set("theme", next.theme ?? "emerald");
    await store.set("language", next.language ?? "en");
    setConfig(next);
  }, []);

  return { config, loading, saveConfig };
}
