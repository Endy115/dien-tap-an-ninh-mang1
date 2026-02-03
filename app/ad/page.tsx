export default function Page() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <div className="text-xs font-semibold tracking-[0.2em] text-slate-700">Tổng quan</div>
        <h1 className="mt-1 text-2xl font-bold text-slate-900 title-scan">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-slate-700">
          Quản lí kịch bản, duyệt config người chơi gửi, quản trị tài khoản và theo dõi hoạt động.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-700">Kịch bản</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">12</div>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-700">Config chờ duyệt</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">5</div>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
          <div className="text-xs font-semibold text-slate-700">Tài khoản</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">48</div>
        </div>
      </div>
    </div>
  );
}

