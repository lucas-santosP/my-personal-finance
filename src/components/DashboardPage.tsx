import { useMemo } from "react";
import { IconMenu2 } from "@tabler/icons-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MONTHS } from "../constants";
import { calcMonth, fmt, getMonthsForYear, monthKey } from "../utils/finance";
import type { MonthsMap, View } from "../types";

interface TipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}

function Tip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-neutral-200 rounded-md px-3 py-2 text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {fmt(p.value)}
        </p>
      ))}
    </div>
  );
}

interface Props {
  months: MonthsMap;
  setView: (v: View) => void;
  viewYear: number;
  onOpenSidebar: () => void;
}

export function DashboardPage({ months, setView, viewYear, onOpenSidebar }: Props) {
  const currentYear = viewYear;
  const monthsInYear = getMonthsForYear(months, currentYear);

  const chartData = MONTHS.map((name, i) => {
    const key = monthKey(currentYear, i + 1);
    const d = months[key];
    if (!d) return { name: name.slice(0, 3), income: undefined, expenses: undefined };
    const { totalIncome, totalExpenses } = calcMonth(d);
    return { name: name.slice(0, 3), income: totalIncome, expenses: totalExpenses };
  });

  const chartValues = chartData.flatMap((d) => [d.income, d.expenses].filter((v): v is number => v !== undefined));
  const chartMin = Math.max(0, Math.floor((Math.min(...chartValues) * 0.9) / 1000) * 1000);
  const chartMax = Math.ceil((Math.max(...chartValues) * 1.05) / 1000) * 1000;

  const yearStats = useMemo(() => {
    let income = 0,
      expenses = 0;
    monthsInYear.forEach((m) => {
      const c = calcMonth(months[monthKey(currentYear, m)]);
      income += c.totalIncome;
      expenses += c.totalExpenses;
    });
    return { income, expenses, balance: income - expenses, months: monthsInYear.length };
  }, [months, currentYear, monthsInYear]);

  const catTotals: Record<string, number> = {};
  monthsInYear.forEach((m) => {
    months[monthKey(currentYear, m)].expenses.forEach((e) => {
      catTotals[e.category] = (catTotals[e.category] || 0) + Number(e.value || 0);
    });
  });
  const catList = Object.entries(catTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);
  const maxCat = catList[0]?.[1] || 1;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 flex-shrink-0 px-4 md:px-6 py-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="md:hidden p-1.5 -ml-1 rounded-md text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 border-none bg-transparent cursor-pointer"
          >
            <IconMenu2 size={20} />
          </button>
          <div>
            <h1 className="text-xl font-medium">Dashboard</h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {currentYear} overview · {yearStats.months} months tracked
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-5 flex flex-col gap-4">
        {monthsInYear.length === 0 ? (
          <div className="bg-white rounded-md border border-neutral-200 p-12 text-center text-neutral-500 text-sm">
            No data yet. Add a month from the sidebar to get started.
          </div>
        ) : (
          <>
            {/* Stats — 2 cols on mobile, 4 on md+ */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total income", value: fmt(yearStats.income), cls: "text-green-800" },
                { label: "Total expenses", value: fmt(yearStats.expenses), cls: "text-red-700" },
                {
                  label: "Net balance",
                  value: fmt(yearStats.balance),
                  cls: yearStats.balance >= 0 ? "text-green-800" : "text-red-700",
                },
                { label: "Months tracked", value: yearStats.months, cls: "text-neutral-800" },
              ].map((s, i) => (
                <div key={i} className="bg-white rounded-md border border-neutral-200 px-4 py-3.5">
                  <p className="text-xs text-neutral-500 mb-1.5">{s.label}</p>
                  <p className={`text-lg font-medium ${s.cls}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Chart */}
            {monthsInYear.length > 0 && (
              <div className="bg-white rounded-md border border-neutral-200 px-5 pt-4 pb-3">
                <p className="text-xs font-medium text-neutral-500 mb-3">Monthly income vs expenses — {currentYear}</p>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0ee" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#aaa" }} axisLine={false} tickLine={false} />
                    <YAxis
                      tick={{ fontSize: 11, fill: "#aaa" }}
                      axisLine={false}
                      tickLine={false}
                      tickCount={4}
                      domain={[chartMin, chartMax]}
                      tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
                    />
                    <Tooltip content={<Tip />} />
                    <Line type="monotone" dataKey="income" stroke="#97C459" strokeWidth={2} dot={{ r: 3 }} name="Income" />
                    <Line type="monotone" dataKey="expenses" stroke="#F09595" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Bottom panels — 1 col on mobile, 2 on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-md border border-neutral-200 px-5 pt-4 pb-4">
                <p className="text-xs font-medium text-neutral-500 mb-3">Expenses by category — {currentYear}</p>
                {catList.length === 0 ? (
                  <p className="text-sm text-neutral-500">No expense data yet.</p>
                ) : (
                  catList.map(([cat, val]) => (
                    <div key={cat} className="flex items-center gap-2.5 py-1.5">
                      <span className="w-20 text-xs text-neutral-500 truncate">{cat}</span>
                      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#F09595]" style={{ width: `${(val / maxCat) * 100}%` }} />
                      </div>
                      <span className="w-16 text-right text-xs text-neutral-500">{fmt(val)}</span>
                    </div>
                  ))
                )}
              </div>
              <div className="bg-white rounded-md border border-neutral-200 px-5 pt-4 pb-2">
                <p className="text-xs font-medium text-neutral-500 mb-3">Monthly summary — {currentYear}</p>
                {monthsInYear.map((m) => {
                  const { balance, totalIncome, totalExpenses } = calcMonth(months[monthKey(currentYear, m)]);
                  return (
                    <button
                      key={m}
                      onClick={() => setView({ page: "month", year: currentYear, month: m })}
                      className="flex items-center justify-between w-full py-2 border-b border-neutral-100 last:border-0 hover:bg-neutral-50 rounded px-1 -mx-1 transition-colors bg-transparent border-none cursor-pointer"
                    >
                      <span className="text-sm text-neutral-700">{MONTHS[m - 1]}</span>
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline text-xs text-neutral-500">{fmt(totalIncome)} in</span>
                        <span className="hidden sm:inline text-xs text-neutral-500">{fmt(totalExpenses)} out</span>
                        <span className={`text-xs font-medium w-16 text-right ${balance >= 0 ? "text-green-800" : "text-red-700"}`}>
                          {balance >= 0 ? "+" : ""}
                          {fmt(balance)}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
