import { useState } from "react";
import { useSourceConfig } from "./presentation/hooks/useSourceConfig";
import { SettingsScreen } from "./presentation/components/Settings";
import { MainScreen } from "./presentation/components/MainScreen";
import { JiraActivityRepository } from "./data/jira/repository";

type Screen = "main" | "settings";

const repo = new JiraActivityRepository();

function App() {
  const { config, loading, saveConfig } = useSourceConfig();
  const [screen, setScreen] = useState<Screen>("main");

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

  return (
    <MainScreen
      config={config}
      repo={repo}
      onOpenSettings={() => setScreen("settings")}
    />
  );
}

export default App;
