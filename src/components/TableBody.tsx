import { useState } from "react";
import { IconCheck, IconChevronDown, IconChevronUp, IconPencil, IconX } from "@tabler/icons-react";
import { fmt } from "../utils/finance";
import type { Entry, Section } from "../types";

type SortField = "description" | "kind" | "dueDay" | "category" | "value" | "paid";
type SortDir = "asc" | "desc";

function compareEntries(a: Entry, b: Entry, field: SortField, dir: SortDir): number {
  let cmp = 0;
  switch (field) {
    case "description":
    case "category":
      cmp = a[field].localeCompare(b[field]);
      break;
    case "kind":
      cmp = a.kind.localeCompare(b.kind);
      break;
    case "dueDay":
      cmp = (Number(a.dueDay) || 0) - (Number(b.dueDay) || 0);
      break;
    case "value":
      cmp = a.value - b.value;
      break;
    case "paid":
      cmp = Number(a.paid) - Number(b.paid);
      break;
  }
  return dir === "desc" ? -cmp : cmp;
}

function sortEntries(entries: Entry[], field: SortField, dir: SortDir): Entry[] {
  return [...entries].sort((a, b) => {
    const primary = compareEntries(a, b, field, dir);
    if (primary !== 0) return primary;
    // Secondary sort: always by type (kind)
    if (field !== "kind") return a.kind.localeCompare(b.kind);
    return 0;
  });
}

