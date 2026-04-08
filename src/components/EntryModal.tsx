import { useState, useEffect } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { INCOME_CATS, EXPENSE_CATS } from "../constants";
import { DayPickerInput } from "./DayPickerInput";
import type { Entry, Section } from "../types";

interface FormState {
  description: string;
  note: string;
  kind: "PF" | "PJ";
  category: string;
  dueDay: string;
  value: string;
  paid: boolean;
}

const emptyForm = (section: Section): FormState => ({
  description: "",
  note: "",
  kind: "PF",
  category: section === "income" ? "Salary" : "Housing",
  dueDay: "",
  value: "",
  paid: false,
});

interface Props {
  section: Section;
  entry: Entry | null;
  onSave: (entry: Omit<Entry, "id"> & { id?: string }) => void;
  onClose: () => void;
  year: number;
  month: number;
}

export function EntryModal({ section, entry, onSave, onClose, year, month }: Props) {
  const [form, setForm] = useState<FormState>(
    entry
      ? { ...entry, value: String(entry.value), dueDay: entry.dueDay ?? "" }
      : emptyForm(section),
  );
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setForm((f) => ({ ...f, [k]: v }));
  const cats = section === "income" ? INCOME_CATS : EXPENSE_CATS;
  const isEdit = !!entry;
  const selectedDay = form.dueDay ? Number(form.dueDay) : null;

  const validate = () => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.description.trim()) e.description = "Description is required.";
    if (!form.value || isNaN(Number(form.value)) || Number(form.value) <= 0)
      e.value = "Enter a valid amount greater than 0.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave({ ...form, value: Number(form.value), id: entry?.id });
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Enter" && !e.shiftKey) handleSave();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, errors]);

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-end md:items-center justify-center z-50 md:p-5"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-t-2xl md:rounded-md border border-neutral-200 w-full md:max-w-md flex flex-col"
        style={{ maxHeight: "92dvh", overflowY: "auto" }}
      >
        {/* Drag handle (mobile only) */}
        <div className="md:hidden flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-8 h-1 rounded-full bg-neutral-300" />
        </div>

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-200 flex-shrink-0">
          <p className="text-sm font-medium">
            {isEdit ? "Edit" : "Add"} {section === "income" ? "income" : "expense"}
          </p>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 p-1 bg-transparent border-none cursor-pointer"
          >
            <IconX size={16} />
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3.5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Description
            </label>
            <input
              value={form.description}
              onChange={(e) => {
                set("description", e.target.value);
                if (errors.description) setErrors((p) => ({ ...p, description: undefined }));
              }}
              placeholder="e.g. Salary, Rent, Netflix…"
              className={`w-full px-3 py-2 rounded-md border text-sm outline-none ${errors.description ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"}`}
            />
            {errors.description && (
              <span className="text-xs text-red-600">{errors.description}</span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Value
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.value}
                onChange={(e) => {
                  set("value", e.target.value);
                  if (errors.value) setErrors((p) => ({ ...p, value: undefined }));
                }}
                placeholder="0.00"
                className={`w-full px-3 py-2 rounded-md border text-sm outline-none ${errors.value ? "border-red-300 bg-red-50" : "border-neutral-200 bg-white"}`}
              />
              {errors.value && <span className="text-xs text-red-600">{errors.value}</span>}
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                {section === "income" ? "Received day" : "Due day"}
              </label>
              <div className="flex gap-1.5">
                <DayPickerInput
                  year={year}
                  month={month}
                  value={selectedDay}
                  onChange={(d) => set("dueDay", d ? String(d) : "")}
                  className="flex-1 min-w-0 px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm outline-none cursor-pointer"
                />
                {form.dueDay && (
                  <button
                    onClick={() => set("dueDay", "")}
                    className="px-2.5 py-2 rounded-md border border-neutral-200 text-neutral-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 bg-transparent cursor-pointer transition-colors"
                  >
                    <IconX size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Category
              </label>
              <select
                value={form.category}
                onChange={(e) => set("category", e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm outline-none"
              >
                {cats.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
                Type
              </label>
              <div className="flex gap-2 pt-1">
                {(["PF", "PJ"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => set("kind", t)}
                    className={`flex-1 py-2 rounded-md text-xs border cursor-pointer transition-colors ${
                      form.kind === t
                        ? t === "PF"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-green-50 text-green-800 border-green-200"
                        : "bg-white text-neutral-500 border-neutral-200 hover:bg-neutral-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Note <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              placeholder="Any extra detail…"
              className="w-full px-3 py-2 rounded-md border border-neutral-200 bg-white text-sm outline-none"
            />
          </div>

          <div
            className="flex items-center gap-2.5 cursor-pointer select-none"
            onClick={() => set("paid", !form.paid)}
          >
            <div
              className={`w-6 h-6 rounded-md inline-flex items-center justify-center border transition-colors ${
                form.paid
                  ? "bg-green-100 border-green-300 text-green-700"
                  : "bg-red-50 border-red-200 text-red-300"
              }`}
            >
              <IconCheck size={12} style={{ opacity: form.paid ? 1 : 0 }} />
            </div>
            <span className="text-sm text-neutral-600">
              Mark as {section === "income" ? "received" : "paid"}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-1 pb-safe">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border border-neutral-200 text-sm text-neutral-600 hover:bg-neutral-50 bg-transparent cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md bg-neutral-900 text-white text-sm hover:bg-neutral-700 border-none cursor-pointer"
            >
              {isEdit ? "Save changes" : "Add"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
