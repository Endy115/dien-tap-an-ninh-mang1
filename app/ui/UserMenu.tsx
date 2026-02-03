"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  user: string;
};

export default function UserMenu({ user }: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onClick = (evt: MouseEvent) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(evt.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-sky-100 text-xs font-bold text-sky-700">
          {user ? user.slice(0, 1).toUpperCase() : "U"}
        </span>
        <span className="hidden sm:inline">{user}</span>
        <span className="text-slate-400">▾</span>
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-xs text-slate-500">Tài khoản</div>
            <div className="text-sm font-semibold text-slate-900">{user}</div>
          </div>
          <div className="py-2">
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Hồ sơ
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Đổi mật khẩu
            </button>
            <button
              type="button"
              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
            >
              Lịch sử chơi
            </button>
          </div>
          <form action="/api/dang-xuat" method="post" className="border-t border-slate-100">
            <button
              type="submit"
              className="w-full px-4 py-2 text-left text-sm font-semibold text-rose-600 hover:bg-rose-50"
            >
              Đăng xuất
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
