import { useState } from "react";
import { Warning } from "@phosphor-icons/react";
import type { SourceConfig } from "../../domain/entities";
import { BrandIcon } from "./BrandIcon";

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
      {/* Left panel */}
      <div className="settings-panel-left">
        <div className="settings-brand">
          <div className="settings-brand-icon">
            <BrandIcon size={16} />
          </div>
          <span className="settings-brand-name">WhatDidIDo</span>
        </div>
        <p className="settings-tagline">
          Connect your Jira account to see what you worked on yesterday, ready to paste into standup.
        </p>
        <ol className="settings-step-list">
          <li className="settings-step">
            <span className="settings-step-num">1</span>
            Enter your Jira Cloud URL
          </li>
          <li className="settings-step">
            <span className="settings-step-num">2</span>
            Add your account email
          </li>
          <li className="settings-step">
            <span className="settings-step-num">3</span>
            Paste your API token
          </li>
        </ol>
      </div>

      {/* Right form */}
      <div className="settings-panel-right">
        <div className="settings-form-header">
          <h1 className="settings-form-title">Jira Connection</h1>
          <p className="settings-form-subtitle">
            Your credentials are stored locally and never leave this device.
          </p>
        </div>

        <div className="settings-form">
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
            <label htmlFor="token">API Token</label>
            <input
              id="token"
              type="password"
              placeholder="Your Jira API token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
            />
            <small className="field-hint">
              Generate at: Profile → Security → Create API Token
            </small>
          </div>

          {error && (
            <div className="form-error">
              <Warning size={13} />
              {error}
            </div>
          )}

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
    </div>
  );
}
