import { cookies } from "next/headers";
import LobbyHub from "./ui/LobbyHub";
import NotificationBell from "./ui/NotificationBell";
import UserMenu from "./ui/UserMenu";

export default async function Page() {
  const ck = await cookies();
  const role = ck.get("mmhcs_role")?.value ?? "user";
  const user = ck.get("mmhcs_user")?.value ?? "unknown";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f7_55%,_#e2e8f0)] p-4 text-slate-900 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(56,189,248,0.12),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_10%,_rgba(16,185,129,0.12),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-30 [background-image:linear-gradient(120deg,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:28px_28px]" />

      <div className="relative mx-auto w-full max-w-5xl space-y-5">
        <div className="flex items-center justify-between">
          <form action="/api/dang-xuat" method="post" className="inline-flex">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              Đăng xuất
            </button>
          </form>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <UserMenu user={user} />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/90 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-black/5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
            <div className="p-5">
              <div className="text-xs uppercase tracking-[0.35em] text-slate-500">MMHCS - Control Hub</div>
              <h1 className="mt-2 text-2xl font-semibold text-slate-900 title-scan">
                Chọn phòng để bắt đầu
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                Đăng nhập: <b className="text-slate-900">{user}</b> - Vai trò:{" "}
                <b className="text-slate-900">{role === "admin" ? "Admin" : "Người chơi"}</b>
              </p>
            </div>
            <div className="relative hidden min-h-[160px] overflow-hidden md:block">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,_#0ea5e9,_#22c55e)]" />
              <div className="absolute inset-0 opacity-70 [background-image:radial-gradient(rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="absolute -left-10 top-6 h-28 w-28 rounded-full border-2 border-white/60 opacity-70" />
              <div className="absolute left-20 top-10 h-16 w-16 rotate-12 rounded-2xl border border-white/60 bg-white/10" />
              <div className="absolute right-8 top-6 flex h-24 w-24 items-center justify-center rounded-2xl border border-white/70 bg-white/15">
                <svg viewBox="0 0 24 24" className="h-12 w-12 text-white">
                  <path
                    d="M12 3a9 9 0 1 0 9 9M12 3c2.5 2.2 4 5.5 4 9s-1.5 6.8-4 9M12 3c-2.5 2.2-4 5.5-4 9s1.5 6.8 4 9M3 12h18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="absolute bottom-4 left-6 rounded-full border border-white/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/90">
                Secure Ops
              </div>
              <div className="absolute bottom-4 right-6 rounded-full bg-white/15 px-3 py-1 text-[10px] font-semibold text-white">
                Real-time Lab
              </div>
            </div>
          </div>
        </div>

        <LobbyHub user={user} />
      </div>
    </main>
  );
}
