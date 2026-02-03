"use client";

import { useEffect, useRef, useState } from "react";

type ThongBao = {
  id: string;
  type: "invite" | "system";
  title: string;
  body: string;
  time: string;
  read?: boolean;
  roomId?: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<ThongBao[]>([]);
  const [loading, setLoading] = useState(false);
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

  useEffect(() => {
    let live = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/thong-bao");
        const data = await res.json();
        if (live && res.ok && Array.isArray(data?.items)) {
          setItems(data.items as ThongBao[]);
        }
      } finally {
        if (live) setLoading(false);
      }
    };
    load();
    return () => {
      live = false;
    };
  }, []);

  const unread = items.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setItems((cur) => cur.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const removeItem = (id: string) => {
    setItems((cur) => cur.filter((n) => n.id !== id));
  };

  const acceptInvite = async (id: string) => {
    await fetch(`/api/thong-bao/${id}/accept`, { method: "POST" });
    markRead(id);
    setTimeout(() => removeItem(id), 400);
  };

  const declineInvite = async (id: string) => {
    await fetch(`/api/thong-bao/${id}/decline`, { method: "POST" });
    removeItem(id);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
        aria-label="Thông báo"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M15 17H9m6 0a3 3 0 0 1-6 0m9-2V10a6 6 0 1 0-12 0v5l-2 2h16l-2-2z" />
        </svg>
        {unread > 0 ? (
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500" />
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-xl border border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
          <div className="border-b border-slate-100 px-4 py-3">
            <div className="text-xs text-slate-500">Thông báo</div>
            <div className="text-sm font-semibold text-slate-900">
              {unread} thông báo mới
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {loading && items.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-500">Đang tải...</div>
            ) : null}
            {!loading && items.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-500">Không có thông báo.</div>
            ) : null}
            {items.map((n) => (
              <div
                key={n.id}
                className={`border-b border-slate-100 px-4 py-3 text-sm ${
                  n.read ? "bg-white" : "bg-sky-50/60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-slate-900">{n.title}</div>
                  <div className="text-xs text-slate-400">{n.time}</div>
                </div>
                <div className="mt-1 text-sm text-slate-600">{n.body}</div>
                {n.type === "invite" ? (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => acceptInvite(n.id)}
                      className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                    >
                      Chấp nhận
                    </button>
                    <button
                      type="button"
                      onClick={() => declineInvite(n.id)}
                      className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-200"
                    >
                      Từ chối
                    </button>
                  </div>
                ) : !n.read ? (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Mới
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <div className="px-4 py-2 text-right text-xs text-slate-500">
            Chỉ hiển thị dữ liệu demo
          </div>
        </div>
      ) : null}
    </div>
  );
}
