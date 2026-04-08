import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { DayPicker } from "react-day-picker";

const POPOVER_W = 230;
const POPOVER_H = 290;

interface Props {
  year: number;
  month: number; // 1-12
  value: number | null; // day 1-31
  onChange: (day: number | null) => void;
  placeholder?: string;
  className?: string;
}

export function DayPickerInput({
  year,
  month,
  value,
  onChange,
  placeholder = "Pick a day",
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const selected = value ? new Date(year, month - 1, value) : undefined;
  const fixedMonth = new Date(year, month - 1, 1);

  const handleOpen = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      // Clamp horizontally so the popover never bleeds off-screen
      const left = Math.max(8, Math.min(r.left, vw - POPOVER_W - 8));

      // Prefer opening below; fall back to above if not enough room
      const spaceBelow = vh - r.bottom;
      const top =
        spaceBelow >= POPOVER_H + 8 ? r.bottom + 4 : Math.max(8, r.top - POPOVER_H - 4);

      setPos({ top, left });
    }
    setOpen((o) => !o);
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current?.contains(e.target as Node) ||
        popoverRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <input
        ref={triggerRef}
        readOnly
        value={value ? `Day ${value}` : ""}
        placeholder={placeholder}
        onClick={handleOpen}
        className={
          className ??
          "flex-1 min-w-0 px-3 py-2 rounded-lg border border-neutral-200 bg-white text-sm outline-none cursor-pointer"
        }
      />
      {open &&
        createPortal(
          <div
            ref={popoverRef}
            style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
            className="bg-white border border-neutral-200 rounded-xl shadow-lg p-3 w-[230px]"
          >
            <DayPicker
              mode="single"
              month={fixedMonth}
              disableNavigation
              selected={selected}
              onSelect={(date) => {
                onChange(date ? date.getDate() : null);
                setOpen(false);
              }}
              classNames={{
                months: "flex flex-col",
                month: "",
                caption: "flex justify-center items-center mb-2 px-0.5",
                caption_label: "text-xs font-medium text-neutral-600",
                nav: "hidden",
                nav_button: "",
                nav_button_previous: "",
                nav_button_next: "",
                table: "w-full border-collapse",
                head_row: "",
                head_cell: "text-center text-[10px] font-medium text-neutral-400 py-1 w-8",
                row: "",
                cell: "p-0.5 text-center",
                day: "w-8 h-8 inline-flex items-center justify-center rounded-md text-xs text-neutral-700 hover:bg-neutral-100 cursor-pointer transition-colors",
                day_selected:
                  "bg-neutral-900 text-white hover:bg-neutral-800 font-medium rounded-md",
                day_today: "text-green-600 font-semibold",
                day_outside: "opacity-0 pointer-events-none",
                day_disabled: "text-neutral-300 cursor-default hover:bg-transparent",
              }}
            />
          </div>,
          document.body,
        )}
    </>
  );
}
