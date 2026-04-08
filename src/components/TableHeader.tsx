import { IconPlus } from "@tabler/icons-react";
import { fmt } from "../utils/finance";
import type { Entry, Section } from "../types";

interface Props {
  section: Section;
  entries: Entry[];
  onAdd: () => void;
}

export function TableHeader({ section, entries, onAdd }: Props) {
  const isIncome = section === "income";
  const total = entries.reduce((s, e) => s + Number(e.value || 0), 0);
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200 flex-shrink-0">
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${isIncome ? "bg-green-100 text-green-800" : "bg-red-100 text-red-700"}`}
        >
          {isIncome ? "income" : "expenses"}
        </span>
        <span className="text-xs text-neutral-400">{entries.length} entries</span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium ${isIncome ? "text-green-800" : "text-neutral-800"}`}>
          {isIncome ? "+ " : "− "}
          {fmt(total)}
        </span>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-800 border border-neutral-200 rounded-lg px-4 py-2 hover:bg-neutral-50 transition-colors bg-transparent cursor-pointer"
        >
          <IconPlus size={13} />
          Add
        </button>
      </div>
    </div>
  );
}
