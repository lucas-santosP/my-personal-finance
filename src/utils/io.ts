import type { MonthsMap } from "../types";

export function exportJSON(months: MonthsMap) {
  const blob = new Blob([JSON.stringify(months, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `finances_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function importJSON(
  setMonths: (data: MonthsMap) => void,
  saveAll: (data: MonthsMap) => Promise<void>,
) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string) as MonthsMap;
        await saveAll(data);
        setMonths(data);
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
