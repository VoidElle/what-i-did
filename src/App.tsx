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

  const needsOnboarding = !config || config.connections.length === 0;

  return (
    <>
      {/* MainScreen is always mounted once onboarded — preserves fetch cache */}
      {config && config.connections.length > 0 && (
        <div className={screen !== "main" ? "hidden" : ""}>
          <div className="noise-overlay" aria-hidden="true" />
          <MainScreen
            config={config}
            repo={repo}
            onOpenSettings={() => setScreen("settings")}
            onOpenCustomization={() => setScreen("customization")}
          />
        </div>
      )}

      {(needsOnboarding || screen === "settings") && (
        <SettingsScreen
          initialConfig={config}
          onSave={(cfg) => {
            saveConfig(cfg);
            setScreen("main");
          }}
          canCancel={!needsOnboarding}
          onCancel={() => setScreen("main")}
        />
      )}

      {screen === "customization" && config && (
        <CustomizationScreen
          config={config}
          onSave={(cfg) => saveConfig(cfg)}
          onCancel={() => setScreen("main")}
        />
      )}
    </>
  );
}

export default App;
