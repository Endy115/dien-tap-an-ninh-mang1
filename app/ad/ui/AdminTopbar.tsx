export default function AdminTopbar() {
  return (
    <header className="border-b border-slate-300 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="text-sm font-semibold text-slate-900">Admin</div>
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <a href="/ad" className="rounded-lg px-2 py-1 hover:bg-slate-50">
            Tổng quan
          </a>
          <a href="/ad/kich-ban" className="rounded-lg px-2 py-1 hover:bg-slate-50">
            Kịch bản
          </a>
        </nav>
      </div>
    </header>
  );
}
