"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useRef, useState } from "react";

type QuestionType = "mail" | "terminal";

type Question = {
  id: string;
  type: QuestionType;
  text: string;
  options: string[];
  answer?: number;
  note?: string;
  malwareTriggerIndex?: number;
  contextTitle: string;
  contextText: string;
};

type TopoNode = {
  id: string;
  label: string;
  type: "router" | "switch" | "server" | "pc";
  up: boolean;
  infected: boolean;
};

type TopoLink = {
  id: string;
  from: string;
  to: string;
  up: boolean;
};

type Mail = {
  id: string;
  from: string;
  subject: string;
  snippet: string;
  time: string;
  attachment?: string;
  hasMalware?: boolean;
};

type EventLog = {
  thoiGian: string;
  noiDung: string;
};

function keyKetQua(id: string) {
  return `mmhcs:phong:${id}:ket-qua`;
}

function keyEventLog(id: string) {
  return `mmhcs:phong:${id}:events`;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function nowTime() {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function docTenNguoiChoi(phongId: string) {
  if (typeof window === "undefined") return "Người chơi";
  const selfKey = `mmhcs:phong:${phongId}:self`;
  const playersKey = `mmhcs:phong:${phongId}:players`;
  const selfId = localStorage.getItem(selfKey);
  if (!selfId) return "Người chơi";
  try {
    const raw = localStorage.getItem(playersKey);
    if (!raw) return "Người chơi";
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return "Người chơi";
    const me = parsed.find((p) => p?.id === selfId);
    return me?.ten ?? "Người chơi";
  } catch {
    return "Người chơi";
  }
}

function ghiSuKien(phongId: string, noiDung: string) {
  if (typeof window === "undefined") return;
  const next: EventLog[] = [];
  try {
    const raw = localStorage.getItem(keyEventLog(phongId));
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) next.push(...parsed);
    }
  } catch {
    // ignore invalid payload
  }
  next.unshift({ thoiGian: nowTime(), noiDung });
  localStorage.setItem(keyEventLog(phongId), JSON.stringify(next.slice(0, 200)));
}

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id: phongId } = use(params);
  const router = useRouter();

  const questions = useMemo<Question[]>(
    () => [
      {
        id: "q1",
        type: "mail",
        text: "Có nên mở email nghi ngờ không?",
        options: ["A. Có, mở email", "B. Không, không mở"],
        answer: 0,
        note: "Chọn A sẽ mở email và mô phỏng lây nhiễm nếu có mã độc.",
        malwareTriggerIndex: 0,
        contextTitle: "Bối cảnh: Email đáng ngờ",
        contextText:
          "Hệ thống ghi nhận email hóa đơn từ đối tác mới. Hãy quyết định có nên mở email hay không.",
      },
      {
        id: "q2",
        type: "terminal",
        text: "Lệnh nào dùng để từ chối kết nối từ IP độc hại 10.10.10.10?",
        options: [
          "A. iptables -A INPUT -s 10.10.10.10 -j DROP",
          "B. iptables -A INPUT -p tcp --dport 22 -j ACCEPT",
          "C. netstat -an | find \"10.10.10.10\"",
        ],
        answer: 0,
        note: "Chọn sai có thể dẫn đến bị khai thác tiếp.",
        malwareTriggerIndex: 1,
        contextTitle: "Bối cảnh: Chặn kết nối",
        contextText:
          "Phát hiện truy cập bất thường từ 10.10.10.10. Bạn cần chặn kết nối ngay trên gateway.",
      },
    ],
    []
  );

  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [drafts, setDrafts] = useState<Record<string, number | null>>({});
  const [terminalDrafts, setTerminalDrafts] = useState<Record<string, string>>({});
  const [terminalCmds, setTerminalCmds] = useState<Record<string, string>>({});
  const [selectedMailId, setSelectedMailId] = useState("m1");
  const [openedMailApp, setOpenedMailApp] = useState(false);
  const [terminalInput, setTerminalInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const submittedRef = useRef(false);

  const activeQuestion = questions[questionIndex];
  const picked = answers[activeQuestion.id] ?? null;
  const draft = drafts[activeQuestion.id] ?? null;
  const terminalDraft = terminalDrafts[activeQuestion.id] ?? "";
  const terminalCmd = terminalCmds[activeQuestion.id] ?? "";
  const daNop = picked !== null;
  const preview = activeQuestion.type === "terminal" ? picked : draft ?? picked;
  const malwareActive =
    preview !== null && preview === activeQuestion.malwareTriggerIndex;
  const moThu = activeQuestion.type === "mail" && preview === 0;

  const mailList = useMemo<Mail[]>(
    () => [
      {
        id: "m1",
        from: "billing@partner-logistics.com",
        subject: "[Hóa đơn] Vui lòng xác nhận thanh toán",
        snippet: "Đính kèm hóa đơn tháng 11. Vui lòng xem file...",
        time: "09:12",
        attachment: "invoice_2025_11.zip",
        hasMalware: true,
      },
      {
        id: "m2",
        from: "hr@company.local",
        subject: "[Thông báo] Cập nhật quy định bảo mật",
        snippet: "Nhân sự gửi quy định mới về bảo mật thông tin...",
        time: "08:45",
      },
      {
        id: "m3",
        from: "it-helpdesk@company.local",
        subject: "Yêu cầu reset mật khẩu",
        snippet: "Vui lòng xác nhận thông tin để reset mật khẩu...",
        time: "Hôm qua",
      },
    ],
    []
  );

  const selectedMail = useMemo(
    () => mailList.find((m) => m.id === selectedMailId) ?? mailList[0],
    [mailList, selectedMailId]
  );

  const topo = useMemo(() => {
    const infectedIds = malwareActive ? ["pc1", "sw1", "srv1", "db1"] : [];
    const nodes: TopoNode[] = [
      { id: "r1", label: "Gateway", type: "router", up: true, infected: infectedIds.includes("r1") },
      { id: "sw1", label: "Core SW", type: "switch", up: true, infected: infectedIds.includes("sw1") },
      { id: "srv1", label: "Web (DMZ)", type: "server", up: true, infected: infectedIds.includes("srv1") },
      { id: "db1", label: "DB (LAN)", type: "server", up: true, infected: infectedIds.includes("db1") },
      { id: "pc1", label: "PC-ACCT-17", type: "pc", up: true, infected: infectedIds.includes("pc1") },
      { id: "pc2", label: "Client-02", type: "pc", up: true, infected: infectedIds.includes("pc2") },
    ];
    const links: TopoLink[] = [
      { id: "r1-sw1", from: "r1", to: "sw1", up: true },
      { id: "sw1-srv1", from: "sw1", to: "srv1", up: true },
      { id: "sw1-db1", from: "sw1", to: "db1", up: true },
      { id: "sw1-pc1", from: "sw1", to: "pc1", up: true },
      { id: "sw1-pc2", from: "sw1", to: "pc2", up: true },
    ];
    return { nodes, links };
  }, [malwareActive]);

  const layout: Record<string, { x: number; y: number }> = {
    r1: { x: 60, y: 40 },
    sw1: { x: 200, y: 80 },
    srv1: { x: 340, y: 40 },
    db1: { x: 340, y: 120 },
    pc1: { x: 140, y: 180 },
    pc2: { x: 260, y: 180 },
  };

  const nodeColor = (node: TopoNode) => {
    if (!node.up) return { stroke: "#f43f5e", fill: "rgba(244,63,94,0.15)" };
    if (node.infected) return { stroke: "#f97316", fill: "rgba(249,115,22,0.18)" };
    return { stroke: "#10b981", fill: "rgba(16,185,129,0.15)" };
  };

  useEffect(() => {
    if (activeQuestion.type !== "terminal") return;
    setTyping(false);
    setTerminalInput(terminalCmds[activeQuestion.id] ?? "");
  }, [activeQuestion, terminalCmds]);

  const [packetIndex, setPacketIndex] = useState(0);
  const [packetT, setPacketT] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPacketT((t) => {
        const next = t + 0.04;
        if (next >= 1) {
          setPacketIndex((idx) => (idx + 1) % topo.links.length);
          return 0;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(id);
  }, [topo.links.length]);

  const activeLink = topo.links[packetIndex];
  const fromPos = activeLink ? layout[activeLink.from] : null;
  const toPos = activeLink ? layout[activeLink.to] : null;
  const packetX = fromPos && toPos ? fromPos.x + (toPos.x - fromPos.x) * packetT : 0;
  const packetY = fromPos && toPos ? fromPos.y + (toPos.y - fromPos.y) * packetT : 0;

  const allAnswered = useMemo(
    () => questions.every((q) => typeof answers[q.id] === "number"),
    [answers, questions]
  );

  useEffect(() => {
    if (!allAnswered || submittedRef.current) return;
    submittedRef.current = true;

    let diem = 0;
    const sai: string[] = [];
    questions.forEach((q, idx) => {
      const ans = answers[q.id];
      if (ans === q.answer) {
        diem += 1;
      } else {
        sai.push(`Câu ${idx + 1}: ${q.text}`);
      }
    });

    const diemToiDa = questions.length;
    const pass = diemToiDa === 0 ? false : diem / diemToiDa >= 0.6;
    const elapsedMs = Math.max(0, Date.now() - startedAt);
    const minutes = Math.floor(elapsedMs / 60000);
    const seconds = Math.floor((elapsedMs % 60000) / 1000);
    const thoiGian = `${minutes}m ${String(seconds).padStart(2, "0")}s`;

    const payload = {
      phongId,
      diem,
      diemToiDa,
      pass,
      sai,
      thoiGian,
    };

    localStorage.setItem(keyKetQua(phongId), JSON.stringify(payload));
    router.push(`/user/${phongId}/ket-thuc`);
  }, [allAnswered, answers, phongId, questions, router, startedAt]);

  return (
    <main className="min-h-screen bg-[#efeff3] p-4 sm:p-6">
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href={`/user/${phongId}`}
            className="rounded-lg border border-slate-400 bg-white px-3 py-1.5 text-sm font-semibold text-slate-800 shadow-sm"
          >
            ← Quay lại
          </Link>
          <div className="text-xs text-slate-500">Phòng #{phongId}</div>
        </div>

        <section className="rounded-xl border border-slate-400 bg-white px-6 py-5 shadow-md">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-lg font-semibold text-slate-800 title-scan">{activeQuestion.contextTitle}</div>
              <p className="mt-2 text-sm text-slate-600">{activeQuestion.contextText}</p>
            </div>
            <div className="flex gap-2">
              {questions.map((q, idx) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setQuestionIndex(idx)}
                  className={[
                    "rounded-lg border px-3 py-1.5 text-xs font-semibold",
                    idx === questionIndex
                      ? "border-slate-400 bg-slate-900 text-white"
                      : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                  ].join(" ")}
                >
                  Câu hỏi {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {activeQuestion.type === "mail" ? (
            <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-sm font-semibold text-slate-800">Hộp thư đến</div>
                <div className="flex items-center gap-2">
                  {!openedMailApp ? (
                    <button
                      type="button"
                      onClick={() => setOpenedMailApp(true)}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                        <path d="M2.5 6.5L12 12l9.5-5.5" fill="none" stroke="#EA4335" strokeWidth="2" strokeLinejoin="round" />
                        <path d="M3 7v10.5c0 .8.7 1.5 1.5 1.5h15c.8 0 1.5-.7 1.5-1.5V7" fill="none" stroke="#4285F4" strokeWidth="2" />
                        <path d="M3.5 18.5l6.8-6" fill="none" stroke="#34A853" strokeWidth="2" />
                        <path d="M20.5 18.5l-6.8-6" fill="none" stroke="#FBBC05" strokeWidth="2" />
                      </svg>
                      Mở Gmail
                    </button>
                  ) : null}
                  {picked === null ? (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      Chưa trả lời
                    </span>
                  ) : moThu ? (
                    <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                      Đang mở
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
                      Đã đóng
                    </span>
                  )}
                </div>
              </div>

              {!openedMailApp ? (
                <div className="mt-3 rounded-lg border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs text-slate-500">
                  Chưa mở ứng dụng Gmail. Bấm “Mở Gmail” để xem hộp thư.
                </div>
              ) : (
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1.6fr]">
                  <div className="rounded-lg border border-slate-300 bg-white shadow-sm">
                    {mailList.map((mail) => {
                      const active = mail.id === selectedMailId;
                      return (
                        <button
                          key={mail.id}
                          type="button"
                          onClick={() => setSelectedMailId(mail.id)}
                          className={[
                            "w-full border-b border-slate-100 px-3 py-2 text-left text-xs transition",
                            active ? "bg-sky-50" : "hover:bg-slate-50",
                          ].join(" ")}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-800">{mail.from}</span>
                            <span className="text-[10px] text-slate-400">{mail.time}</span>
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-700">{mail.subject}</div>
                          <div className="mt-1 text-[11px] text-slate-500">{mail.snippet}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-700 shadow-sm">
                    {!moThu ? (
                      <div className="flex h-full items-center justify-center text-xs text-slate-500">
                        (Email không được mở)
                      </div>
                    ) : (
                      <>
                        <div className="text-xs text-slate-500">Từ: {selectedMail.from}</div>
                        <div className="mt-1 text-base font-semibold text-slate-800">{selectedMail.subject}</div>
                        <div className="mt-2 text-xs text-slate-600">
                          Đính kèm: {selectedMail.attachment ?? "Không có"}
                        </div>
                        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {selectedMail.snippet}
                        </div>
                        {selectedMail.hasMalware ? (
                          <div className="mt-3 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs text-orange-700">
                            Cảnh báo: File đính kèm có dấu hiệu chứa mã độc.
                          </div>
                        ) : null}
                        {selectedMail.hasMalware && malwareActive ? (
                          <div className="mt-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                            Đã mở email nghi ngờ — nguy cơ lây nhiễm vào hệ thống.
                          </div>
                        ) : null}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4 shadow-sm">
              <div className="text-sm font-semibold text-slate-800">Terminal</div>
              <div className="mt-3 rounded-lg border border-slate-300 bg-slate-900 p-3 text-xs text-slate-200">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span className="h-2 w-2 rounded-full bg-amber-400" />
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="ml-2">gateway@lab</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-emerald-400">$</span>
                  <input
                    value={terminalInput}
                    readOnly
                    className="flex-1 bg-transparent text-slate-200 outline-none"
                  />
                  <span className={`h-4 w-px ${typing ? "bg-slate-200 animate-pulse" : "bg-slate-500"}`} />
                </div>
                {picked !== null ? (
                  malwareActive ? (
                    <div className="mt-3 rounded-md border border-rose-500/40 bg-rose-500/10 px-2 py-1 text-rose-200">
                      Cảnh báo: Lệnh sai, hệ thống bị khai thác thêm.
                    </div>
                  ) : (
                    <div className="mt-3 rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2 py-1 text-emerald-200">
                      Đã chặn kết nối thành công.
                    </div>
                  )
                ) : (
                  <div className="mt-3 text-slate-400">Nhập lệnh vào ô phía dưới.</div>
                )}
              </div>
            </div>
          )}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-xl border border-slate-400 bg-white shadow-md">
            <div className="border-b border-slate-200 px-5 py-4">
              <div className="text-sm font-semibold text-slate-700">Câu hỏi:</div>
              <div className="mt-1 text-base text-slate-900">{activeQuestion.text}</div>
            </div>

            <div className="px-5 py-4">
              <div className="text-sm font-semibold text-slate-700">Trả lời:</div>
              {activeQuestion.type === "terminal" ? (
                <>
                  <div className="mt-3">
                    <input
                      value={terminalDraft}
                      onChange={(e) =>
                        setTerminalDrafts((cur) => ({
                          ...cur,
                          [activeQuestion.id]: e.target.value,
                        }))
                      }
                      placeholder="Nhập lệnh..."
                      className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-300"
                    />
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={!terminalDraft.trim() || daNop}
                      onClick={() => {
                        const cmd = terminalDraft.trim();
                        if (!cmd || !phongId) return;
                        const normalized = cmd.replace(/^[A-D]\.\s*/, "");
                        const idx = activeQuestion.options.findIndex(
                          (opt) => opt.replace(/^[A-D]\.\s*/, "") === normalized
                        );
                        const mappedIndex = idx >= 0 ? idx : -1;
                        const tenNguoiChoi = docTenNguoiChoi(phongId);
                        ghiSuKien(phongId, `${tenNguoiChoi} đã chọn lệnh: ${cmd}.`);
                        if (mappedIndex === activeQuestion.malwareTriggerIndex) {
                          const dsNhiem = topo.nodes.filter((n) => n.infected).map((n) => n.label);
                          if (dsNhiem.length > 0) {
                            ghiSuKien(phongId, `Thiết bị nhiễm mã độc: ${dsNhiem.join(", ")}.`);
                          }
                        }
                        setTerminalCmds((cur) => ({
                          ...cur,
                          [activeQuestion.id]: cmd,
                        }));
                        setTerminalInput(cmd);
                        setAnswers((cur) => ({
                          ...cur,
                          [activeQuestion.id]: mappedIndex,
                        }));
                      }}
                      className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                        !terminalDraft.trim() || daNop
                          ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                          : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {daNop ? "Đã nộp" : "Nộp lệnh"}
                    </button>
                    <div className="text-sm text-slate-700">
                      Lệnh đã nộp:{" "}
                      <span className="font-semibold">{terminalCmd || "—"}</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="mt-3 space-y-3">
                    {activeQuestion.options.map((opt, idx) => {
                      const active = draft === idx;
                      return (
                        <button
                          key={opt}
                          type="button"
                          disabled={daNop}
                          onClick={() =>
                            setDrafts((cur) => ({
                              ...cur,
                              [activeQuestion.id]: idx,
                            }))
                          }
                          className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition ${
                            active
                              ? "border-sky-300 bg-sky-50 text-slate-900"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300"
                          } ${daNop ? "cursor-not-allowed opacity-60" : ""}`}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      disabled={draft === null || daNop}
                      onClick={() => {
                        if (draft === null) return;
                        if (!phongId) return;
                        const tenNguoiChoi = docTenNguoiChoi(phongId);
                        const kyTu = String.fromCharCode(65 + draft);
                        const luaChon = activeQuestion.options[draft] ?? `Đáp án ${kyTu}`;
                        ghiSuKien(
                          phongId,
                          `${tenNguoiChoi} đã chọn ${kyTu} (${luaChon}).`
                        );
                        if (activeQuestion.malwareTriggerIndex === draft) {
                          const dsNhiem = topo.nodes.filter((n) => n.infected).map((n) => n.label);
                          if (dsNhiem.length > 0) {
                            ghiSuKien(phongId, `Thiết bị nhiễm mã độc: ${dsNhiem.join(", ")}.`);
                          }
                        }
                        setAnswers((cur) => ({
                          ...cur,
                          [activeQuestion.id]: draft,
                        }));
                      }}
                      className={`h-10 rounded-lg px-4 text-sm font-semibold transition ${
                        draft === null || daNop
                          ? "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"
                          : "border border-slate-900 bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {daNop ? "Đã nộp" : "Nộp câu trả lời"}
                    </button>
                    <div className="text-sm text-slate-700">
                      Đáp án đã nộp:{" "}
                      <span className="font-semibold">
                        {picked === null ? "—" : String.fromCharCode(65 + picked)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-4 text-xs text-slate-400">{activeQuestion.note}</div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-400 bg-white p-4 shadow-md">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Sơ đồ mạng (Packet Tracer)</div>
              <span
                className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${
                  malwareActive
                    ? "bg-orange-50 text-orange-700 ring-orange-200"
                    : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                }`}
              >
                {malwareActive ? "Có mã độc" : "Bình thường"}
              </span>
            </div>
            <div className="h-full min-h-[280px] rounded-lg border border-slate-300 bg-gradient-to-br from-slate-50 to-slate-100 p-3 shadow-sm">
              <svg viewBox="0 0 420 240" className="h-full w-full">
                {topo.links.map((link) => {
                  const from = layout[link.from];
                  const to = layout[link.to];
                  if (!from || !to) return null;
                  const fromNode = topo.nodes.find((n) => n.id === link.from);
                  const toNode = topo.nodes.find((n) => n.id === link.to);
                  const nhiem = Boolean(fromNode?.infected || toNode?.infected);
                  return (
                    <path
                      key={link.id}
                      d={`M${from.x} ${from.y} L${to.x} ${to.y}`}
                      stroke={nhiem ? "#f97316" : link.up ? "#10b981" : "#f43f5e"}
                      strokeWidth="2"
                    />
                  );
                })}

                {fromPos && toPos ? (
                  <circle cx={packetX} cy={packetY} r="4" fill={malwareActive ? "#f97316" : "#0ea5e9"} />
                ) : null}

                {topo.nodes.map((node) => {
                  const pos = layout[node.id];
                  if (!pos) return null;
                  const colors = nodeColor(node);
                  return (
                    <g key={node.id} transform={`translate(${pos.x}, ${pos.y})`}>
                      {node.type === "router" ? (
                        <g>
                          <circle cx="0" cy="0" r="16" fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
                          <path d="M-7 0h14M0-7v14" stroke={colors.stroke} strokeWidth="2" />
                        </g>
                      ) : node.type === "switch" ? (
                        <g>
                          <rect x="-18" y="-12" width="36" height="24" rx="6" fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
                          <circle cx="-8" cy="2" r="2" fill={colors.stroke} />
                          <circle cx="0" cy="2" r="2" fill={colors.stroke} />
                          <circle cx="8" cy="2" r="2" fill={colors.stroke} />
                        </g>
                      ) : (
                        <g>
                          <rect x="-16" y="-12" width="32" height="20" rx="4" fill={colors.fill} stroke={colors.stroke} strokeWidth="2" />
                          <rect x="-6" y="10" width="12" height="4" rx="2" fill={colors.stroke} />
                        </g>
                      )}
                      <text x="0" y="28" textAnchor="middle" fontSize="10" fill="#0f172a">
                        {node.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                Bình thường
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                Nhiễm mã độc
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                Mất kết nối
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
