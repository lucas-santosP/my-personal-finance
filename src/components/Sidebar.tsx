import { useState } from "react";
import { IconChevronLeft, IconChevronRight, IconDownload, IconLayoutDashboard, IconLogout, IconPlus, IconUpload } from "@tabler/icons-react";
import { LogoMark } from "./LogoMark";
import { MONTHS } from "../constants";
import { calcMonth, getYears, getMonthsForYear, monthKey } from "../utils/finance";
import { exportJSON, importJSON } from "../utils/io";
import { useAuth } from "../contexts/AuthContext";
import type { MonthsMap, View } from "../types";

interface Props {
  months: MonthsMap;
  setMonths: (data: MonthsMap) => void;
  view: View;
  setView: (v: View) => void;
  onAddMonth: (year: number, month: number) => void;
  onReplaceAll: (data: MonthsMap) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ months, setMonths, view, setView, onAddMonth, onReplaceAll, isOpen, onClose }: Props) {
  const { user, logout } = useAuth();
  const [viewYear, setViewYear] = useState(view.year ?? new Date().getFullYear());
  const years = getYears(months);
  const monthsInYear = getMonthsForYear(months, viewYear);

  const navigate = (v: View) => {
    setView(v);
    onClose();
  };

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
    navigate({ page: "month", year: viewYear, month: target });
  };

  const avatarLetter = user?.displayName?.[0] ?? user?.email?.[0] ?? "?";

  return (
    <aside
      className={[
        "fixed inset-y-0 left-0 z-40 flex flex-col bg-white border-r border-neutral-200 overflow-hidden w-72",
        "transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "md:relative md:inset-auto md:translate-x-0 md:z-auto md:flex-shrink-0",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex justify-between px-4 py-4 border-b border-neutral-200">
        <div className="flex items-center gap-2 mb-0.5">
          <LogoMark size={32} />
          <p className="text-sm font-semibold tracking-tight">My Finances</p>
        </div>

        <div className="flex items-center gap-1 mt-1.5">
          {!years.includes(viewYear) && (
            <button
              onClick={() => {
                onAddMonth(viewYear, 1);
                navigate({ page: "month", year: viewYear, month: 1 });
              }}
              className="ml-1 flex items-center gap-0.5 text-neutral-500 hover:text-neutral-700 border border-neutral-200 rounded px-1.5 py-1 bg-transparent cursor-pointer"
              style={{ fontSize: "10px" }}
            >
              <IconPlus size={10} />
              year
            </button>
          )}
          <button
            onClick={() => setViewYear((y) => y - 1)}
            className="p-0.5 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 bg-transparent border-none cursor-pointer"
          >
            <IconChevronLeft size={16} />
          </button>
          <span className="text-xs text-neutral-500 font-medium text-center" style={{ minWidth: "32px" }}>
            {viewYear}
          </span>
          <button
            onClick={() => setViewYear((y) => y + 1)}
            className="p-0.5 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 bg-transparent border-none cursor-pointer"
          >
            <IconChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-2 pt-3 pb-1">
        <button
          onClick={() => navigate({ page: "dashboard" })}
          className={`flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm text-left transition-colors border-none cursor-pointer ${
            view.page === "dashboard"
              ? "bg-neutral-100 text-neutral-900 font-medium"
              : "text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 bg-transparent"
          }`}
        >
          <IconLayoutDashboard size={16} />
          Dashboard
        </button>
      </div>

      <p className="px-4 pt-3 pb-1 text-neutral-500 uppercase tracking-widest" style={{ fontSize: "10px" }}>
        Months
      </p>

      {/* Month list */}
      <div className="flex-1 overflow-y-auto pb-2">
        {monthsInYear.length === 0 && <p className="px-4 py-3 text-xs text-neutral-500">No months yet.</p>}
        {monthsInYear.map((m) => {
          const active = view.page === "month" && view.year === viewYear && view.month === m;
          return (
            <button
              key={m}
              onClick={() => navigate({ page: "month", year: viewYear, month: m })}
              className={`flex items-center justify-between w-full px-4 py-2 text-sm text-left transition-colors border-none cursor-pointer ${
                active ? "bg-neutral-100 text-neutral-900 font-medium" : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 bg-transparent"
              }`}
            >
              <span>{MONTHS[m - 1]}</span>
              <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColor(viewYear, m)}`} />
            </button>
          );
        })}
      </div>

      {/* Footer actions */}
      <div className="border-t border-neutral-200 p-2.5 flex flex-col gap-1.5">
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-md border border-neutral-200 text-xs text-neutral-600 hover:bg-neutral-50 transition-colors bg-transparent cursor-pointer"
        >
          <IconPlus size={14} />
          New month
        </button>
        <div className="flex gap-1.5">
          <button
            onClick={() => exportJSON(months)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 bg-transparent cursor-pointer transition-colors"
          >
            <IconDownload size={14} />
            Export
          </button>
          <button
            onClick={() => importJSON(setMonths, onReplaceAll)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 bg-transparent cursor-pointer transition-colors"
          >
            <IconUpload size={14} />
            Import
          </button>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-2.5 px-2 pt-1.5 mt-0.5 border-t border-neutral-100">
          <div className="w-7 h-7 rounded-full bg-neutral-200 flex items-center justify-center text-xs font-semibold text-neutral-600 uppercase flex-shrink-0">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt="avatar"
                referrerPolicy="no-referrer"
                className="w-7 h-7 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.parentElement!.textContent = avatarLetter.toUpperCase();
                }}
              />
            ) : (
              avatarLetter
            )}
          </div>
          <span className="text-xs text-neutral-500 truncate flex-1 min-w-0">{user?.displayName ?? user?.email}</span>
          <button
            onClick={logout}
            title="Sign out"
            className="flex-shrink-0 p-1.5 rounded text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 bg-transparent border-none cursor-pointer"
          >
            <IconLogout size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
