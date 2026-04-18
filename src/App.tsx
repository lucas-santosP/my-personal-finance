import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext";
import { AuthPage } from "./components/AuthPage";
import { Sidebar } from "./components/Sidebar";
import { DashboardPage } from "./components/DashboardPage";
import { MonthPage } from "./components/MonthPage";
import { loadAllMonths, saveMonth, replaceAllMonths } from "./utils/storage";
import { monthKey, emptyMonth } from "./utils/finance";
import type { MonthsMap, View } from "./types";

export default function App() {
  const { user, loading: authLoading } = useAuth();
  const [months, setMonths] = useState<MonthsMap>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [view, setView] = useState<View>({ page: "dashboard" });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!user) {
      setMonths({});
      return;
    }
    setDataLoading(true);
    loadAllMonths(user.uid)
      .then(setMonths)
      .finally(() => setDataLoading(false));
  }, [user]);

  const handleAddMonth = (year: number, month: number) => {
    if (!user) return;
    const key = monthKey(year, month);
    if (months[key]) return;
    const data = emptyMonth();
    setMonths((prev) => ({ ...prev, [key]: data }));
    saveMonth(user.uid, key, data);
  };

  const handleReplaceAll = async (data: MonthsMap) => {
    if (!user) return;
    await replaceAllMonths(user.uid, data);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin" />
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return (
    <div className="flex h-screen overflow-hidden font-sans bg-neutral-100">
      {/* Mobile backdrop */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={() => setSidebarOpen(false)} />}

      <Sidebar
        months={months}
        setMonths={setMonths}
        view={view}
        setView={setView}
        viewYear={viewYear}
        setViewYear={setViewYear}
        onAddMonth={handleAddMonth}
        onReplaceAll={handleReplaceAll}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main
        className="flex-1 min-w-0 overflow-hidden flex flex-col"
      >
        {dataLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-5 h-5 rounded-full border-2 border-neutral-300 border-t-neutral-700 animate-spin" />
          </div>
        ) : (
          <>
            {view.page === "dashboard" && <DashboardPage months={months} setView={setView} viewYear={viewYear} onOpenSidebar={() => setSidebarOpen(true)} />}
            {view.page === "month" && view.year !== undefined && view.month !== undefined && (
              <MonthPage
                key={`${view.year}-${view.month}`}
                uid={user.uid}
                year={view.year}
                month={view.month}
                months={months}
                setMonths={setMonths}
                setView={setView}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
