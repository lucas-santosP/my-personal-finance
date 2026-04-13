import { useState } from "react";
import { IconCopy, IconMenu2, IconTrash } from "@tabler/icons-react";
import { MONTHS } from "../constants";
import { calcMonth, emptyMonth, mkId, monthKey } from "../utils/finance";
import { saveMonth, deleteMonthDoc } from "../utils/storage";
import { EntryModal } from "./EntryModal";
import { TableHeader } from "./TableHeader";
import { TableBody } from "./TableBody";
import type { Entry, MonthData, MonthsMap, Section, View } from "../types";

interface ModalState {
  open: boolean;
  section: Section;
  entry: Entry | null;
}

interface Props {
  uid: string;
  year: number;
  month: number;
  months: MonthsMap;
  setMonths: (updater: (prev: MonthsMap) => MonthsMap) => void;
  setView: (v: View) => void;
  onOpenSidebar: () => void;
}

export function MonthPage({ uid, year, month, months, setMonths, setView, onOpenSidebar }: Props) {
  const data = months[monthKey(year, month)] ?? emptyMonth();
  const { totalIncome, totalExpenses, balance, unpaid, pct } = calcMonth(data);
  const [modal, setModal] = useState<ModalState>({ open: false, section: "income", entry: null });
  const [confirmDel, setConfirmDel] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const [copyTarget, setCopyTarget] = useState({ year, month: month === 12 ? 1 : month + 1 });

  const updateData = (fn: (d: MonthData) => MonthData) => {
    setMonths((prev) => {
      const key = monthKey(year, month);
      const newData = fn(prev[key] ?? emptyMonth());
      saveMonth(uid, key, newData);
      return { ...prev, [key]: newData };
    });
  };

  const addEntry = (section: Section, entry: Omit<Entry, "id">) =>
    updateData((d) => ({ ...d, [section]: [...d[section], { ...entry, id: mkId() }] }));
  const updateEntry = (section: Section, updated: Entry) =>
    updateData((d) => ({
      ...d,
      [section]: d[section].map((e) => (e.id === updated.id ? updated : e)),
    }));
  const deleteEntry = (section: Section, id: string) => updateData((d) => ({ ...d, [section]: d[section].filter((e) => e.id !== id) }));
  const togglePaid = (section: Section, id: string) =>
    updateData((d) => ({
      ...d,
      [section]: d[section].map((e) => (e.id === id ? { ...e, paid: !e.paid } : e)),
    }));

  const handleSave = (entry: Omit<Entry, "id"> & { id?: string }) => {
    if (modal.entry) updateEntry(modal.section, entry as Entry);
    else addEntry(modal.section, entry);
    setModal({ open: false, section: "income", entry: null });
  };

  const handleDeleteMonth = () => {
    const key = monthKey(year, month);
    setMonths((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    deleteMonthDoc(uid, key);
    setView({ page: "dashboard" });
  };

  const handleCopy = () => {
    const remap = (entries: Entry[]) => entries.map((e) => ({ ...e, id: mkId(), paid: false }));
    const key = monthKey(Number(copyTarget.year), Number(copyTarget.month));
    const newData = { income: remap(data.income), expenses: remap(data.expenses) };
    setMonths((prev) => ({ ...prev, [key]: newData }));
    saveMonth(uid, key, newData);
    setView({ page: "month", year: Number(copyTarget.year), month: Number(copyTarget.month) });
    setShowCopy(false);
  };

  const allPaid = data.expenses.length > 0 && data.expenses.every((e) => e.paid);
  const totalEntries = data.income.length + data.expenses.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 pb-0 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={onOpenSidebar}
              className="md:hidden flex-shrink-0 p-1.5 -ml-1 rounded-md text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 border-none bg-transparent cursor-pointer"
            >
              <IconMenu2 size={20} />
            </button>
            <div className="min-w-0">
              <h1 className="text-xl font-medium truncate">
                {MONTHS[month - 1]} {year}
              </h1>
              <p className="text-xs text-neutral-400 mt-0.5">
                {allPaid ? "All paid · " : unpaid > 0 ? `${unpaid.toLocaleString("en-US", { style: "currency", currency: "USD" })} unpaid · ` : ""}
                {totalEntries} {totalEntries === 1 ? "entry" : "entries"}
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => setShowCopy(true)}
              className="flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-neutral-50 bg-transparent cursor-pointer"
            >
              <IconCopy size={14} />
              <span className="hidden sm:inline">Copy to month</span>
            </button>
            <button
              onClick={() => setConfirmDel(true)}
              className="flex items-center gap-1.5 px-3 md:px-3.5 py-2 rounded-md border border-neutral-200 text-xs text-neutral-500 hover:bg-red-50 hover:text-red-700 hover:border-red-200 bg-transparent cursor-pointer"
            >
              <IconTrash size={14} />
              <span className="hidden sm:inline">Delete month</span>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-neutral-200 mt-4">
          {[
            { label: "Income", value: totalIncome, cls: "text-green-800" },
            { label: "Expenses", value: totalExpenses, cls: "text-red-700" },
            {
              label: "Balance",
              value: balance,
              cls: balance >= 0 ? "text-green-800" : "text-red-700",
            },
            {
              label: "Unpaid",
              value: unpaid,
              cls: unpaid > 0 ? "text-amber-700" : "text-neutral-400",
            },
          ].map((s, i) => (
            <div
              key={i}
              className={`px-4 md:px-5 py-3 border-neutral-200
                ${i % 2 === 0 ? "border-r" : ""}
                ${i < 2 ? "border-b md:border-b-0" : ""}
                ${i === 1 ? "md:border-r" : ""}
              `}
            >
              <p className="text-xs text-neutral-400 mb-1">{s.label}</p>
              <p className={`text-base font-medium ${s.cls}`}>
                {s.value.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                  minimumFractionDigits: 2,
                })}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Tables — desktop: fixed split layout; mobile: scrollable */}
      <div className="flex-1 min-h-0 flex flex-col gap-3 p-4 md:px-6 overflow-y-auto md:overflow-hidden">
        {/* Income */}
        <div className="flex flex-col min-h-0 flex-shrink-0 md:max-h-[35%] bg-white rounded-md border border-neutral-200 overflow-hidden">
          <TableHeader section="income" entries={data.income} onAdd={() => setModal({ open: true, section: "income", entry: null })} />
          <div className="overflow-auto flex-1">
            <TableBody
              section="income"
              entries={data.income}
              year={year}
              month={month}
              onEdit={(e) => setModal({ open: true, section: "income", entry: e })}
              onDelete={(id) => deleteEntry("income", id)}
              onToggle={(id) => togglePaid("income", id)}
            />
          </div>
        </div>

        {/* Expenses */}
        <div className="flex flex-col min-h-0 md:flex-1 bg-white rounded-md border border-neutral-200 overflow-hidden">
          <TableHeader section="expenses" entries={data.expenses} onAdd={() => setModal({ open: true, section: "expenses", entry: null })} />
          <div className="overflow-auto flex-1">
            <TableBody
              section="expenses"
              entries={data.expenses}
              year={year}
              month={month}
              onEdit={(e) => setModal({ open: true, section: "expenses", entry: e })}
              onDelete={(id) => deleteEntry("expenses", id)}
              onToggle={(id) => togglePaid("expenses", id)}
            />
          </div>
        </div>

        {/* Spending rate */}
        {totalIncome > 0 && (
          <div className="flex-shrink-0 bg-white rounded-md border border-neutral-200 px-5 py-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-neutral-500">Spending rate</span>
              <span className={`text-sm font-medium ${pct > 90 ? "text-red-700" : pct > 70 ? "text-amber-700" : "text-green-800"}`}>{pct}%</span>
            </div>
            <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pct > 90 ? "bg-red-400" : pct > 70 ? "bg-amber-400" : "bg-green-500"}`}
                style={{ width: `${Math.min(pct, 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {modal.open && (
        <EntryModal
          section={modal.section}
          entry={modal.entry}
          onSave={handleSave}
          onClose={() => setModal({ open: false, section: "income", entry: null })}
          year={year}
          month={month}
        />
      )}

      {confirmDel && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-md border border-neutral-200 max-w-sm w-full p-5">
            <p className="text-sm font-medium mb-1">Delete {MONTHS[month - 1]}?</p>
            <p className="text-sm text-neutral-500 mb-4">All entries will be permanently removed.</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmDel(false)}
                className="px-4 py-2 rounded-md border border-neutral-200 text-sm hover:bg-neutral-50 bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteMonth}
                className="px-4 py-2 rounded-md bg-red-50 text-red-700 text-sm hover:bg-red-100 border-none cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showCopy && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-md border border-neutral-200 max-w-sm w-full p-5">
            <p className="text-sm font-medium mb-1">Copy to another month</p>
            <p className="text-sm text-neutral-500 mb-4">All entries copied. Status resets to unpaid.</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Year</label>
                <input
                  type="number"
                  value={copyTarget.year}
                  onChange={(e) => setCopyTarget((t) => ({ ...t, year: Number(e.target.value) }))}
                  className="px-3 py-2 rounded-md border border-neutral-200 text-sm outline-none w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Month</label>
                <select
                  value={copyTarget.month}
                  onChange={(e) => setCopyTarget((t) => ({ ...t, month: Number(e.target.value) }))}
                  className="px-3 py-2 rounded-md border border-neutral-200 text-sm outline-none bg-white w-full"
                >
                  {MONTHS.map((n, i) => (
                    <option key={i} value={i + 1}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowCopy(false)}
                className="px-4 py-2 rounded-md border border-neutral-200 text-sm hover:bg-neutral-50 bg-transparent cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleCopy}
                className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-700 border-none cursor-pointer"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
