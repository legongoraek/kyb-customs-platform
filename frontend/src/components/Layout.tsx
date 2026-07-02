import { Link, NavLink, Outlet } from "react-router-dom";
import { ShieldCheck, FilePlus2 } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900 text-white">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-sm font-black uppercase tracking-wide text-slate-900">
                KYB Customs
              </p>
              <p className="hidden text-xs text-slate-500 sm:block">
                Risk scoring para comercio exterior
              </p>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              Dashboard
            </NavLink>

            <NavLink
              to="/sat/imports"
              className={({ isActive }) =>
                `rounded-xl px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              SAT
            </NavLink>

            <NavLink
              to="/cases/new"
              className={({ isActive }) =>
                `inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`
              }
            >
              <FilePlus2 size={18} />
              <span className="hidden sm:inline">Nuevo expediente</span>
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}