// app/admin/phong/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type NguoiChoi = {
  ten: string;
  vaiTro: string;
  diem: number;
  trangThai: "Đang chơi" | "Hoàn thành" | "Bị loại";
  buocHienTai: number;
  tongBuoc: number;
};

type TopoNode = {
  id: string;
  label: string;
  type: "router" | "switch" | "server" | "pc" | "siem";
  up: boolean;
  cpu: number;
  infected: boolean;
};

type TopoLink = {
  id: string;
  from: string;
  to: string;
  up: boolean;
  rtt: number;
};

type TopoData = {
  nodes: TopoNode[];
  links: TopoLink[];
};

type SuKien = {
  thoiGian: string;
  noiDung: string;
};

type KichBan = {
  ten: string;
  tomTat: string;
};

const LOCAL_PREFIX = "mmhcs:phong:";
const EVENT_KEY_SUFFIX = ":events";

function MapTrangThai(raw?: string): NguoiChoi["trangThai"] {
  if (raw === "Hoan thanh") return "Hoàn thành";
  if (raw === "Bi loai") return "Bị loại";
  if (raw === "Dang choi") return "Đang chơi";
  if (raw === "Đang chơi" || raw === "Hoàn thành" || raw === "Bị loại") return raw;
  return "Đang chơi";
}

function ReadPlayersFromLocal(id: string): NguoiChoi[] | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PREFIX}${id}:players`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.map((p) => ({
      ten: p?.ten ?? "Player",
      vaiTro: p?.vaiTro ?? "Player",
      diem: typeof p?.diem === "number" ? p.diem : 0,
      trangThai: MapTrangThai(p?.trangThai),
      buocHienTai: typeof p?.buocHienTai === "number" ? p.buocHienTai : 0,
      tongBuoc: typeof p?.tongBuoc === "number" ? p.tongBuoc : 0,
    }));
  } catch {
    return null;
  }
}

function ReadEventsFromLocal(id: string): SuKien[] | null {
  try {
    const raw = localStorage.getItem(`${LOCAL_PREFIX}${id}${EVENT_KEY_SUFFIX}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter((e) => e?.noiDung);
  } catch {
    return null;
  }
}

function mergeEvents(base: SuKien[], incoming: SuKien[]) {
  const seen = new Set(base.map((e) => `${e.thoiGian}|${e.noiDung}`));
  const next = [...base];
  incoming.forEach((e) => {
    const key = `${e.thoiGian}|${e.noiDung}`;
    if (!seen.has(key)) {
      seen.add(key);
      next.push(e);
    }
  });
  return next;
}

