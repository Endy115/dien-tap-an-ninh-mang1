"use client";

import Link from "next/link";
import { use, useEffect, useMemo, useState } from "react";

type NguoiChoi = {
  id: string;
  ten: string;
  vaiTro: string;
  diem: number;
  trangThai: "Dang choi" | "Hoan thanh" | "Bi loai";
  buocHienTai: number;
  tongBuoc: number;
};

type KichBan = {
  ten: string;
  tomTat: string;
};

type NhanVat = {
  id: string;
  ten: string;
  vaiTro: string;
  moTa: string;
};

type PlayerSlot = {
  id: string;
  name?: string;
  role?: string;
  intro?: string;
};

type ChatMsg = {
  id: string;
  name: string;
  text: string;
  time: string;
};

type Friend = {
  id: string;
  name: string;
  role?: string;
  intro?: string;
  trangThai?: "Sẵn sàng" | "Bận" | "Đã mời" | "Chung phòng";
};

type FriendRaw = {
  id: string;
  ten: string;
  vaiTro: string;
  ghiChu?: string;
  trangThai?: "Sẵn sàng" | "Bận" | "Đã mời" | "Chung phòng";
};

const MA_PHONG_MAU = "ABC123";
const HOST_MAU = "ABC";

type ThongBao = {
  id: string;
  tieuDe: string;
  noiDung: string;
  loai: "thanh-cong" | "tu-choi" | "thong-tin";
};

const AVATAR_COLORS = [
  "from-indigo-400 to-indigo-500",
  "from-emerald-400 to-emerald-500",
  "from-sky-400 to-sky-500",
  "from-rose-400 to-rose-500",
  "from-amber-300 to-amber-400",
  "from-purple-400 to-purple-500",
];

