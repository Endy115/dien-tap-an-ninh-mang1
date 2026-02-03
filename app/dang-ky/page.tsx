"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000/api";

export default function Page() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canSubmit =
    username.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword &&
    !loading;

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
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.detail || "Đăng ký thất bại.");
      }
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
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu"
                type="password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
              />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Nhập lại mật khẩu"
                type="password"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-cyan-400"
              />
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
