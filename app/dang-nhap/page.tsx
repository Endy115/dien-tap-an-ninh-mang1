"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const sp = useSearchParams();

  const err = sp.get("err");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  const goiY = useMemo(() => {
    return [
      { t: "Admin demo", v: "admin / admin123" },
      { t: "User demo", v: "user / user123" },
    ];
  }, []);

  const playType = () => {
    if (typeof window === "undefined") return;
    const ctx = audioCtx ?? new AudioContext();
    if (!audioCtx) setAudioCtx(ctx);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = "sine";
    osc.frequency.setValueAtTime(520, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.05, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
  };

  async function dangNhap() {
    setMsg("");
    setLoading(true);
    try {
      const res = await fetch("/api/dang-nhap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data?.message ?? "Đăng nhập thất bại.");
        return;
      }

      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-sky-200 via-sky-100 to-white grid place-items-center p-4">
      <div className="pointer-events-none absolute -top-10 left-10 h-28 w-56 rounded-full bg-white/70 blur-[2px]" />
      <div className="pointer-events-none absolute top-16 right-16 h-32 w-64 rounded-full bg-white/60 blur-[2px]" />
      <div className="pointer-events-none absolute bottom-10 left-24 h-24 w-52 rounded-full bg-white/60 blur-[2px]" />

      <div className="w-full max-w-sm rounded-3xl border border-sky-100 bg-white/85 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.16)] backdrop-blur">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-700 ring-1 ring-sky-200">
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="12" cy="8" r="3" />
            <path d="M5 20c1.6-3.4 11.4-3.4 14 0" strokeLinecap="round" />
          </svg>
        </div>

        <div className="mt-4 text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-slate-500">User Login</div>
          <h1 className="mt-2 text-xl font-semibold text-slate-900 title-scan">Đăng nhập</h1>
        </div>

        {err === "forbidden" ? (
          <div className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
            Bạn không có quyền truy cập khu vực Admin.
          </div>
        ) : null}

        <div className="mt-5 grid gap-3">
          <div>
            <input
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-300"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                playType();
              }}
              placeholder="Username"
            />
          </div>
          <div>
            <input
              className="h-11 w-full rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-sky-300"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                playType();
              }}
              placeholder="Password"
              type="password"
            />
          </div>

          {msg ? (
            <div className="rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800 ring-1 ring-amber-200">
              {msg}
            </div>
          ) : null}

          <button
            onClick={dangNhap}
            disabled={loading}
            className="h-11 rounded-full bg-sky-700 px-4 text-sm font-semibold text-white shadow-sm hover:bg-sky-600 disabled:opacity-70"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
          <Link
            href="/dang-ky"
            className="inline-flex h-11 items-center justify-center rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Đăng ký
          </Link>

          <div className="rounded-2xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200">
            <div className="text-xs font-semibold text-slate-700">Tài khoản demo</div>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-xs text-slate-700">
              {goiY.map((x) => (
                <li key={x.t}>
                  <b className="text-slate-900">{x.t}:</b> {x.v}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}

