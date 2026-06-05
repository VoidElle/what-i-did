import { useState } from "react";
import { Plus, Trash, Warning, ArrowLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";
import type { JiraConnection, SourceConfig } from "../../domain/entities";
import { BrandIcon } from "./BrandIcon";

interface SettingsProps {
  initialConfig: SourceConfig | null;
  onSave: (config: SourceConfig) => void;
  canCancel: boolean;
  onCancel: () => void;
}

const EMPTY_FORM = { name: "", baseUrl: "", email: "", token: "" };

function ConnectionForm({
  value,
  onChange,
  onSave,
  onDelete,
  onCancel,
  canDelete,
  canCancel,
  isNew,
}: {
  value: typeof EMPTY_FORM;
  onChange: (v: typeof EMPTY_FORM) => void;
  onSave: () => void;
  onDelete?: () => void;
  onCancel: () => void;
  canDelete: boolean;
  canCancel: boolean;
  isNew: boolean;
}) {
  const { t } = useTranslation();
  const [error, setError] = useState("");

  const handleSave = () => {
    if (!value.name.trim() || !value.baseUrl.trim() || !value.email.trim() || !value.token.trim()) {
      setError(t("validationAllRequired"));
      return;
    }
    setError("");
    onSave();
  };

  const fields = [
    { id: "name",    label: t("fieldNameLabel"),    type: "text",     placeholder: t("fieldNamePlaceholder"),    key: "name"    as const },
    { id: "baseUrl", label: t("fieldBaseUrlLabel"), type: "url",      placeholder: t("fieldBaseUrlPlaceholder"), key: "baseUrl" as const },
    { id: "email",   label: t("fieldEmailLabel"),   type: "email",    placeholder: t("fieldEmailPlaceholder"),   key: "email"   as const },
    { id: "token",   label: t("fieldTokenLabel"),   type: "password", placeholder: t("fieldTokenPlaceholder"),   key: "token"   as const,
      hint: t("fieldTokenHint") },
  ];

  return (
    <div className="max-w-[400px] flex-1">
      {fields.map(({ id, label, type, placeholder, key, hint }) => (
        <div key={id} className="mb-5">
          <label htmlFor={id} className="block text-[11px] font-semibold text-ink-muted tracking-[0.3px] mb-[7px]">
            {label}
          </label>
          <input
            id={id}
            type={type}
            placeholder={placeholder}
            value={value[key]}
            onChange={(e) => onChange({ ...value, [key]: e.target.value })}
            className="w-full bg-surface border border-bdr rounded-sm px-3 py-[9px] text-ink text-[13px] font-sans outline-none transition-[border-color,box-shadow] duration-[180ms] focus:border-accent-border focus:shadow-[0_0_0_3px_var(--accent-glow)] placeholder:text-ink-faint"
          />
          {hint && <small className="block mt-1 text-[11px] text-ink-faint leading-[1.5]">{hint}</small>}
        </div>
      ))}

      {error && (
        <div className="flex items-center gap-1.5 text-danger-text text-xs mb-4 px-2.5 py-2 bg-danger-bg border border-danger-border rounded-sm">
          <Warning size={13} />
          {error}
        </div>
      )}

      <div className="flex items-center gap-2 mt-6">
        <button
          className="text-[#0d1410] px-[18px] py-2 rounded-sm font-semibold text-[13px] transition-[opacity,transform] duration-150 ease-ui hover:opacity-[0.88] active:scale-[0.97]"
          style={{ background: "var(--accent)" }}
          onClick={handleSave}
        >
          {isNew ? t("add") : t("save")}
        </button>
        {canCancel && (
          <button
            className="bg-transparent text-ink-muted px-3.5 py-2 rounded-sm text-[13px] font-medium transition-[color,transform] duration-150 ease-ui hover:text-ink active:scale-[0.97]"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}
            onClick={onCancel}
          >
            {t("cancel")}
          </button>
        )}
        {canDelete && onDelete && (
          <button
            className="ml-auto flex items-center gap-1.5 text-danger-text/60 px-2.5 py-2 rounded text-[12px] transition-[color,transform] duration-150 ease-ui hover:text-danger-text active:scale-[0.97]"
            onClick={onDelete}
          >
            <Trash size={12} />
            {t("remove")}
          </button>
        )}
      </div>
    </div>
  );
}

