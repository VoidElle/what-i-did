import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarBlank, CaretLeft, CaretRight } from "@phosphor-icons/react";

interface Props {
  value: Date;
  onChange: (date: Date) => void;
}

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildGrid(viewMonth: Date): (Date | null)[] {
  const year = viewMonth.getFullYear();
  const month = viewMonth.getMonth();
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  return cells;
}

export function Calendar({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => startOfDay(value));
  const [pos, setPos] = useState<{ left: number; top: number }>({ left: 0, top: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const POPOVER_WIDTH = 240;

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const place = () => {
      const r = btnRef.current!.getBoundingClientRect();
      const margin = 8;
      let left = r.left;
      const maxLeft = window.innerWidth - POPOVER_WIDTH - margin;
      if (left > maxLeft) left = Math.max(margin, maxLeft);
      setPos({ left, top: r.bottom + 6 });
    };
    place();
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  useEffect(() => {
    if (open) setView(startOfDay(value));
  }, [open, value]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        btnRef.current && !btnRef.current.contains(t) &&
        popRef.current && !popRef.current.contains(t)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const today = startOfDay(new Date());
  const cells = buildGrid(view);

  const select = (d: Date) => {
    onChange(startOfDay(d));
    setOpen(false);
  };

  const shiftMonth = (delta: number) =>
    setView((v) => new Date(v.getFullYear(), v.getMonth() + delta, 1));

  const label = value.toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="relative">
      <button
        ref={btnRef}
        className="flex items-center gap-1.5 w-full text-left text-[13px] font-medium text-ink bg-surface-2 border border-bdr rounded-sm px-2.5 py-1.5 transition-[border-color,background] duration-150 ease-ui hover:border-[#3a3a44] hover:bg-surface-hover active:scale-[0.98]"
        onClick={() => setOpen((o) => !o)}
      >
        <CalendarBlank size={13} className="text-ink-muted flex-shrink-0" />
        <span className="truncate capitalize">{label}</span>
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          style={{ left: pos.left, top: pos.top, width: POPOVER_WIDTH }}
          className="fixed z-50 bg-surface border border-bdr rounded p-2.5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] animate-fade-up"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <button
              className="w-6 h-6 flex items-center justify-center rounded-sm text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors duration-150"
              onClick={() => shiftMonth(-1)}
              aria-label="Previous month"
            >
              <CaretLeft size={13} weight="bold" />
            </button>
            <span className="text-xs font-semibold text-ink">
              {MONTHS[view.getMonth()]} {view.getFullYear()}
            </span>
            <button
              className="w-6 h-6 flex items-center justify-center rounded-sm text-ink-muted hover:bg-surface-2 hover:text-ink transition-colors duration-150"
              onClick={() => shiftMonth(1)}
              aria-label="Next month"
            >
              <CaretRight size={13} weight="bold" />
            </button>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((w, i) => (
              <span
                key={i}
                className="text-center text-[9px] font-bold uppercase tracking-[0.5px] text-ink-faint py-1"
              >
                {w}
              </span>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  key={i}
                  disabled={d.getTime() > today.getTime()}
                  onClick={() => select(d)}
                  className={[
                    "h-7 flex items-center justify-center text-[11px] font-medium rounded-sm transition-colors duration-100",
                    sameDay(d, value)
                      ? "bg-accent text-bg font-semibold"
                      : "text-ink-muted hover:bg-surface-2 hover:text-ink",
                    sameDay(d, today) && !sameDay(d, value)
                      ? "border border-accent-border text-ink"
                      : "",
                    d.getTime() > today.getTime()
                      ? "opacity-30 cursor-not-allowed hover:bg-transparent hover:text-ink-faint"
                      : "",
                  ].join(" ")}
                >
                  {d.getDate()}
                </button>
              )
            )}
          </div>

          {/* Quick actions */}
          <div className="flex gap-1 mt-2 pt-2 border-t border-bdr-subtle">
            <button
              className="flex-1 text-[10px] font-medium text-ink-muted bg-surface-2 border border-bdr rounded-sm py-1 hover:text-ink hover:border-[#3a3a44] transition-colors duration-150"
              onClick={() => {
                const y = new Date(today);
                y.setDate(y.getDate() - 1);
                select(y);
              }}
            >
              Yesterday
            </button>
            <button
              className="flex-1 text-[10px] font-medium text-ink-muted bg-surface-2 border border-bdr rounded-sm py-1 hover:text-ink hover:border-[#3a3a44] transition-colors duration-150"
              onClick={() => select(today)}
            >
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