function layVietTat(ten?: string) {
  if (!ten) return "U";
  return ten
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((tu) => tu[0]?.toUpperCase())
    .join("");
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: phongId } = use(params);

  const storageKey = `mmhcs:phong:${phongId}:players`;
  const chatKey = `mmhcs:phong:${phongId}:chat`;
  const selfKey = `mmhcs:phong:${phongId}:self`;

  const [players, setPlayers] = useState<NguoiChoi[]>([]);
  const [scenario, setScenario] = useState<KichBan>({
    ten: "Kịch bản X: ABCDEF GHIJK LMNO PQ",
    tomTat: "Mô tả kịch bản",
  });
  const [characters, setCharacters] = useState<NhanVat[]>([]);
  const [invitees, setInvitees] = useState<Friend[]>([]);
  const [thongBao, setThongBao] = useState<ThongBao[]>([]);
  const [cooldownMoi, setCooldownMoi] = useState<Record<string, number>>({});
  const [nowMs, setNowMs] = useState(Date.now());
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [selfName, setSelfName] = useState("Bạn");
  const [lastJoinedId, setLastJoinedId] = useState<string | null>(null);

  useEffect(() => {
    if (!phongId) return;
    let next: NguoiChoi[] = [];
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      try {
        next = JSON.parse(raw) as NguoiChoi[];
      } catch {
        next = [];
      }
    }

    let selfId = localStorage.getItem(selfKey);
    if (!selfId) {
      selfId = Math.random().toString(16).slice(2, 8);
      localStorage.setItem(selfKey, selfId);
    }

    let tenHienTai = "";
    if (!next.some((p) => p.id === selfId)) {
      const name = `USER ${next.length + 1}`;
      tenHienTai = name;
      next = [
        ...next,
        {
          id: selfId,
          ten: name,
          vaiTro: "PLAYER",
          diem: 0,
          trangThai: "Dang choi",
          buocHienTai: 0,
          tongBuoc: 0,
        },
      ];
    }

    const tenTuDanhSach = next.find((p) => p.id === selfId)?.ten;
    setSelfName(tenTuDanhSach || tenHienTai || "Bạn");

    setPlayers(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  }, [phongId, storageKey, selfKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const rawScenario = localStorage.getItem("mmhcs:kich-ban:selected");
    if (rawScenario) {
      try {
        const parsed = JSON.parse(rawScenario) as KichBan;
        if (parsed?.ten) setScenario(parsed);
      } catch {
        // ignore invalid payload
      }
    }

    const rawChars = localStorage.getItem("mmhcs:characters");
    if (rawChars) {
      try {
        const parsed = JSON.parse(rawChars) as NhanVat[];
        if (Array.isArray(parsed)) setCharacters(parsed);
      } catch {
        // ignore invalid payload
      }
    }

    const rawFriends = localStorage.getItem("mmhcs:friends");
    if (rawFriends) {
      try {
        const parsed = JSON.parse(rawFriends) as FriendRaw[];
        if (Array.isArray(parsed)) {
          setInvitees(
            parsed.map((p) => ({
              id: p.id,
              name: p.ten,
              role: p.vaiTro,
              intro: p.ghiChu ?? "",
              trangThai: p.trangThai ?? "Sẵn sàng",
            }))
          );
        }
      } catch {
        // ignore invalid payload
      }
    }
  }, []);

  useEffect(() => {
    const rawChat = localStorage.getItem(chatKey);
    if (rawChat) {
      try {
        setChat(JSON.parse(rawChat) as ChatMsg[]);
      } catch {
        // ignore invalid payload
      }
    }
    const onStorage = (evt: StorageEvent) => {
      if (evt.key === storageKey && evt.newValue) {
        try {
          setPlayers(JSON.parse(evt.newValue) as NguoiChoi[]);
        } catch {
          // ignore invalid payload
        }
      }
      if (evt.key === chatKey && evt.newValue) {
        try {
          setChat(JSON.parse(evt.newValue) as ChatMsg[]);
        } catch {
          // ignore invalid payload
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [storageKey, chatKey]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const slots = useMemo<PlayerSlot[]>(() => {
    if (characters.length > 0) {
      return characters.map((c, index) => {
        const p = players[index];
        return {
          id: c.id,
          name: p?.ten,
          role: c.vaiTro,
          intro: c.moTa,
        };
      });
    }

    const filled = players.slice(0, 6).map((p) => ({
      id: p.id,
      name: p.ten,
      role: p.vaiTro ?? "",
      intro: "",
    }));
    const empty = Array.from({ length: Math.max(0, 6 - filled.length) }).map((_, i) => ({
      id: `empty-${i}`,
    }));
    return [...filled, ...empty];
  }, [players, characters]);

  const guiTinNhan = () => {
    const noiDung = chatInput.trim();
    if (!noiDung) return;
    const gio = new Date();
    const time = `${String(gio.getHours()).padStart(2, "0")}:${String(gio.getMinutes()).padStart(2, "0")}`;
    const tin: ChatMsg = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: selfName,
      text: noiDung,
      time,
    };
    const next = [...chat, tin].slice(-50);
    setChat(next);
    localStorage.setItem(chatKey, JSON.stringify(next));
    setChatInput("");
  };

  const friends: Friend[] =
    invitees.length > 0
      ? invitees
      : [
          { id: "f1", name: "Người chơi 01", role: "Analyst", intro: "Có thể hỗ trợ đọc log.", trangThai: "Sẵn sàng" },
          { id: "f2", name: "Người chơi 02", role: "IR Lead", intro: "Điều phối xử lý sự cố.", trangThai: "Sẵn sàng" },
          { id: "f3", name: "Người chơi 03", role: "Forensics", intro: "Phân tích artifact.", trangThai: "Bận" },
          { id: "f4", name: "Người chơi 04", role: "SOC L1", intro: "Theo dõi cảnh báo.", trangThai: "Sẵn sàng" },
          { id: "f5", name: "Người chơi 05", role: "Threat Hunter", intro: "Săn IOC.", trangThai: "Đã mời" },
        ];

  const capNhatFriends = (ds: Friend[]) => {
    setInvitees(ds);
    const raw = ds.map((f) => ({
      id: f.id,
      ten: f.name,
      vaiTro: f.role ?? "",
      ghiChu: f.intro ?? "",
      trangThai: f.trangThai ?? "Sẵn sàng",
    }));
    localStorage.setItem("mmhcs:friends", JSON.stringify(raw));
  };

  const themThongBao = (tieuDe: string, noiDung: string, loai: ThongBao["loai"]) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    setThongBao((ds) => [{ id, tieuDe, noiDung, loai }, ...ds].slice(0, 4));
    setTimeout(() => {
      setThongBao((ds) => ds.filter((tb) => tb.id !== id));
    }, 3500);
  };

  const moiNguoiChoi = (friend: Friend) => {
    if (friend.trangThai !== "Sẵn sàng") return;
    const dangCho = cooldownMoi[friend.id] && cooldownMoi[friend.id] > nowMs;
    if (dangCho) return;
    const nextFriends = friends.map((f) =>
      f.id === friend.id ? { ...f, trangThai: "Đã mời" } : f
    );
    capNhatFriends(nextFriends);

    const chapNhan = Math.random() > 0.25;
    setTimeout(() => {
      if (!chapNhan) {
        setCooldownMoi((cu) => ({ ...cu, [friend.id]: Date.now() + 5000 }));
        const tuChoi = nextFriends.map((f) =>
          f.id === friend.id ? { ...f, trangThai: "Sẵn sàng" } : f
        );
        capNhatFriends(tuChoi);
        themThongBao("Từ chối lời mời", `${friend.name} đã từ chối vào phòng.`, "tu-choi");
        return;
      }

      const chapNhanDs = nextFriends.map((f) =>
        f.id === friend.id ? { ...f, trangThai: "Chung phòng" } : f
      );
      capNhatFriends(chapNhanDs);
      themThongBao("Mời thành công", `${friend.name} đã vào phòng.`, "thanh-cong");

      const rawPlayers = localStorage.getItem(storageKey);
      const ds: NguoiChoi[] = rawPlayers ? JSON.parse(rawPlayers) : [];
      if (!ds.some((p) => p.id === friend.id)) {
        const nextPlayers = [
          ...ds,
          {
            id: friend.id,
            ten: friend.name,
            vaiTro: friend.role ?? "Người chơi",
            diem: 0,
            trangThai: "Dang choi",
            buocHienTai: 0,
            tongBuoc: 0,
          },
        ];
        localStorage.setItem(storageKey, JSON.stringify(nextPlayers));
        setPlayers(nextPlayers);
        setLastJoinedId(friend.id);
        setTimeout(() => setLastJoinedId((cur) => (cur === friend.id ? null : cur)), 1200);
      }
    }, 900);
  };

  const mauTrangThai = (trangThai?: Friend["trangThai"]) => {
    if (trangThai === "Bận") return "bg-amber-50 text-amber-700 ring-amber-200";
    if (trangThai === "Đã mời") return "bg-blue-50 text-blue-700 ring-blue-200";
    if (trangThai === "Chung phòng") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f7_55%,_#e2e8f0)] p-4 sm:p-6">
      <div className="pointer-events-none fixed right-4 top-4 z-50 flex w-[280px] flex-col gap-2 sm:right-6 sm:top-6">
        {thongBao.map((tb) => (
          <div
            key={tb.id}
            className={[
              "pointer-events-auto rounded-2xl border px-3 py-2 text-xs shadow-lg backdrop-blur",
              tb.loai === "thanh-cong"
                ? "border-emerald-200/70 bg-emerald-50 text-emerald-700"
                : tb.loai === "tu-choi"
                ? "border-rose-200/70 bg-rose-50 text-rose-700"
                : "border-slate-200/70 bg-white/80 text-slate-600",
            ].join(" ")}
          >
            <div className="text-sm font-semibold">{tb.tieuDe}</div>
            <div className="mt-1 text-xs">{tb.noiDung}</div>
          </div>
        ))}
      </div>
      <div className="mx-auto w-full max-w-7xl">
        <section className="rounded-2xl border border-slate-300 bg-white/95 shadow-xl ring-1 ring-black/5">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/70 px-4 py-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
              >
                <span aria-hidden>←</span>
                Quay lại
              </Link>
              <div className="text-lg font-semibold text-slate-900 title-scan">Trong phòng</div>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
              <span>Trong phòng</span>
              <span className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600">
                {players.length} / {Math.max(players.length, friends.length)}
              </span>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
            <section className="border-r border-slate-200/70 p-4 sm:p-5">
              <div className="grid gap-3 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-md transition-transform duration-200 hover:scale-[1.3]">
                  <div className="text-sm font-semibold text-slate-900">
                    {scenario.ten}
                  </div>
                  <div className="mt-1 text-xs text-slate-600">{scenario.tomTat}</div>
                </div>
                <div className="rounded-2xl border border-slate-300 bg-white px-4 py-3 shadow-md">
                  <div className="text-sm font-semibold text-slate-900">
                    Mã phòng: <span className="font-bold">{MA_PHONG_MAU}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-600">
                    Host: <span className="font-semibold text-slate-900">{HOST_MAU}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                {slots.map((slot, index) => {
                  const mauAvatar = AVATAR_COLORS[index % AVATAR_COLORS.length];
                  const vuaVao = slot.id === lastJoinedId;
                  return (
                    <div
                      key={slot.id}
                      className={[
                        "rounded-2xl border border-slate-300 bg-white/95 p-3 text-center shadow-md transition-transform duration-200 hover:scale-[1.08] hover:shadow-lg",
                        vuaVao ? "ring-2 ring-emerald-300 shadow-emerald-200/70 animate-pulse" : "",
                      ].join(" ")}
                    >
                      {slot.name ? (
                        <div className="flex flex-col items-center justify-center text-slate-800">
                          <div
                            className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${mauAvatar} text-sm font-bold text-white shadow-sm`}
                          >
                            {layVietTat(slot.name)}
                          </div>
                          <div className="mt-2 text-xs font-semibold">{slot.name}</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-600">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-slate-300 text-xs font-semibold text-slate-400">
                            {slot.role ? layVietTat(slot.role) : "+"}
                          </div>
                          <div className="mt-2 text-[11px] font-semibold">{slot.role ?? "Nhân vật"}</div>
                        </div>
                      )}
                      <div className="mt-3 text-[11px] font-semibold text-slate-700">Mô tả:</div>
                      <div className="text-[11px] text-slate-600">{slot.intro ?? ""}</div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4">
                <Link
                  href={`/user/${phongId}/choi`}
                  className="inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0"
                >
                  Bắt đầu chơi
                </Link>
              </div>
            </section>

            <aside className="p-4 sm:p-5">
              <div className="rounded-2xl border border-slate-300 bg-white shadow-md">
                <div className="border-b border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-900">
                  Trò chuyện
                </div>
                <div className="h-[420px] space-y-2 overflow-auto p-4">
                  {chat.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                      Chưa có tin nhắn. Hãy bắt đầu trò chuyện.
                    </div>
                  ) : (
                    chat.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-[10px] font-semibold text-white">
                            {layVietTat(m.name)}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-900">
                              {m.name}: <span className="font-normal">{m.text}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">{m.time}</div>
                      </div>
                    ))
                  )}
                </div>
                <div className="border-t border-slate-200 p-3">
                  <div className="flex w-full items-center gap-2">
                    <input
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") guiTinNhan();
                      }}
                      placeholder="Nhập tin nhắn..."
                      className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-slate-300"
                    />
                    <button
                      type="button"
                      onClick={guiTinNhan}
                      className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
                    >
                      Gửi
                    </button>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
