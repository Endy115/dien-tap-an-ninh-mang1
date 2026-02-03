"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  user: string;
};

function setHostCookie(roomId: string) {
  const safe = encodeURIComponent(roomId);
  document.cookie = `mmhcs_host_room=${safe}; path=/; SameSite=Lax`;
}

export default function LobbyHub({ user }: Props) {
  const router = useRouter();
  const [joinRoomId, setJoinRoomId] = useState("");
  const [selectedScenario, setSelectedScenario] = useState<string>("s1");
  const [hoverScenario, setHoverScenario] = useState<string | null>(null);
  const [hoverPos, setHoverPos] = useState<"left" | "right">("left");
  const [audioCtx, setAudioCtx] = useState<AudioContext | null>(null);
  const [activePanel, setActivePanel] = useState<"create" | "join" | null>(null);

  const scenarios = useMemo(
    () => [
      {
        id: "s1",
        name: "Email Security Simulation",
        desc:
          "Chuỗi email hóa đơn giả mạo xuất hiện trong hộp thư kế toán. Người chơi cần phân tích tiêu đề, xác minh domain, mở file đính kèm trong môi trường an toàn và xác định IOC.",
        detail:
          "Bạn sẽ mô phỏng việc tiếp nhận, phân loại và xử lý một email nghi ngờ. Mục tiêu là phát hiện mồi nhử sớm, khoanh vùng rủi ro và đề xuất biện pháp phản ứng phù hợp.",
        points: [
          "Kiểm tra header, SPF/DKIM/DMARC và domain look-alike.",
          "Phân tích file đính kèm trong sandbox, trích IOC.",
          "Thực hiện containment và báo cáo theo SOP.",
        ],
        duration: "10–15 phút",
        level: "LOW",
        accent: "from-cyan-400/20 to-slate-800/0",
        image: "/scenario-email.svg",
      },
      {
        id: "s2",
        name: "Ransomware Incident",
        desc:
          "Một máy trạm báo mã hóa dữ liệu hàng loạt, log SIEM xuất hiện hành vi bất thường. Bạn cần điều phối các bước triage, isolation và khôi phục.",
        detail:
          "Tình huống mô phỏng tấn công ransomware lan trong mạng nội bộ. Người chơi phải đưa ra quyết định nhanh để giảm thiệt hại và phục hồi dịch vụ trọng yếu.",
        points: [
          "Xác định patient zero và phạm vi lây lan.",
          "Cô lập thiết bị, thu thập log và timeline.",
          "Khởi động kế hoạch backup/restore có kiểm soát.",
        ],
        duration: "20–30 phút",
        level: "MODERATE",
        accent: "from-amber-400/20 to-slate-800/0",
        image: "/scenario-ransomware.svg",
      },
      {
        id: "s3",
        name: "Phishing Campaign",
        desc:
          "Chiến dịch lừa đảo nhắm vào nhiều phòng ban, kèm link đăng nhập giả. Nhiệm vụ là phát hiện mẫu, triển khai cảnh báo và giảm tỷ lệ click.",
        detail:
          "Bạn cần đánh giá mức độ ảnh hưởng, phát hiện template phishing và triển khai biện pháp phòng vệ theo nhiều lớp (email, proxy, user awareness).",
        points: [
          "Phân loại mẫu phishing và xác định landing page.",
          "Cập nhật rule chặn domain/URL độc hại.",
          "Gửi cảnh báo và hướng dẫn người dùng.",
        ],
        duration: "15–25 phút",
        level: "LOW",
        accent: "from-emerald-400/20 to-slate-800/0",
        image: "/scenario-phishing.svg",
      },
      {
        id: "s4",
        name: "Malware Outbreak",
        desc:
          "Mã độc lan nhanh qua share nội bộ và USB. Bạn phải khoanh vùng, phân loại mức độ lây nhiễm và tái thiết hệ thống an toàn.",
        detail:
          "Kịch bản yêu cầu phối hợp SOC + IR để dập tắt ổ dịch, xác định vector lây lan và đưa hệ thống trở lại trạng thái ổn định.",
        points: [
          "Phát hiện hành vi lateral movement.",
          "Quét IOC trên endpoint và file server.",
          "Khôi phục hệ thống và xác minh sạch.",
        ],
        duration: "25–35 phút",
        level: "HIGH",
        accent: "from-rose-400/20 to-slate-800/0",
        image: "/scenario-malware.svg",
      },
    ],
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const picked = scenarios.find((s) => s.id === selectedScenario);
    if (picked) {
      localStorage.setItem(
        "mmhcs:kich-ban:selected",
        JSON.stringify({ ten: picked.name, tomTat: picked.detail })
      );
    }
  }, [scenarios, selectedScenario]);

  const taoPhong = () => {
    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
      ? crypto.randomUUID()
      : `${Date.now()}`;
    playBeep("confirm");
    const picked = scenarios.find((s) => s.id === selectedScenario);
    if (picked && typeof window !== "undefined") {
      localStorage.setItem(
        `mmhcs:phong:${id}:kich-ban`,
        JSON.stringify({ ten: picked.name, tomTat: picked.detail })
      );
    }
    setHostCookie(id);
    router.push(`/admin?phong=${encodeURIComponent(id)}`);
  };

  const vaoPhong = () => {
    const id = joinRoomId.trim();
    if (!id) return;
    playBeep("confirm");
    router.push(`/user/${id}`);
  };

  const playBeep = (type: "click" | "hover" | "confirm") => {
    if (typeof window === "undefined") return;
    const ctx = audioCtx ?? new AudioContext();
    if (!audioCtx) setAudioCtx(ctx);

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    const freq = type === "confirm" ? 640 : type === "hover" ? 520 : 420;
    const duration = type === "confirm" ? 0.12 : 0.06;

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  };

  return (
    <section className="grid gap-4">
      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-black/5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Start Scenario
            </div>
            <div className="text-lg font-semibold text-slate-900">Chọn kịch bản</div>
          </div>
          <div className="text-xs text-slate-500">User: {user}</div>
        </div>

        <div className="relative">
          <div
            className={`pointer-events-none absolute top-0 z-20 h-full w-2/3 rounded-2xl bg-white/95 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.22)] ring-1 ring-slate-200 transition-opacity duration-200 ${
              hoverScenario ? "opacity-100" : "opacity-0"
            } ${hoverPos === "left" ? "left-0" : "right-0"}`}
          >
            {hoverScenario ? (() => {
              const picked = scenarios.find((s) => s.id === hoverScenario);
              if (!picked) return null;
              return (
                <div className="flex h-full flex-col">
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Chi tiết kịch bản</div>
                  <div className="mt-3 h-40 overflow-hidden rounded-xl border border-slate-200">
                    <img
                      src={picked.image}
                      alt=""
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/file.svg";
                      }}
                    />
                  </div>
                  <div className="mt-3 text-xl font-semibold text-slate-900">{picked.name}</div>
                  <p className="mt-2 text-sm text-slate-600">{picked.detail}</p>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {picked.points.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                  <div className="mt-4 text-xs text-slate-500">Thời lượng: {picked.duration}</div>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                    Độ khó: {picked.level}
                  </div>
                </div>
              );
            })() : null}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
          {scenarios.map((s) => {
            const active = s.id === selectedScenario;
            const hovering = s.id === hoverScenario;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  playBeep("click");
                  setSelectedScenario(s.id);
                }}
                onMouseEnter={() => {
                  playBeep("hover");
                  setHoverScenario(s.id);
                  setHoverPos(s.id === "s1" || s.id === "s3" ? "left" : "right");
                }}
                onMouseLeave={() => setHoverScenario(null)}
                className={`group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-transform duration-200 ${
                  active
                    ? "border-cyan-400 bg-white text-slate-900 shadow-[0_16px_36px_rgba(14,116,144,0.18)]"
                    : "border-slate-200 bg-white text-slate-800 hover:border-slate-300 hover:shadow-[0_14px_30px_rgba(15,23,42,0.12)]"
                } ${hovering ? "z-10 scale-[1.02]" : ""}`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${s.accent} opacity-60`}
                />
                <div className="relative">
                  <div className="mb-3 h-16 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition-opacity duration-150 group-hover:opacity-0">
                    <img
                      src={s.image}
                      alt=""
                      className="h-full w-full object-cover opacity-80"
                      onError={(e) => {
                        e.currentTarget.src = "/file.svg";
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between transition-opacity duration-150 group-hover:opacity-0">
                    <div className="text-base font-semibold">{s.name}</div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold tracking-[0.2em] ${
                        s.level === "HIGH"
                          ? "bg-rose-500/20 text-rose-200"
                          : s.level === "MODERATE"
                          ? "bg-amber-500/20 text-amber-200"
                          : "bg-emerald-500/20 text-emerald-200"
                      }`}
                    >
                      {s.level}
                    </span>
                  </div>
                  <p className={`mt-2 text-sm ${active ? "text-slate-700" : "text-slate-600"} transition-opacity duration-150 group-hover:opacity-0`}>
                    {s.desc}
                  </p>
                  <div className={`mt-3 text-xs ${active ? "text-slate-500" : "text-slate-500"} transition-opacity duration-150 group-hover:opacity-0`}>
                    {s.duration}
                  </div>
                  {active ? (
                    <div className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-cyan-700 transition-opacity duration-150 group-hover:opacity-0">
                      <span className="h-2 w-2 rounded-full bg-cyan-500" />
                      SELECTED
                    </div>
                  ) : null}
                </div>
              </button>
            );
          })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,0.16)] ring-1 ring-black/5 backdrop-blur">
        <div className="grid gap-4 lg:grid-cols-2">
          <div
            className={`rounded-2xl border border-slate-200 bg-white p-4 transition-transform duration-200 ${
              activePanel === "create" ? "scale-[1.02] shadow-[0_14px_30px_rgba(15,23,42,0.16)]" : ""
            }`}
            onMouseEnter={() => setActivePanel("create")}
            onMouseLeave={() => setActivePanel(null)}
          >
            <div className="text-sm font-semibold text-slate-900">Tạo phòng (Host)</div>
            <p className="mt-1 text-sm text-slate-600">
              Người tạo phòng sẽ trở thành host và được chuyển sang giao diện admin của phòng đó.
            </p>
            <div className="mt-4">
  <button
    type="button"
    onClick={taoPhong}
    className="h-11 w-full rounded-xl bg-cyan-600 px-5 text-sm font-semibold text-white hover:bg-cyan-500"
  >
                Tạo phòng
  </button>
</div>
          </div>

          <div
            className={`rounded-2xl border border-slate-200 bg-white p-4 transition-transform duration-200 ${
              activePanel === "join" ? "scale-[1.02] shadow-[0_14px_30px_rgba(15,23,42,0.16)]" : ""
            }`}
            onMouseEnter={() => setActivePanel("join")}
            onMouseLeave={() => {
              if (!joinRoomId.trim()) setActivePanel(null);
            }}
          >
            <div className="text-sm font-semibold text-slate-900">Vào phòng (User)</div>
            <p className="mt-1 text-sm text-slate-600">
              Nhập mã phòng để tham gia với tư cách người chơi.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-emerald-400"
                value={joinRoomId}
                onChange={(e) => setJoinRoomId(e.target.value)}
                onFocus={() => setActivePanel("join")}
                onBlur={() => {
                  if (!joinRoomId.trim()) setActivePanel(null);
                }}
                placeholder="Nhập mã phòng"
              />
              <button
                type="button"
                onClick={vaoPhong}
                className="h-11 rounded-xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-500"
              >
                Vào phòng
              </button>
            </div>
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Đăng nhập bởi: <b className="text-slate-900">{user}</b>
        </div>
      </div>
    </section>
  );
}
