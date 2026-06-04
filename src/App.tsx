import { useState } from "react";
import { useJiraConfig } from "./hooks/useStore";
import { SettingsScreen } from "./components/Settings";
import { MainScreen } from "./components/MainScreen";

type Screen = "main" | "settings";

function App() {
  const { config, loading, saveConfig } = useJiraConfig();
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
    <MainScreen config={config} onOpenSettings={() => setScreen("settings")} />
  );
}

export default App;
