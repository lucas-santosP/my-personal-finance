import { useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { MonthPage } from "./components/MonthPage";
import { loadData, saveData } from "./utils/storage";
import { monthKey, emptyMonth } from "./utils/finance";
import type { MonthsMap, View } from "./types";

export default function App() {
  const [months, setMonths] = useState<MonthsMap>(() => loadData());
  const [view, setView] = useState<View>({ page: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleAddMonth = (year: number, month: number) => {
    setMonths((prev) => {
      const key = monthKey(year, month);
      if (prev[key]) return prev;
      const next = { ...prev, [key]: emptyMonth() };
      saveData(next);
      return next;
    });
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        fontFamily: "system-ui,-apple-system,sans-serif",
      }}
      className="bg-neutral-100"
    >
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        months={months}
        setMonths={(data) => setMonths(data)}
        view={view}
        setView={setView}
        onAddMonth={handleAddMonth}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        style={{
          flex: 1,
          minWidth: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {view.page === "dashboard" && (
          <DashboardPage
            months={months}
            setView={setView}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
        {view.page === "month" && view.year !== undefined && view.month !== undefined && (
          <MonthPage
            key={`${view.year}-${view.month}`}
            year={view.year}
            month={view.month}
            months={months}
            setMonths={setMonths}
            setView={setView}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}
      </main>
    </div>
  );
}