function The({
  tieuDe,
  children,
  className = "",
}: {
  tieuDe?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={[
        "rounded-2xl border border-slate-300/80 bg-white shadow-md backdrop-blur",
        "ring-1 ring-black/5",
        className,
      ].join(" ")}
    >
      {tieuDe ? (
        <div className="flex items-center justify-between border-b border-slate-200/70 px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-800">{tieuDe}</h3>
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

function DinhDangThoiGian(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(total / 3600)).padStart(2, "0");
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

function IconNode({ node }: { node: TopoNode }) {
  const mauVien = node.infected ? "#f97316" : node.up ? "#10b981" : "#f43f5e";
  const mauNen = node.infected
    ? "rgba(249,115,22,0.22)"
    : node.up
    ? "rgba(16,185,129,0.18)"
    : "rgba(244,63,94,0.18)";

  if (node.type === "router") {
    return (
      <g>
        <circle cx="0" cy="0" r="16" fill={mauNen} stroke={mauVien} strokeWidth="2" />
        <path d="M-7 0h14M0-7v14" stroke={mauVien} strokeWidth="2" />
      </g>
    );
  }

  if (node.type === "switch") {
    return (
      <g>
        <rect x="-18" y="-12" width="36" height="24" rx="6" fill={mauNen} stroke={mauVien} strokeWidth="2" />
        <circle cx="-8" cy="2" r="2" fill={mauVien} />
        <circle cx="0" cy="2" r="2" fill={mauVien} />
        <circle cx="8" cy="2" r="2" fill={mauVien} />
      </g>
    );
  }

  if (node.type === "pc") {
    return (
      <g>
        <rect x="-16" y="-12" width="32" height="20" rx="4" fill={mauNen} stroke={mauVien} strokeWidth="2" />
        <rect x="-6" y="10" width="12" height="4" rx="2" fill={mauVien} />
      </g>
    );
  }

  return (
    <g>
      <rect x="-16" y="-14" width="32" height="28" rx="4" fill={mauNen} stroke={mauVien} strokeWidth="2" />
      <rect x="-10" y="-6" width="20" height="3" rx="1.5" fill={mauVien} />
      <rect x="-10" y="2" width="20" height="3" rx="1.5" fill={mauVien} />
    </g>
  );
}

function TopoPacketTracer({ topo }: { topo: TopoData }) {
  const layout: Record<string, { x: number; y: number }> = {
    r1: { x: 60, y: 40 },
    sw1: { x: 200, y: 80 },
    web: { x: 340, y: 40 },
    db: { x: 340, y: 110 },
    siem: { x: 340, y: 180 },
    client: { x: 200, y: 180 },
  };

  return (
    <svg viewBox="0 0 420 240" className="h-full w-full">
      <defs>
        <linearGradient id="pt-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(248,250,252,0.95)" />
          <stop offset="100%" stopColor="rgba(226,232,240,0.95)" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="400" height="220" rx="18" fill="url(#pt-bg)" />

      {topo.links.map((link) => {
        const from = layout[link.from];
        const to = layout[link.to];
        if (!from || !to) return null;
        const fromNode = topo.nodes.find((n) => n.id === link.from);
        const toNode = topo.nodes.find((n) => n.id === link.to);
        const lanTruyen = Boolean(fromNode?.infected || toNode?.infected);
        return (
          <g key={link.id}>
            <path
              d={`M${from.x} ${from.y} L${to.x} ${to.y}`}
              stroke={
                lanTruyen
                  ? "rgba(249,115,22,0.9)"
                  : link.up
                  ? "rgba(16,185,129,0.9)"
                  : "rgba(244,63,94,0.9)"
              }
              strokeWidth="2"
            />
            <circle cx={(from.x + to.x) / 2} cy={(from.y + to.y) / 2} r="3" fill="#0f172a" />
            <text
              x={(from.x + to.x) / 2 + 8}
              y={(from.y + to.y) / 2 - 6}
              fontSize="10"
              fill="rgba(15,23,42,0.8)"
            >
              {link.rtt}ms
            </text>
          </g>
        );
      })}

      {topo.nodes.map((node) => {
        const pos = layout[node.id];
        if (!pos) return null;
        return (
          <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
            <IconNode node={node} />
            <text x="0" y="26" textAnchor="middle" fontSize="11" fill="#0f172a">
              {node.label}
            </text>
            <text x="0" y="38" textAnchor="middle" fontSize="9" fill="rgba(15,23,42,0.7)">
              CPU {node.cpu}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function HuyHieuTrangThai({ trangThai }: { trangThai: NguoiChoi["trangThai"] }) {
  const cls =
    trangThai === "Hoàn thành"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : trangThai === "Bị loại"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-amber-50 text-amber-700 ring-amber-200";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          trangThai === "Hoàn thành" ? "bg-emerald-500" : trangThai === "Bị loại" ? "bg-rose-500" : "bg-amber-500"
        }`}
      />
      {trangThai}
    </span>
  );
}

const DU_LIEU = {
  sessionStart: Date.now(),
  nguoiChoi: [
    { ten: "Nguyễn A", vaiTro: "Blue Team", diem: 120, trangThai: "Đang chơi", buocHienTai: 3, tongBuoc: 8 },
    { ten: "Trần B", vaiTro: "Red Team", diem: 180, trangThai: "Hoàn thành", buocHienTai: 8, tongBuoc: 8 },
    { ten: "Lê C", vaiTro: "SOC", diem: 95, trangThai: "Đang chơi", buocHienTai: 4, tongBuoc: 10 },
    { ten: "Phạm D", vaiTro: "IR", diem: 60, trangThai: "Bị loại", buocHienTai: 2, tongBuoc: 7 },
  ] as NguoiChoi[],
  topo: {
    nodes: [
      { id: "r1", label: "Gateway", type: "router", up: true, cpu: 28, infected: false },
      { id: "sw1", label: "Core SW", type: "switch", up: true, cpu: 18, infected: false },
      { id: "web", label: "Web (DMZ)", type: "server", up: true, cpu: 35, infected: false },
      { id: "db", label: "DB (LAN)", type: "server", up: true, cpu: 42, infected: false },
      { id: "siem", label: "SIEM", type: "siem", up: true, cpu: 38, infected: false },
      { id: "client", label: "Client VLAN", type: "pc", up: true, cpu: 22, infected: false },
    ] as TopoNode[],
    links: [
      { id: "r1-sw1", from: "r1", to: "sw1", up: true, rtt: 2.1 },
      { id: "sw1-web", from: "sw1", to: "web", up: true, rtt: 3.2 },
      { id: "sw1-db", from: "sw1", to: "db", up: true, rtt: 4.6 },
      { id: "sw1-siem", from: "sw1", to: "siem", up: true, rtt: 5.1 },
      { id: "sw1-client", from: "sw1", to: "client", up: true, rtt: 1.8 },
    ] as TopoLink[],
  },
  eventLog: [] as SuKien[],
};

export default function Page() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params?.id?.[0] : params?.id;
  const router = useRouter();

  const [kichBan, setKichBan] = useState<KichBan | null>(null);
  const [nguoiChoi, setNguoiChoi] = useState<NguoiChoi[]>(DU_LIEU.nguoiChoi);
  const [eventLog, setEventLog] = useState<SuKien[]>(DU_LIEU.eventLog);
  const [topo, setTopo] = useState<TopoData>(DU_LIEU.topo);
  const [sessionStart, setSessionStart] = useState<number | null>(DU_LIEU.sessionStart);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [ketNoi, setKetNoi] = useState(false);
  const [xemChiTiet, setXemChiTiet] = useState(false);

  useEffect(() => {
    if (!id) return;
    const readLocal = () => {
      const localPlayers = ReadPlayersFromLocal(id);
      if (localPlayers && localPlayers.length > 0) {
        setNguoiChoi(localPlayers);
      }
    };

    readLocal();
    const onStorage = (evt: StorageEvent) => {
      if (evt.key !== `${LOCAL_PREFIX}${id}:players`) return;
      readLocal();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const readLocal = () => {
      const localEvents = ReadEventsFromLocal(id);
      if (localEvents && localEvents.length > 0) {
        setEventLog((log) => mergeEvents(localEvents, log).slice(0, 200));
      }
    };
    readLocal();
    const onStorage = (evt: StorageEvent) => {
      if (evt.key !== `${LOCAL_PREFIX}${id}${EVENT_KEY_SUFFIX}`) return;
      readLocal();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const raw = localStorage.getItem(`${LOCAL_PREFIX}${id}:kich-ban`);
    if (raw) {
      try {
        setKichBan(JSON.parse(raw) as KichBan);
      } catch {
        setKichBan(null);
      }
    }
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const es = new EventSource(`/admin/phong/${id}/stream`);

    es.onopen = () => setKetNoi(true);
    es.onerror = () => setKetNoi(false);
    es.onmessage = (evt) => {
      try {
        const data = JSON.parse(evt.data);
        if (data?.sessionStart) setSessionStart(data.sessionStart);
        if (data?.type === "status" || data?.type === "snapshot") {
          if (Array.isArray(data.players)) setNguoiChoi(data.players);
          if (data.topo?.nodes && data.topo?.links) setTopo(data.topo);
          if (Array.isArray(data.events)) {
            setEventLog((log) => [...data.events, ...log].slice(0, 200));
          } else if (data.event?.noiDung) {
            setEventLog((log) => [data.event, ...log].slice(0, 200));
          }
        }
      } catch {
        // ignore malformed payloads
      }
    };

    return () => es.close();
  }, [id]);

  useEffect(() => {
    if (!sessionStart) return;
    const t = setInterval(() => {
      setElapsedMs(Date.now() - sessionStart);
    }, 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  const soNguoiThamGia = nguoiChoi.length;
  const daHoanThanh = useMemo(
    () => nguoiChoi.filter((p) => p.trangThai === "Hoàn thành").length,
    [nguoiChoi]
  );
  const tiLeHoanThanh = soNguoiThamGia > 0 ? Math.round((daHoanThanh / soNguoiThamGia) * 100) : 0;
  const thoiGianDaChoi = DinhDangThoiGian(elapsedMs);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f7_55%,_#e2e8f0)] p-4 text-slate-900 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(248,113,113,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:18px_18px]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-black/5">
              Admin - Theo dõi phòng #{id}
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl title-scan">
              Bảng theo dõi tiến trình
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>
                Xem tiến trình người chơi, topo mạng và nhật ký sự kiện theo thời gian thực.
              </span>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                  ketNoi ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-rose-50 text-rose-700 ring-rose-200"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${ketNoi ? "bg-emerald-500" : "bg-rose-500"}`} />
                {ketNoi ? "Đang kết nối realtime" : "Mất kết nối"}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <a
              href="/admin"
              className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              Thoát
            </a>
            <button
              type="button"
              onClick={() => router.push("/admin/ket-qua")}
              className="rounded-xl bg-teal-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-teal-600 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              Kết thúc
            </button>
          </div>
        </div>

        {kichBan ? (
          <div className="mb-4 rounded-2xl border border-slate-300 bg-white/90 p-4 shadow-sm ring-1 ring-black/5">
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">Kịch bản</div>
            <div className="mt-2 text-lg font-semibold text-slate-900">{kichBan.ten}</div>
            <div className="mt-1 text-sm text-slate-600">{kichBan.tomTat}</div>
          </div>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <The>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Số người tham gia</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{soNguoiThamGia}</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-500 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M7 7h10v10H7z" />
                  <path d="M4 10h3M17 10h3M12 4v3M12 17v3" strokeLinecap="round" />
                </svg>
              </div>
            </div>
          </The>
          <The>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Đã hoàn thành</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{daHoanThanh}</div>
                <div className="mt-2 h-2 w-full rounded-full bg-slate-100 ring-1 ring-black/5">
                  <div className="h-2 rounded-full bg-indigo-500" style={{ width: `${tiLeHoanThanh}%` }} />
                </div>
                <div className="mt-1 text-xs text-slate-500">{tiLeHoanThanh}% hoàn thành</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M5 12l4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </The>
          <The>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500">Thời gian đã chơi</div>
                <div className="mt-1 text-2xl font-bold text-slate-900">{thoiGianDaChoi}</div>
              </div>
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-500 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </The>
        </div>

        <div className="relative mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <The tieuDe="Minh họa nhanh">
            <div className="grid gap-4">
              <div className="relative overflow-hidden rounded-xl border border-sky-200/70 bg-gradient-to-br from-white via-sky-50 to-sky-100 p-5 text-slate-800 shadow-sm">
                <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-sky-100/70" />
                <div className="text-base font-semibold">Sơ đồ Packet Tracer</div>
                <div className="mt-1 text-sm text-slate-500">Thiết bị, link, RTT cập nhật realtime</div>
                <div className="mt-4 rounded-xl border border-slate-200/70 bg-white/80 px-4 py-3">
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    Danh sách thiết bị
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {topo.nodes.map((node) => (
                      <span
                        key={node.id}
                        className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/70"
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${node.up ? "bg-emerald-500" : "bg-rose-500"}`} />
                        {node.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-slate-200/70">
                  <div className="h-80 w-full sm:h-[360px] lg:h-[420px]">
                    <TopoPacketTracer topo={topo} />
                  </div>
                </div>
              </div>
            </div>
          </The>

          <The tieuDe="Topo">
            <div className="space-y-3">
              <div className="grid gap-2">
                {topo.nodes.map((node) => (
                  <div
                    key={node.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700 ring-1 ring-slate-200/70"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${node.up ? "bg-emerald-500" : "bg-rose-500"}`} />
                      <span className="font-semibold text-slate-900">{node.label}</span>
                      <span className="text-xs text-slate-500">({node.type})</span>
                      {node.infected ? (
                        <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-semibold text-orange-700 ring-1 ring-orange-200">
                          Nhiễm mã độc
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-slate-500">CPU {node.cpu}%</span>
                  </div>
                ))}
              </div>
              <div className="grid gap-2">
                {topo.links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600 ring-1 ring-slate-200/70"
                  >
                    <span>
                      {link.from.toUpperCase()} - {link.to.toUpperCase()}
                    </span>
                    <span className={link.up ? "text-emerald-600" : "text-rose-600"}>
                      {link.up ? "Up" : "Down"} - {link.rtt}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </The>

          <div className="grid gap-4 lg:grid-cols-2">
            <The tieuDe="Tiến trình" className="transition-[transform,box-shadow] duration-300">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">Bảng trạng thái người chơi</div>
                <button
                  type="button"
                  onClick={() => setXemChiTiet(true)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
                >
                  Xem chi tiết
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200/70">
                <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                  <div>Tên</div>
                  <div>Vai trò</div>
                  <div>Điểm</div>
                  <div>Tiến độ</div>
                  <div>Trạng thái</div>
                </div>

                <div className="max-h-[320px] overflow-auto">
                  {nguoiChoi.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr_1fr] items-center border-t border-slate-200/70 bg-white px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-900">{p.ten}</div>
                      <div className="text-slate-600">{p.vaiTro}</div>
                      <div className="font-semibold text-slate-900">{p.diem}</div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          Bước {p.buocHienTai}/{p.tongBuoc}
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 ring-1 ring-black/5">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((p.buocHienTai / Math.max(1, p.tongBuoc)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <HuyHieuTrangThai trangThai={p.trangThai} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </The>

            <The tieuDe="Event log">
              <div className="max-h-[520px] space-y-2 overflow-auto">
                {eventLog.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                    Chưa có sự kiện nào.
                  </div>
                ) : (
                  eventLog.map((e, i) => (
                    <div key={`${e.thoiGian}-${i}`} className="rounded-xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200/70">
                      <div className="text-xs font-semibold text-slate-600">{e.thoiGian}</div>
                      <div className="text-sm font-medium text-slate-800">{e.noiDung}</div>
                    </div>
                  ))
                )}
              </div>
            </The>
          </div>
        </div>
      </div>

      {xemChiTiet ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-5xl">
            <The tieuDe="Tiến trình (chi tiết)" className="shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-xs text-slate-500">Theo dõi đầy đủ trạng thái người chơi</div>
                <button
                  type="button"
                  onClick={() => setXemChiTiet(false)}
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 active:scale-[0.99]"
                >
                  Thoát
                </button>
              </div>
              <div className="overflow-hidden rounded-xl border border-slate-200/70">
                <div className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr_1fr] bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-600">
                  <div>Tên</div>
                  <div>Vai trò</div>
                  <div>Điểm</div>
                  <div>Tiến độ</div>
                  <div>Trạng thái</div>
                </div>

                <div className="max-h-[70vh] overflow-auto">
                  {nguoiChoi.map((p, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-[1.2fr_1fr_0.6fr_0.8fr_1fr] items-center border-t border-slate-200/70 bg-white px-4 py-3 text-sm hover:bg-slate-50"
                    >
                      <div className="font-semibold text-slate-900">{p.ten}</div>
                      <div className="text-slate-600">{p.vaiTro}</div>
                      <div className="font-semibold text-slate-900">{p.diem}</div>
                      <div className="space-y-1">
                        <div className="text-xs text-slate-500">
                          Bước {p.buocHienTai}/{p.tongBuoc}
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-100 ring-1 ring-black/5">
                          <div
                            className="h-2 rounded-full bg-emerald-500"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.round((p.buocHienTai / Math.max(1, p.tongBuoc)) * 100)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <HuyHieuTrangThai trangThai={p.trangThai} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </The>
          </div>
        </div>
      ) : null}
    </main>
  );
}
