import { useState } from "react";
import type { SourceConfig } from "../../domain/entities";

interface SettingsProps {
  initialConfig: SourceConfig | null;
  onSave: (config: SourceConfig) => void;
  canCancel: boolean;
  onCancel: () => void;
}

export function SettingsScreen({
  initialConfig,
  onSave,
  canCancel,
  onCancel,
}: SettingsProps) {
  const [baseUrl, setBaseUrl] = useState(initialConfig?.baseUrl ?? "");
  const [email, setEmail] = useState(initialConfig?.email ?? "");
  const [token, setToken] = useState(initialConfig?.token ?? "");
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!baseUrl.trim() || !email.trim() || !token.trim()) {
      setError("All fields are required.");
      return;
    }
    setError("");
    onSave({
      baseUrl: baseUrl.replace(/\/$/, "").trim(),
      email: email.trim(),
      token: token.trim(),
    });
  };

  return (
    <div className="settings-screen">
      <div className="settings-card">
        <h1>⚙️ Settings</h1>
        <p className="settings-subtitle">Configure your Jira connection.</p>

        <div className="form-group">
          <label htmlFor="baseUrl">Jira Base URL</label>
          <input
            id="baseUrl"
            type="url"
            placeholder="https://mycompany.atlassian.net"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="token">Personal Access Token</label>
          <input
            id="token"
            type="password"
            placeholder="Your Jira PAT"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <small className="field-hint">
            Generate at:{" "}
            <em>Your Profile → Security → Create API Token</em>
          </small>
        </div>

        {error && <p className="form-error">{error}</p>}

        <div className="form-actions">
          <button className="btn-primary" onClick={handleSave}>
            Save
          </button>
          {canCancel && (
            <button className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
