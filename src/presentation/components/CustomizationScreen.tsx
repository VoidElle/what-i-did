import type { SourceConfig } from "../../domain/entities";
import { BrandIcon } from "./BrandIcon";
import { ArrowLeft } from "@phosphor-icons/react";
import { useTranslation } from "react-i18next";

const THEMES = [
  { id: "emerald", color: "#34d399", label: "Emerald" },
  { id: "indigo",  color: "#818cf8", label: "Indigo"  },
  { id: "rose",    color: "#fb7185", label: "Rose"    },
  { id: "sky",     color: "#38bdf8", label: "Sky"     },
  { id: "violet",  color: "#a78bfa", label: "Violet"  },
];

interface Props {
  config: SourceConfig;
  onSave: (config: SourceConfig) => void;
  onCancel: () => void;
}

function PillToggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      className="flex-shrink-0"
      onClick={() => onChange(!value)}
    >
      <div
        className="relative flex-shrink-0 w-7 h-4 rounded-full"
        style={{
          background: value ? "rgba(var(--accent-rgb), 0.7)" : "rgba(255,255,255,0.08)",
          transition: "background 200ms cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div
          className="absolute top-[2px] w-3 h-3 rounded-full"
          style={{
            background: value ? "#0d1410" : "rgba(255,255,255,0.35)",
            left: value ? "calc(100% - 14px)" : "2px",
            transition: "left 200ms cubic-bezier(0.34,1.56,0.64,1)",
          }}
        />
      </div>
    </button>
  );
}

export function CustomizationScreen({ config, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const theme = config.theme ?? "emerald";
  const devMode = config.devMode ?? false;
  const language = config.language ?? "en";

  const setTheme = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    onSave({ ...config, theme: id });
  };

  const setDevMode = (v: boolean) => {
    onSave({ ...config, devMode: v });
  };

  const setLanguage = (lang: "en" | "it") => {
    onSave({ ...config, language: lang });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left panel */}
      <div className="w-[280px] flex-shrink-0 bg-surface border-r border-bdr-subtle px-9 py-10 flex flex-col">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-[9px] flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--accent-dim)", border: "1px solid var(--accent-border)", color: "var(--accent)" }}>
            <BrandIcon size={16} />
          </div>
          <span className="text-[15px] font-semibold text-ink tracking-[-0.3px]">{t("appName")}</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-[1.65]">
          {t("customizationTagline")}
        </p>
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto px-12 py-12 pl-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-ink tracking-[-0.4px] mb-1.5">{t("customizationTitle")}</h1>
          <p className="text-[13px] text-ink-muted">
            {t("customizationSubtitle")}
          </p>
        </div>

        <div className="max-w-[400px] flex flex-col gap-8">
          {/* Accent color */}
          <div>
            <p className="text-[11px] font-semibold text-ink-muted tracking-[0.3px] mb-3">{t("accentColor")}</p>
            <div className="flex gap-3">
              {THEMES.map(({ id, color, label }) => (
                <button
                  key={id}
                  type="button"
                  title={label}
                  onClick={() => setTheme(id)}
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: color,
                    outline: theme === id ? `2px solid ${color}` : "none",
                    outlineOffset: 2,
                    transition: "outline 150ms cubic-bezier(0.16,1,0.3,1), transform 150ms cubic-bezier(0.16,1,0.3,1)",
                    flexShrink: 0,
                    transform: theme === id ? "scale(1.15)" : "scale(1)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <p className="text-[11px] font-semibold text-ink-muted tracking-[0.3px] mb-3">{t("language")}</p>
            <div className="flex gap-2">
              {(["en", "it"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className="px-3 py-1.5 rounded text-[12px] font-medium transition-all duration-150"
                  style={{
                    background: language === lang ? "rgba(var(--accent-rgb), 0.12)" : "rgba(255,255,255,0.04)",
                    border: language === lang ? "1px solid rgba(var(--accent-rgb), 0.3)" : "1px solid rgba(255,255,255,0.08)",
                    color: language === lang ? "var(--accent)" : "#7070a0",
                  }}
                >
                  {lang === "en" ? t("languageEn") : t("languageIt")}
                </button>
              ))}
            </div>
          </div>

          {/* Mock mode */}
          <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-ink-faint tracking-[0.2px] mb-0.5">{t("mockMode")}</p>
                <p className="text-[10px] leading-relaxed text-ink-faint">
                  {t("mockModeDesc")}
                </p>
              </div>
              <PillToggle value={devMode} onChange={setDevMode} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-10">
          <button
            className="group flex items-center gap-2 text-ink-faint text-[12px] font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:text-ink"
            style={{ border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)" }}
            onClick={onCancel}
          >
            <ArrowLeft size={13} weight="bold" className="transition-transform duration-200 group-hover:-translate-x-0.5" />
            {t("back")}
          </button>
        </div>
      </div>
    </div>
  );
}