export function SettingsScreen({ initialConfig, onSave, canCancel, onCancel }: SettingsProps) {
  const { t } = useTranslation();
  const existing = initialConfig?.connections ?? [];

  const [connections, setConnections] = useState<JiraConnection[]>(existing);
  const [selectedId, setSelectedId] = useState<string | "new">(
    existing.length > 0 ? existing[0].id : "new"
  );
  const [form, setForm] = useState<typeof EMPTY_FORM>(() => {
    if (existing.length > 0) {
      const c = existing[0];
      return { name: c.name, baseUrl: c.baseUrl, email: c.email, token: c.token };
    }
    return { ...EMPTY_FORM };
  });

  const selectConnection = (id: string | "new") => {
    setSelectedId(id);
    if (id === "new") {
      setForm({ ...EMPTY_FORM });
    } else {
      const c = connections.find((x) => x.id === id)!;
      setForm({ name: c.name, baseUrl: c.baseUrl, email: c.email, token: c.token });
    }
  };

  const handleSave = () => {
    let updated: JiraConnection[];
    if (selectedId === "new") {
      const newConn: JiraConnection = {
        id: crypto.randomUUID(),
        name: form.name.trim(),
        baseUrl: form.baseUrl.replace(/\/$/, "").trim(),
        email: form.email.trim(),
        token: form.token.trim(),
      };
      updated = [...connections, newConn];
      setConnections(updated);
      setSelectedId(newConn.id);
    } else {
      updated = connections.map((c) =>
        c.id === selectedId
          ? { ...c, name: form.name.trim(), baseUrl: form.baseUrl.replace(/\/$/, "").trim(), email: form.email.trim(), token: form.token.trim() }
          : c
      );
      setConnections(updated);
    }
    onSave({
      connections: updated,
      devMode: initialConfig?.devMode ?? false,
      theme: initialConfig?.theme ?? "emerald",
    });
  };

  const handleDelete = () => {
    if (selectedId === "new") return;
    const updated = connections.filter((c) => c.id !== selectedId);
    setConnections(updated);
    const next = updated.length > 0 ? updated[0].id : "new";
    selectConnection(next);
    onSave({
      connections: updated,
      devMode: initialConfig?.devMode ?? false,
      theme: initialConfig?.theme ?? "emerald",
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-[260px] flex-shrink-0 bg-surface border-r border-bdr-subtle flex flex-col">
        <div className="px-6 pt-7 pb-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-7 h-7 rounded-[9px] flex items-center justify-center flex-shrink-0"
              style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
              <BrandIcon size={14} />
            </div>
            <span className="text-[14px] font-semibold text-ink tracking-[-0.3px]">{t("appName")}</span>
          </div>
          <p className="text-[11px] text-ink-faint mt-3 leading-[1.6]">
            {t("settingsTagline")}
          </p>
        </div>

        {/* Connection list */}
        <div className="flex-1 overflow-y-auto py-2 scrollbar-custom">
          {connections.map((c) => (
            <button
              key={c.id}
              className="w-full text-left px-4 py-2.5 transition-colors duration-100"
              style={{
                background: selectedId === c.id ? "rgba(255,255,255,0.05)" : "transparent",
                borderLeft: selectedId === c.id ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onClick={() => selectConnection(c.id)}
            >
              <p className="text-[12px] font-medium text-ink truncate">{c.name}</p>
              <p className="text-[10px] text-ink-faint truncate mt-0.5">{c.baseUrl.replace(/^https?:\/\//, "")}</p>
            </button>
          ))}
          {connections.length === 0 && (
            <p className="px-4 py-3 text-[11px] text-ink-faint">{t("noConnections")}</p>
          )}
        </div>

        {/* Add button */}
        <div className="px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <button
            className="flex items-center gap-1.5 w-full px-2.5 py-2 rounded text-[11px] font-medium text-ink-faint transition-colors duration-100 hover:text-ink"
            style={{ background: selectedId === "new" ? "rgba(255,255,255,0.05)" : "transparent" }}
            onClick={() => selectConnection("new")}
          >
            <Plus size={11} weight="bold" />
            {t("addConnection")}
          </button>
        </div>

        {canCancel && (
          <div className="px-4 pb-4">
            <button
              className="group flex items-center gap-2 text-ink-faint text-[12px] font-medium px-3 py-2 rounded-lg w-full transition-all duration-200 hover:text-ink"
              style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
              onClick={onCancel}
            >
              <ArrowLeft size={13} weight="bold" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
              {t("back")}
            </button>
          </div>
        )}
      </div>

      {/* Right form */}
      <div className="flex-1 overflow-y-auto px-10 py-10 flex flex-col">
        <div className="mb-7">
          <h1 className="text-xl font-semibold text-ink tracking-[-0.4px] mb-1">
            {selectedId === "new" ? t("newConnection") : (connections.find(c => c.id === selectedId)?.name ?? t("newConnection"))}
          </h1>
          <p className="text-[13px] text-ink-muted">{t("settingsSubtitle")}</p>
        </div>

        <ConnectionForm
          value={form}
          onChange={setForm}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => selectConnection(connections[0]?.id ?? "new")}
          canDelete={selectedId !== "new" && connections.length > 0}
          canCancel={selectedId === "new" && connections.length > 0}
          isNew={selectedId === "new"}
        />
      </div>
    </div>
  );
}
