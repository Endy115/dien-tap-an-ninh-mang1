import Link from "next/link";

const demo = [
  { id: "kb1", ten: "Kịch bản 1", moTa: "Incident Response cơ bản", mucDo: "Dễ" },
  { id: "kb2", ten: "Kịch bản 2", moTa: "Phishing + log triage", mucDo: "Vừa" },
];

export default function Page() {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-300 bg-white p-5 shadow-md">
        <div>
          <div className="text-xs font-semibold tracking-[0.2em] text-slate-700">Kịch bản</div>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 title-scan">Quản lí kịch bản</h1>
          <p className="mt-1 text-sm text-slate-700">Thêm/sửa/xóa kịch bản diễn tập.</p>
        </div>
        <Link
          href="/admin/kich-ban/them"
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
        >
          + Thêm kịch bản
        </Link>
      </div>

      <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-md">
        <div className="overflow-hidden rounded-xl border border-slate-300">
          <div className="grid grid-cols-[1.2fr_2fr_0.6fr_0.8fr] bg-slate-100 px-4 py-3 text-xs font-semibold text-slate-700">
            <div>Tên</div>
            <div>Mô tả</div>
            <div>Mức độ</div>
            <div>Hành động</div>
          </div>
          {demo.map((x) => (
            <div
              key={x.id}
              className="grid grid-cols-[1.2fr_2fr_0.6fr_0.8fr] border-t border-slate-200 px-4 py-3 text-sm"
            >
              <div className="font-semibold text-slate-900">{x.ten}</div>
              <div className="text-slate-700">{x.moTa}</div>
              <div className="text-slate-800">{x.mucDo}</div>
              <div className="flex gap-2">
                <button className="rounded-lg bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-800 hover:bg-slate-300">
                  Sửa
                </button>
                <button className="rounded-lg bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-200">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