interface Props {
  section: Section;
  entries: Entry[];
  year: number;
  month: number;
  onEdit: (e: Entry) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export function TableBody({ section, entries, year, month, onEdit, onDelete, onToggle }: Props) {
  const isIncome = section === "income";
  const [sortField, setSortField] = useState<SortField>("dueDay");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(field: SortField) {
    if (sortField === field) {
      if (sortDir === "asc") {
        setSortDir("desc");
      } else {
        setSortField("dueDay");
        setSortDir("asc");
      }
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  const rows = sortEntries(entries, sortField, sortDir);
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;

  if (rows.length === 0) return <div className="py-10 text-center text-sm text-neutral-400">No {isIncome ? "income" : "expenses"} yet.</div>;

  return (
    <>
      {/* ── Mobile: card list ───────────────────────────────────── */}
      <div className="md:hidden">
        {rows.map((e) => {
          const overdue = !isIncome && isCurrentMonth && e.dueDay && Number(e.dueDay) < today;
          return (
            <div key={e.id} className="px-4 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors">
              {/* Top row: description + paid toggle */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{e.description}</p>
                  {e.note && <p className="text-xs text-neutral-400 truncate mt-0.5">{e.note}</p>}
                </div>
                <span>{isIncome ? "Received" : "Paid"}</span>
                <button
                  onClick={() => onToggle(e.id)}
                  className={`flex-shrink-0 w-6 h-6 rounded-md inline-flex items-center justify-center border cursor-pointer transition-colors ${
                    e.paid
                      ? "bg-green-100 border-green-300 text-green-700"
                      : overdue
                        ? "bg-red-100 border-red-300 text-red-600"
                        : "bg-red-50 border-red-200 text-red-300 hover:border-red-400"
                  }`}
                >
                  <IconCheck size={12} style={{ opacity: e.paid ? 1 : 0 }} />
                </button>
              </div>

              {/* Bottom row: meta + value + actions */}
              <div className="flex items-center justify-between mt-2 gap-2">
                <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                  <span
                    className={`text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0 ${e.kind === "PF" ? "bg-blue-50 text-blue-800" : "bg-green-50 text-green-800"}`}
                  >
                    {e.kind}
                  </span>
                  {e.dueDay && <span className="text-xs text-neutral-400 flex-shrink-0">Day {e.dueDay}</span>}
                  <span className="text-xs px-1.5 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200 truncate">
                    {e.category}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`text-sm font-medium ${isIncome ? "text-green-800" : ""}`}>{fmt(e.value)}</span>
                  <button
                    onClick={() => onEdit(e)}
                    title="Edit"
                    className="p-1.5 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200 bg-transparent cursor-pointer"
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(e.id)}
                    title="Delete"
                    className="p-1.5 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-neutral-200 bg-transparent cursor-pointer"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop: table ──────────────────────────────────────── */}
      <table className="hidden md:table w-full border-collapse" style={{ tableLayout: "fixed", minWidth: "520px" }}>
        <colgroup>
          <col style={{ width: "28%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "10%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "16%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "12%" }} />
        </colgroup>
        <thead>
          <tr className="sticky top-0 bg-white z-10 shadow-[0_1px_0_0_theme(colors.neutral.200)]">
            {(
              [
                { label: "Description", field: "description" as SortField },
                { label: "Type", field: "kind" as SortField },
                { label: isIncome ? "Date" : "Due", field: "dueDay" as SortField },
                { label: "Category", field: "category" as SortField },
                { label: "Value", field: "value" as SortField },
                { label: isIncome ? "Received" : "Paid", field: "paid" as SortField },
                { label: "", field: null },
              ] as const
            ).map((h, i) => (
              <th
                key={i}
                className={`px-3 py-2 font-normal border-b border-neutral-200 text-xs text-neutral-400 ${i >= 4 ? "text-right" : "text-left"} ${h.field ? "cursor-pointer select-none hover:text-neutral-600" : ""}`}
                onClick={h.field ? () => handleSort(h.field!) : undefined}
              >
                <span className={`inline-flex items-center gap-0.5 ${i >= 4 ? "justify-end" : ""}`}>
                  {h.label}
                  {h.field && sortField === h.field && (sortDir === "asc" ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />)}
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((e) => (
            <tr key={e.id} className="group hover:bg-neutral-50 transition-colors border-b border-neutral-100">
              <td className="px-3 py-2.5">
                <p className="text-sm font-medium truncate">{e.description}</p>
                {e.note && <p className="text-xs text-neutral-400 truncate">{e.note}</p>}
              </td>
              <td className="px-3 py-2.5">
                <span
                  className={`text-xs font-medium px-1.5 py-0.5 rounded ${e.kind === "PF" ? "bg-blue-50 text-blue-800" : "bg-green-50 text-green-800"}`}
                >
                  {e.kind}
                </span>
              </td>
              <td className="px-3 py-2.5 text-sm text-neutral-500">{e.dueDay ? `Day ${e.dueDay}` : "—"}</td>
              <td className="px-3 py-2.5">
                <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">{e.category}</span>
              </td>
              <td className="px-3 py-2.5 text-right text-sm font-medium">
                <span className={isIncome ? "text-green-800" : ""}>{fmt(e.value)}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <button
                  onClick={() => onToggle(e.id)}
                  className={`w-6 h-6 rounded-md inline-flex items-center justify-center border cursor-pointer transition-colors ${
                    e.paid
                      ? "bg-green-100 border-green-300 text-green-700"
                      : !isIncome && isCurrentMonth && e.dueDay && Number(e.dueDay) < today
                        ? "bg-red-100 border-red-300 text-red-600"
                        : "bg-red-50 border-red-200 text-red-300 hover:border-red-400"
                  }`}
                >
                  <IconCheck size={12} style={{ opacity: e.paid ? 1 : 0 }} />
                </button>
              </td>
              <td className="px-2 py-2.5 text-right">
                <div className="flex items-center gap-1 justify-end">
                  <button
                    onClick={() => onEdit(e)}
                    title="Edit"
                    className="p-2 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 border border-neutral-200 bg-transparent cursor-pointer"
                  >
                    <IconPencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(e.id)}
                    title="Delete"
                    className="p-2 rounded text-neutral-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 border border-neutral-200 bg-transparent cursor-pointer"
                  >
                    <IconX size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
