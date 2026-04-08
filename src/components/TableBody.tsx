import { IconCheck, IconPencil, IconX } from "@tabler/icons-react";
import { fmt } from "../utils/finance";
import type { Entry, Section } from "../types";

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
  const rows = [...entries].sort((a, b) => (Number(a.dueDay) || 0) - (Number(b.dueDay) || 0));
  const total = entries.reduce((s, e) => s + Number(e.value || 0), 0);
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getFullYear() === year && new Date().getMonth() + 1 === month;

  if (rows.length === 0)
    return (
      <div className="py-10 text-center text-sm text-neutral-400">
        No {isIncome ? "income" : "expenses"} yet.
      </div>
    );

  return (
    <table className="w-full border-collapse" style={{ tableLayout: "fixed", minWidth: "520px" }}>
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
        <tr className="sticky top-0 bg-white z-10">
          {[
            "Description",
            "Type",
            isIncome ? "Date" : "Due",
            "Category",
            "Value",
            isIncome ? "Received" : "Paid",
            "",
          ].map((h, i) => (
            <th
              key={i}
              className={`px-3 py-2 font-normal border-b border-neutral-200 text-xs text-neutral-400 ${i >= 4 ? "text-right" : "text-left"}`}
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((e) => (
          <tr
            key={e.id}
            className="group hover:bg-neutral-50 transition-colors border-b border-neutral-100"
          >
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
            <td className="px-3 py-2.5 text-sm text-neutral-500">
              {e.dueDay ? `Day ${e.dueDay}` : "—"}
            </td>
            <td className="px-3 py-2.5">
              <span className="text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-500 border border-neutral-200">
                {e.category}
              </span>
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
      <tfoot>
        <tr className="bg-neutral-50 border-t border-neutral-200">
          <td colSpan={4} className="px-3 py-2 text-xs text-neutral-500 font-medium">
            Total {isIncome ? "income" : "expenses"}
          </td>
          <td colSpan={3} className="px-3 py-2 text-right text-sm font-medium">
            {fmt(total)}
          </td>
        </tr>
      </tfoot>
    </table>
  );
}
