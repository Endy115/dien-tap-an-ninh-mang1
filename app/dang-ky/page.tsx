"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const setCookie = (name: string, value: string, maxAgeDays = 7) => {
    if (typeof document === "undefined") return;
    const safe = encodeURIComponent(value);
    const maxAge = maxAgeDays * 24 * 60 * 60;
    document.cookie = `${name}=${safe}; path=/; Max-Age=${maxAge}; SameSite=Lax`;
  };

  const canSubmit = username.trim() && email.trim() && password.trim() && !loading;

  const onSubmit = async () => {
    if (!canSubmit) return;
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        let msg = "Đăng ký thất bại.";
        if (typeof data?.detail === "string") {
          msg = data.detail;
        } else if (Array.isArray(data?.detail)) {
          msg = data.detail.map((d: any) => d?.msg || d?.detail || JSON.stringify(d)).join(" | ");
        } else if (data?.detail) {
          msg = typeof data.detail === "object" ? JSON.stringify(data.detail) : String(data.detail);
        }
        throw new Error(msg);
      }
      if (data?.access_token) {
        localStorage.setItem("mmhcs_access_token", data.access_token);
        setCookie("mmhcs_session", data.access_token);
      }
      if (data?.refresh_token) {
        localStorage.setItem("mmhcs_refresh_token", data.refresh_token);
      }
      const safeUser = username.trim();
      localStorage.setItem("mmhcs_username", safeUser);
      setCookie("mmhcs_user", safeUser);
      const role = safeUser.toLowerCase() === "admin" ? "admin" : "user";
      setCookie("mmhcs_role", role);
      setSuccess("Đăng ký thành công. Đang chuyển về lobby...");
      setTimeout(() => router.push("/"), 800);
    } catch (err: any) {
      setError(err?.message ?? "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#eef2ff,_#e0f2fe_55%,_#e2e8f0)] p-4 sm:p-6">
      <div className="pointer-events-none absolute -top-20 left-10 h-56 w-56 rounded-full bg-cyan-200/40 blur-2xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-indigo-200/40 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(rgba(148,163,184,0.2)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
          <div className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-500 px-5 py-4 text-white">
            <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-white/20" />
            <div className="absolute -left-8 -bottom-10 h-28 w-28 rounded-full bg-white/15" />
            <div className="text-xs font-semibold tracking-[0.3em] text-white/80">ĐĂNG KÝ</div>
            <h1 className="mt-2 text-2xl font-semibold text-white title-scan">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-white/90">Bắt đầu phiên diễn tập với tài khoản mới.</p>
          </div>

          <div className="p-5">
            <div className="text-xs font-semibold tracking-[0.3em] text-slate-500">ĐĂNG KÝ</div>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900">Tạo tài khoản</h1>
            <p className="mt-1 text-sm text-slate-600">Nhập thông tin để đăng ký tài khoản mới.</p>

            {error ? (
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            ) : null}
            {success ? (
              <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
                {success}
              </div>
            ) : null}

            <div className="mt-4 space-y-3">
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-10 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path d="M3 3l18 18" strokeLinecap="round" />
                      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" strokeLinecap="round" strokeLinejoin="round" />
                      <path
                        d="M6.5 6.5C4 8.4 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.8 0 3.3-.4 4.6-1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M9 4.2A9.8 9.8 0 0 1 12 3.5c6 0 9.5 6.5 9.5 6.5a14 14 0 0 1-3.7 4.7"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <path
                        d="M2.5 12S6 5.5 12 5.5s9.5 6.5 9.5 6.5-3.5 6.5-9.5 6.5S2.5 12 2.5 12Z"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={onSubmit}
              className="mt-4 h-11 w-full rounded-xl bg-gradient-to-r from-sky-600 via-cyan-500 to-indigo-500 text-sm font-semibold text-white shadow-sm hover:from-sky-500 hover:via-cyan-400 hover:to-indigo-400 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500"
            >
              {loading ? "Đang đăng ký..." : "Đăng ký"}
            </button>

            <div className="mt-3 text-center text-xs text-slate-500">
              Đã có tài khoản?{" "}
              <Link href="/dang-nhap" className="font-semibold text-slate-800 hover:underline">
                Đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
