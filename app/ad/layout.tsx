import type { ReactNode } from "react";
import AdminTopbar from "./ui/AdminTopbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <AdminTopbar />
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
            <div className="text-xs font-semibold tracking-[0.2em] text-slate-700">QUẢN TRỊ</div>
            <nav className="mt-3 grid gap-2 text-sm font-medium text-slate-800">
              <a className="rounded-xl px-3 py-2 ring-1 ring-transparent hover:bg-slate-50 hover:ring-slate-200" href="/ad">
                Tổng quan
              </a>
              <a className="rounded-xl px-3 py-2 ring-1 ring-transparent hover:bg-slate-50 hover:ring-slate-200" href="/ad/kich-ban">
                Kịch bản
              </a>
              <a className="rounded-xl px-3 py-2 ring-1 ring-transparent hover:bg-slate-50 hover:ring-slate-200" href="/ad/tai-khoan">
                Tài khoản người chơi
              </a>
            </nav>
          </aside>

          {/* Content */}
          <main className="min-h-[70vh]">{children}</main>
        </div>
      </div>
    </div>
  );
}
