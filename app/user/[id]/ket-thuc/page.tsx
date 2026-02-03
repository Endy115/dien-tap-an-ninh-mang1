"use client";

import { use } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function keyKetQua(id: string) {
  return `mmhcs:phong:${id}:ket-qua`;
}

type KetQua = {
  phongId: string;
  diem: number;
  diemToiDa: number;
  pass: boolean;
  sai: string[];
  thoiGian: string;
};

type NguoiChoi = {
  id: string;
  ten: string;
  vaiTro?: string;
  diem?: number;
};

type NhanVat = {
  id: string;
  ten: string;
  vaiTro: string;
  moTa?: string;
};

type LeaderRow = {
  name: string;
  role?: string;
  score: number;
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: phongId } = use(params);
  const router = useRouter();
  const [kq, setKq] = useState<KetQua | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);

  const fallbackLeaderboard: LeaderRow[] = [
    { name: "USER 1", score: 120 },
    { name: "USER 2", score: 105 },
    { name: "USER 3", score: 180 },
    { name: "USER 4", score: 90 },
    { name: "USER 5", score: 100 },
  ];
  const totalPoints = leaderboard.reduce((sum, row) => sum + row.score, 0);
  const requiredPoints = (kq?.diemToiDa ?? 0) * (leaderboard.length || 1);
  const missingPoints = Math.max(0, requiredPoints - totalPoints);
  const statusLabel = kq?.pass ? "PASS" : "FAIL";

  useEffect(() => {
    const raw = localStorage.getItem(keyKetQua(phongId));
    if (raw) setKq(JSON.parse(raw));
  }, [phongId]);

  useEffect(() => {
    const playersKey = `mmhcs:phong:${phongId}:players`;
    const rawPlayers = localStorage.getItem(playersKey);
    const rawChars = localStorage.getItem("mmhcs:characters");

    let players: NguoiChoi[] = [];
    let chars: NhanVat[] = [];
    if (rawPlayers) {
      try {
        players = JSON.parse(rawPlayers) as NguoiChoi[];
      } catch {
        players = [];
      }
    }
    if (rawChars) {
      try {
        chars = JSON.parse(rawChars) as NhanVat[];
      } catch {
        chars = [];
      }
    }

    if (players.length === 0) {
      setLeaderboard(fallbackLeaderboard);
      return;
    }

    const next: LeaderRow[] = players.map((p, index) => ({
      name: p.ten,
      role: chars[index]?.vaiTro ?? p.vaiTro ?? "",
      score: p.diem ?? 0,
    }));

    setLeaderboard(next);
  }, [fallbackLeaderboard, phongId]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#e9eef5_45%,_#dfe7f3)] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,_rgba(56,189,248,0.18),_transparent_45%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,_rgba(251,191,36,0.18),_transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_85%,_rgba(244,63,94,0.14),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(120deg,rgba(15,23,42,0.06)_1px,transparent_1px),linear-gradient(0deg,rgba(15,23,42,0.04)_1px,transparent_1px)] [background-size:36px_36px]" />

      <div className="relative mx-auto w-full max-w-3xl text-center">
        <div className="text-xs text-slate-500">Phòng #{phongId}</div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-800 title-scan">
          Kết quả
        </h1>

        <div className="mt-5 rounded-2xl border-2 border-slate-400 bg-white px-5 py-4 text-lg text-slate-700 shadow-[0_18px_50px_rgba(15,23,42,0.22)] transition-transform duration-200 hover:scale-[1.01]">
          Your Points:{" "}
          <span className="text-2xl font-semibold text-slate-900">
            {kq ? kq.diem : 0}
          </span>
        </div>

        <div className="mt-6 rounded-2xl border-2 border-slate-400 bg-white text-left shadow-[0_20px_60px_rgba(15,23,42,0.22)]">
          <div className="border-b border-slate-200 px-5 py-4 text-base font-semibold text-slate-800">
            Leaderboard:
          </div>
          <div className="grid grid-cols-[1fr_140px] border-b border-slate-300 bg-slate-100 px-5 py-2 text-sm font-semibold text-slate-700">
            <div>User</div>
            <div className="text-right">Score</div>
          </div>
          <div>
            {leaderboard.map((row, idx) => (
              <div
                key={row.name}
                className={[
                  "grid grid-cols-[1fr_140px] px-5 py-3 text-sm text-slate-700 transition-transform duration-150 hover:scale-[1.01]",
                  idx === 0 ? "bg-sky-100" : "bg-white",
                  idx < leaderboard.length - 1 ? "border-b border-slate-200" : "",
                ].join(" ")}
              >
                <div>
                  <div className="font-semibold text-slate-800">{row.name}</div>
                  {row.role ? (
                    <div className="text-[11px] text-slate-500">{row.role}</div>
                  ) : null}
                </div>
                <div className="text-right">{row.score}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 px-5 py-4">
            <div className="text-base text-slate-700">
              Tổng điểm:{" "}
              <span className="text-lg font-semibold text-slate-900">
                {totalPoints}
              </span>{" "}
              /{" "}
              <span className="text-lg font-semibold text-slate-900">
                {requiredPoints}
              </span>
              {requiredPoints > 0 ? (
                <span className="ml-2 text-sm text-slate-500">
                  (Thiếu {missingPoints} điểm)
                </span>
              ) : null}
            </div>
            <div
              className={`rounded-md px-6 py-2 text-sm font-semibold text-white shadow-sm transition-transform duration-150 hover:scale-[1.03] ${
                kq?.pass
                  ? "bg-emerald-600 shadow-emerald-200"
                  : "bg-rose-600 shadow-rose-200"
              }`}
            >
              {statusLabel}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-300 px-5 py-4">
            <a
              href="/"
              className="inline-flex h-10 w-28 items-center justify-center rounded-md border-2 border-slate-400 bg-slate-100 text-sm font-semibold text-slate-700 shadow-sm transition-transform duration-150 hover:scale-[1.03] hover:bg-slate-200"
            >
              Thoát
            </a>
            <a
              href={`/user/${phongId}/choi`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-6 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(37,99,235,0.35)] transition-transform duration-150 hover:scale-[1.03] hover:bg-blue-700"
            >
              Xem Lại Lịch Sử Lựa Chọn
            </a>
          </div>
        </div>

        {!kq ? (
          <div className="mt-4 text-xs text-slate-500">
            Chưa có dữ liệu kết quả. Hãy vào trang chơi và bấm “Nộp bài / Kết thúc”.
          </div>
        ) : (
          <div className="mt-3 text-xs text-slate-500">
            Thời gian: <span className="font-semibold text-slate-700">{kq.thoiGian}</span>
          </div>
        )}
      </div>
    </main>
  );
}
