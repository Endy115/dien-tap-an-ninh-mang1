// app/admin/ket-qua/page.tsx
import Link from "next/link";

type NguoiChoi = {
  id: string;
  ten: string;
  diem: number;
  vaiTro: string;
  danhGia: string;
  ghiChu: string[];
};

const duLieuDemo: NguoiChoi[] = [
  {
    id: "a",
    ten: "Khánh An",
    diem: 88,
    vaiTro: "Trưởng phòng Kế toán",
    danhGia: "Expert",
    ghiChu: ["Xử lý email giả mạo nhanh", "Báo cáo đúng quy trình"],
  },
  {
    id: "b",
    ten: "Minh Triết",
    diem: 78,
    vaiTro: "Tuyến hỗ trợ",
    danhGia: "Professional",
    ghiChu: ["Điều phối tốt", "Chậm ở bước khóa tài khoản"],
  },
  {
    id: "c",
    ten: "Hà My",
    diem: 64,
    vaiTro: "Bên thứ ba",
    danhGia: "Professional",
    ghiChu: ["Phân tích IOC ổn", "Thiếu log VPN"],
  },
  {
    id: "d",
    ten: "Đức Huy",
    diem: 52,
    vaiTro: "Đối thủ",
    danhGia: "Experienced",
    ghiChu: ["Khoanh vùng chưa triệt để", "Bị chậm 1 bước containment"],
  },
  {
    id: "e",
    ten: "Thanh Tùng",
    diem: 71,
    vaiTro: "Threat Hunter",
    danhGia: "Professional",
    ghiChu: ["Săn IOC tốt", "Thiếu bằng chứng timeline"],
  },
];

const thongTinKichBan = {
  ten: "Email giả mạo dẫn đến xâm nhập mạng nội bộ",
  phong: "Phòng diễn tập #1",
  mucTieu: "Phản ứng sự cố + khoanh vùng",
};

function tinhTongDiem(ds: NguoiChoi[]) {
  let tong = 0;
  for (const p of ds) tong += p.diem;
  return tong;
}

export default function Page() {
  const xepHang = [...duLieuDemo].sort((x, y) => y.diem - x.diem);

  const tongDiem = tinhTongDiem(xepHang);
  const diemToiDa = xepHang.length * 100;
  const soExpert = xepHang.filter((p) => p.diem >= 80).length;
  const trangThaiDat = soExpert >= 3 && tongDiem >= diemToiDa * 0.65;

  const hangDanhGia = (diem: number) => {
    if (diem >= 80) return "Expert";
    if (diem >= 60) return "Professional";
    return "Experienced";
  };

  const saoDanhGia = (diem: number) => {
    if (diem >= 80) return 4;
    if (diem >= 60) return 3;
    if (diem >= 50) return 2;
    return 1;
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f7_55%,_#e2e8f0)] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.12),_transparent_60%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(244,114,182,0.10),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,_rgba(255,255,255,0.9),_rgba(248,250,252,0.7))]" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6">
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-slate-500">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            >
              {"<-"}
            </Link>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-300 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.12)] sm:p-6">
          <div className="rounded-xl border border-rose-300 bg-[linear-gradient(90deg,_rgba(255,240,240,0.95),_rgba(255,255,255,0.98))] px-6 py-6 text-center shadow-sm">
            <p className="font-['Orbitron'] text-xs uppercase tracking-[0.4em] text-rose-500">
              {trangThaiDat ? "Mission Success" : "Mission Fail"}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-rose-700 sm:text-4xl title-scan">
              Kết quả kịch bản
            </h1>
            <p className="mt-2 text-sm text-rose-600/80">
              {thongTinKichBan.ten} - {thongTinKichBan.phong}
            </p>
            <div className="mt-4 text-lg text-slate-700">
              Combined Score:{" "}
              <span className="text-2xl font-semibold text-rose-600">
                {tongDiem} / {diemToiDa}
              </span>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_360px]">
            <section className="space-y-3">
              {xepHang.map((p, idx) => {
                const hang = hangDanhGia(p.diem);
                const sao = saoDanhGia(p.diem);
                const phanTram = Math.min(100, Math.round((p.diem / 100) * 100));
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-slate-300 bg-white p-4 shadow-[0_6px_16px_rgba(15,23,42,0.12)] transition-transform duration-200 hover:scale-[1.03]"
                  >
                    <div className="flex items-center gap-4">
                      <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-rose-400 text-lg font-semibold text-white shadow-sm">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-semibold text-slate-900">{p.ten}</div>
                            <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{p.vaiTro}</div>
                          </div>
                          <div className="text-lg font-semibold text-amber-600">{p.diem} / 100</div>
                        </div>

                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 ring-1 ring-slate-300/60">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                            style={{ width: `${phanTram}%` }}
                          />
                        </div>

                        <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < sao ? "text-amber-500" : "text-slate-300"}>
                                ★
                              </span>
                            ))}
                            <span className="ml-2 uppercase tracking-[0.2em] text-slate-500">{hang}</span>
                          </div>
                          <div className="text-rose-500">+{idx + 1}</div>
                        </div>
                        <div className="mt-3 rounded-lg border border-slate-300 bg-slate-50 p-2 text-xs text-slate-600 transition-transform duration-200 hover:scale-[1.03]">
                          <div className="uppercase tracking-[0.2em] text-slate-500">Ghi chú</div>
                          <ul className="mt-1 list-disc space-y-1 pl-4">
                            {p.ghiChu.map((g, i) => (
                              <li key={i}>{g}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </section>

            <section className="rounded-xl border border-slate-300 bg-white p-5 shadow-[0_8px_20px_rgba(15,23,42,0.12)]">
              <div className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-3 text-rose-700 shadow-sm">
                <div className="text-sm font-semibold uppercase tracking-[0.2em]">
                  {trangThaiDat ? "Mission Success" : "Mission Fail"}
                </div>
                <p className="mt-2 text-xs text-rose-600/80">
                  {trangThaiDat
                    ? "Kịch bản đạt yêu cầu tối thiểu."
                    : "Kịch bản chưa đạt, cần cải thiện phản ứng."}
                </p>
              </div>

              <div className="mt-4 space-y-3 text-sm text-slate-600">
                <p className="text-slate-500">
                  Kết quả: {soExpert} / {xepHang.length} đạt Expert, tổng điểm{" "}
                  {Math.round((tongDiem / diemToiDa) * 100)}%.
                </p>
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <Link
                  href="/admin"
                  className="inline-flex h-10 w-32 items-center justify-center rounded-md border border-rose-200 bg-gradient-to-r from-amber-400 to-rose-400 text-sm font-semibold text-white hover:from-amber-500 hover:to-rose-500"
                >
                  Làm lại
                </Link>
                <Link
                  href="/"
                  className="inline-flex h-10 w-24 items-center justify-center rounded-md border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Thoát
                </Link>
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
