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
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-[280px] flex-shrink-0 bg-surface border-r border-bdr-subtle px-9 py-10 flex flex-col">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 bg-accent-dim border border-accent-border rounded-[9px] flex items-center justify-center text-accent">
            <BrandIcon size={16} />
          </div>
          <span className="text-[15px] font-semibold text-ink tracking-[-0.3px]">What I Did</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-[1.65] mb-8">
          Connect your Jira account to see what you worked on yesterday, ready to paste into standup.
        </p>
        <ol className="flex flex-col gap-3.5 list-none">
          {[
            "Enter your Jira Cloud URL",
            "Add your account email",
            "Paste your API token",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs text-ink-muted leading-[1.5]">
              <span className="w-[18px] h-[18px] rounded-full bg-surface-2 border border-bdr flex items-center justify-center text-[10px] font-bold font-mono flex-shrink-0 text-ink-faint mt-[1px]">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      {/* Right form */}
      <div className="flex-1 overflow-y-auto px-12 py-12 pl-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-ink tracking-[-0.4px] mb-1.5">Jira Connection</h1>
          <p className="text-[13px] text-ink-muted">
            Your credentials are stored locally and never leave this device.
          </p>
        </div>

        <div className="max-w-[400px] flex-1">
          {[
            { id: "baseUrl", label: "Jira Base URL", type: "url", placeholder: "https://mycompany.atlassian.net", value: baseUrl, onChange: setBaseUrl },
            { id: "email",   label: "Email",          type: "email", placeholder: "you@company.com",              value: email,   onChange: setEmail },
            { id: "token",   label: "API Token",      type: "password", placeholder: "Your Jira API token",       value: token,   onChange: setToken,
              hint: "Generate at: Profile - Security - Create API Token" },
          ].map(({ id, label, type, placeholder, value, onChange, hint }) => (
            <div key={id} className="mb-5">
              <label htmlFor={id} className="block text-[11px] font-semibold text-ink-muted tracking-[0.3px] mb-[7px]">
                {label}
              </label>
              <input
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-surface border border-bdr rounded-sm px-3 py-[9px] text-ink text-[13px] font-sans outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent-border focus:shadow-[0_0_0_3px_rgba(52,211,153,0.09)] placeholder:text-ink-faint"
              />
              {hint && (
                <small className="block mt-1 text-[11px] text-ink-faint leading-[1.5]">{hint}</small>
              )}
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-1.5 text-danger-text text-xs mb-4 px-2.5 py-2 bg-danger-bg border border-danger-border rounded-sm">
              <Warning size={13} />
              {error}
            </div>
          )}

          <div className="flex gap-2 mt-7">
            <button
              className="bg-accent text-[#0d1410] px-[18px] py-2 rounded-sm font-semibold text-[13px] transition-[opacity,transform] duration-150 ease-ui hover:opacity-[0.88] active:scale-[0.97]"
              onClick={handleSave}
            >
              Save
            </button>
            {canCancel && (
              <button
                className="bg-transparent text-ink-muted px-3.5 py-2 rounded-sm border border-bdr text-[13px] transition-[border-color,color,transform] duration-150 ease-ui hover:border-[#3a3a44] hover:text-ink active:scale-[0.97]"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
