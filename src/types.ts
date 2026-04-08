export interface Entry {
  id: string;
  description: string;
  note: string;
  kind: "PF" | "PJ";
  category: string;
  dueDay: string;
  value: number;
  paid: boolean;
}

export interface MonthData {
  income: Entry[];
  expenses: Entry[];
}

export type MonthsMap = Record<string, MonthData>;

export type Section = "income" | "expenses";

export interface View {
  page: "dashboard" | "month";
  year?: number;
  month?: number;
}
