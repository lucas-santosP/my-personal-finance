import type { MonthData } from "../types";

export const fmt = (n?: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n ?? 0);

export const mkId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

export const monthKey = (y: number, m: number) => `${y}-${String(m).padStart(2, "0")}`;

export const emptyMonth = (): MonthData => ({ income: [], expenses: [] });

export function calcMonth(d: MonthData) {
  const totalIncome = d.income.reduce((s, e) => s + Number(e.value || 0), 0);
  const totalExpenses = d.expenses.reduce((s, e) => s + Number(e.value || 0), 0);
  const balance = totalIncome - totalExpenses;
  const unpaid = d.expenses.filter((e) => !e.paid).reduce((s, e) => s + Number(e.value || 0), 0);
  const unreceived = d.income.filter((e) => !e.paid).reduce((s, e) => s + Number(e.value || 0), 0);
  const pct = totalIncome > 0 ? Math.round((totalExpenses / totalIncome) * 100) : 0;
  return { totalIncome, totalExpenses, balance, unpaid, unreceived, pct };
}

export function getYears(months: Record<string, MonthData>): number[] {
  const s = new Set(Object.keys(months).map((k) => Number(k.split("-")[0])));
  return Array.from(s).sort((a, b) => b - a);
}

export function getMonthsForYear(months: Record<string, MonthData>, year: number): number[] {
  return Object.keys(months)
    .filter((k) => k.startsWith(`${year}-`))
    .map((k) => Number(k.split("-")[1]))
    .sort((a, b) => a - b);
}
