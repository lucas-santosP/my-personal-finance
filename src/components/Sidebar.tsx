import { useState } from "react";
import { MONTHS } from "../constants";
import { calcMonth, getYears, getMonthsForYear, monthKey } from "../utils/finance";
import { exportJSON, importJSON } from "../utils/io";
import type { MonthsMap, View } from "../types";

interface Props {
  months: MonthsMap;
  setMonths: (data: MonthsMap) => void;
  view: View;
  setView: (v: View) => void;
  onAddMonth: (year: number, month: number) => void;
}

export function Sidebar({ months, setMonths, view, setView, onAddMonth }: Props) {
  const [viewYear, setViewYear] = useState(view.year ?? new Date().getFullYear());
  const years = getYears(months);
  const monthsInYear = getMonthsForYear(months, viewYear);

  const dotColor = (y: number, m: number) => {
    const d = months[monthKey(y, m)];
    if (!d) return "bg-neutral-300";
    const { balance } = calcMonth(d);
    return balance > 0 ? "bg-green-600" : balance < 0 ? "bg-red-500" : "bg-neutral-300";
  };

  const handleAdd = () => {
    const existing = new Set(monthsInYear);
    let target: number | null = null;
    for (let m = 1; m <= 12; m++) {
      if (!existing.has(m)) {
        target = m;
        break;
      }
    }
    if (!target) return;
    onAddMonth(viewYear, target);
    setView({ page: "month", year: viewYear, month: target });
  };

  return (
    <aside className="flex-shrink-0 flex flex-col bg-white border-r border-neutral-200 overflow-hidden w-72">
      <div className="px-4 py-4 border-b border-neutral-200">
        <p className="text-sm font-medium">Finances</p>
        <div className="flex items-center gap-1 mt-1.5">
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="px-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 text-sm bg-transparent border-none cursor-pointer"
          >
            ‹
          </button>
          <span
            className="text-xs text-neutral-500 font-medium text-center"
            style={{ minWidth: "32px" }}
          >
            {viewYear}
          </span>
          <button
            onClick={() => setViewYear((y) => y + 1)}
            className="px-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 text-sm bg-transparent border-none cursor-pointer"
          >
            ›
          </button>
          {!years.includes(viewYear) && (
            <button
              onClick={() => {
                onAddMonth(viewYear, 1);
                setView({ page: "month", year: viewYear, month: 1 });
              }}
              className="ml-1 text-neutral-400 hover:text-neutral-700 border border-neutral-200 rounded px-1.5 py-0.5 bg-transparent cursor-pointer"
              style={{ fontSize: "10px" }}
            >
              + year
            </button>
          )}
        </div>
      </div>
      <div className="px-2 pt-3 pb-1">
        <button
          onClick={() => setView({ page: "dashboard" })}
          className={`flex items-center gap-2 w-full px-3 py-1.5 rounded-lg text-sm text-left transition-colors border-none cursor-pointer ${
            view.page === "dashboard"
              ? "bg-neutral-100 text-neutral-900 font-medium"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 bg-transparent"
          }`}
        >
          ▦ Dashboard
        </button>
      </div>
      <p
        className="px-4 pt-3 pb-1 text-neutral-400 uppercase tracking-widest"
        style={{ fontSize: "10px" }}
      >
        Months
      </p>
      <div className="flex-1 overflow-y-auto pb-2">
        {monthsInYear.length === 0 && (
          <p className="px-4 py-3 text-xs text-neutral-400">No months yet.</p>
        )}
        {monthsInYear.map((m) => {
          const active = view.page === "month" && view.year === viewYear && view.month === m;
          return (
            <button
              key={m}
              onClick={() => setView({ page: "month", year: viewYear, month: m })}
              className={`flex items-center justify-between w-full px-4 py-1.5 text-sm text-left transition-colors border-none cursor-pointer ${
                active
                  ? "bg-neutral-100 text-neutral-900 font-medium"
                  : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 bg-transparent"
              }`}
            >
              <span>{MONTHS[m - 1]}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(viewYear, m)}`} />
            </button>
          );
        })}
      </div>
      <div className="border-t border-neutral-200 p-2.5 flex flex-col gap-1.5">
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors bg-transparent cursor-pointer"
        >
          + New month
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => exportJSON(months)}
            className="flex-1 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 bg-transparent cursor-pointer transition-colors"
          >
            ↓ Export
          </button>
          <button
            onClick={() => importJSON(setMonths)}
            className="flex-1 py-1.5 rounded-lg border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 bg-transparent cursor-pointer transition-colors"
          >
            ↑ Import
          </button>
        </div>
      </div>
    </aside>
  );
}
