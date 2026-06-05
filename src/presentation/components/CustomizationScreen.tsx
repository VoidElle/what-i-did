import type { SourceConfig } from "../../domain/entities";
import { BrandIcon } from "./BrandIcon";

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
  const theme = config.theme ?? "emerald";
  const devMode = config.devMode ?? false;

  const setTheme = (id: string) => {
    document.documentElement.setAttribute("data-theme", id);
    onSave({ ...config, theme: id });
  };

  const setDevMode = (v: boolean) => {
    onSave({ ...config, devMode: v });
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
          <span className="text-[15px] font-semibold text-ink tracking-[-0.3px]">What I Did</span>
        </div>
        <p className="text-[13px] text-ink-muted leading-[1.65]">
          Personalize the look and behavior of the app.
        </p>
      </div>

      {/* Right content */}
      <div className="flex-1 overflow-y-auto px-12 py-12 pl-10 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-ink tracking-[-0.4px] mb-1.5">Customization</h1>
          <p className="text-[13px] text-ink-muted">
            Changes apply immediately and are saved automatically.
          </p>
        </div>

        <div className="max-w-[400px] flex flex-col gap-8">
          {/* Accent color */}
          <div>
            <p className="text-[11px] font-semibold text-ink-muted tracking-[0.3px] mb-3">Accent color</p>
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

          {/* Mock mode */}
          <div className="pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-[10px] text-ink-faint tracking-[0.2px] mb-0.5">Mock mode</p>
                <p className="text-[10px] leading-relaxed text-ink-faint">
                  Uses mock data. No Jira connection needed.
                </p>
              </div>
              <PillToggle value={devMode} onChange={setDevMode} />
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-10">
          <button
            className="flex items-center gap-1.5 text-ink-muted px-3.5 py-2 rounded-sm text-[13px] font-medium transition-[color,transform] duration-150 ease-ui hover:text-ink active:scale-[0.97]"
            style={{ border: "1px solid rgba(255,255,255,0.22)" }}
            onClick={onCancel}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
