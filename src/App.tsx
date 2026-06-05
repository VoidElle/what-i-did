import { useState, useEffect } from "react";
import { useSourceConfig } from "./presentation/hooks/useSourceConfig";
import { SettingsScreen } from "./presentation/components/Settings";
import { CustomizationScreen } from "./presentation/components/CustomizationScreen";
import { MainScreen } from "./presentation/components/MainScreen";
import { JiraActivityRepository } from "./data/jira/repository";

type Screen = "main" | "settings" | "customization";

const repo = new JiraActivityRepository();

function App() {
  const { config, loading, saveConfig } = useSourceConfig();
  const [screen, setScreen] = useState<Screen>("main");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", config?.theme ?? "emerald");
  }, [config?.theme]);

  if (loading) {
    return (
      <div className="splash">
        <span className="spinner" />
      </div>
    );
  }

  if (!config || screen === "settings") {
    return (
      <SettingsScreen
        initialConfig={config}
        onSave={(cfg) => {
          saveConfig(cfg);
          setScreen("main");
        }}
        canCancel={!!config}
        onCancel={() => setScreen("main")}
      />
    );
  }

  if (screen === "customization") {
    return (
      <CustomizationScreen
        config={config}
        onSave={(cfg) => saveConfig(cfg)}
        onCancel={() => setScreen("main")}
      />
    );
  }

  return (
    <>
      <div className="noise-overlay" aria-hidden="true" />
      <MainScreen
        config={config}
        repo={repo}
        onOpenSettings={() => setScreen("settings")}
        onOpenCustomization={() => setScreen("customization")}
      />
    </>
  );
}

export default App;
