// app/page.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type NguoiChoi = {
  id: string;
  ten: string;
  vaiTro: string;
  phongBan: string;
  ghiChu: string;
  trangThai: "Sẵn sàng" | "Bận" | "Đã mời" | "Từ chối";
  mau: "emerald" | "rose" | "blue" | "amber";
};

type NhanVat = {
  id: string;
  ten: string;
  vaiTro: string;
  moTa: string;
  mucDo: "Nội bộ" | "Đối tác" | "Đối thủ";
  mau: "emerald" | "rose" | "blue" | "amber";
  batBuoc?: boolean;
  optional?: boolean;
};

type TinhHuong = {
  tieuDe: string;
  moTa: string;
  goiY: string;
};

type KichBan = {
  ten: string;
  tomTat: string;
  mucTieu: string[];
  tags: string[];
  tinhHuong: TinhHuong[];
};

type ThongBao = {
  id: string;
  tieuDe: string;
  noiDung: string;
  loai: "thanh-cong" | "tu-choi" | "thong-tin";
};

type EventLog = {
  thoiGian: string;
  noiDung: string;
};

type HieuUng = {
  id: string;
  loai: "moi" | "tu-choi" | "kick" | "drop";
};

const DS_NGUOI_CHOI: NguoiChoi[] = [
  {
    id: "a",
    ten: "Khánh An",
    vaiTro: "Blue Team Analyst",
    phongBan: "SOC",
    ghiChu: "Giỏi đọc log, phản ứng nhanh với cảnh báo giả mạo.",
    trangThai: "Sẵn sàng",
    mau: "emerald",
  },
  {
    id: "b",
    ten: "Minh Triết",
    vaiTro: "Incident Lead",
    phongBan: "IRT",
    ghiChu: "Có kinh nghiệm điều phối xử lý sự cố nhiều bước.",
    trangThai: "Đã mời",
    mau: "blue",
  },
  {
    id: "c",
    ten: "Hà My",
    vaiTro: "Forensics",
    phongBan: "Lab",
    ghiChu: "Phân tích artifact, xác thực chuỗi sự kiện.",
    trangThai: "Sẵn sàng",
    mau: "amber",
  },
  {
    id: "d",
    ten: "Đức Huy",
    vaiTro: "Network Engineer",
    phongBan: "Hạ tầng",
    ghiChu: "Kiểm soát segmentation, khoanh vùng thiết bị nghi vấn.",
    trangThai: "Bận",
    mau: "rose",
  },
  {
    id: "e",
    ten: "Thanh Tùng",
    vaiTro: "Threat Hunter",
    phongBan: "SOC",
    ghiChu: "Săn IOC, kiểm tra log bất thường theo mô hình săn tìm.",
    trangThai: "Sẵn sàng",
    mau: "emerald",
  },
  {
    id: "f",
    ten: "Mai Phương",
    vaiTro: "Malware Analyst",
    phongBan: "Lab",
    ghiChu: "Phân tích mẫu mã độc, tách hành vi theo chuỗi.",
    trangThai: "Sẵn sàng",
    mau: "blue",
  },
  {
    id: "g",
    ten: "Quang Huy",
    vaiTro: "SIEM Engineer",
    phongBan: "Hạ tầng",
    ghiChu: "Tối ưu rule cảnh báo, tune false positive.",
    trangThai: "Đã mời",
    mau: "amber",
  },
  {
    id: "h",
    ten: "Bích Ngọc",
    vaiTro: "Security GRC",
    phongBan: "Compliance",
    ghiChu: "Kiểm soát quy trình, đối soát yêu cầu tuân thủ.",
    trangThai: "Sẵn sàng",
    mau: "rose",
  },
  {
    id: "i",
    ten: "Văn Long",
    vaiTro: "SOC L1",
    phongBan: "SOC",
    ghiChu: "Theo dõi alert và xử lý playbook cơ bản.",
    trangThai: "Sẵn sàng",
    mau: "emerald",
  },
  {
    id: "j",
    ten: "Yến Nhi",
    vaiTro: "Blue Team Lead",
    phongBan: "IRT",
    ghiChu: "Điều phối phản ứng sự cố và báo cáo.",
    trangThai: "Đã mời",
    mau: "blue",
  },
];

const DS_NHAN_VAT_CHINH: NhanVat[] = [
  {
    id: "n1",
    ten: "Ngọc Trâm",
    vaiTro: "Trưởng phòng Kế toán",
    moTa: "Bị lộ tài khoản sau khi nhận email hóa đơn giả.",
    mucDo: "Nội bộ",
    mau: "emerald",
    batBuoc: true,
  },
  {
    id: "n2",
    ten: "Phòng IT Helpdesk",
    vaiTro: "Tuyến hỗ trợ",
    moTa: "Tiếp nhận yêu cầu khẩn, có thể kích hoạt quy trình reset.",
    mucDo: "Nội bộ",
    mau: "blue",
    batBuoc: true,
  },
  {
    id: "n3",
    ten: "Đối tác Logistics",
    vaiTro: "Bên thứ ba",
    moTa: "Cổng SFTP của đối tác có dấu hiệu truy cập bất thường.",
    mucDo: "Đối tác",
    mau: "amber",
    batBuoc: true,
  },
];

const DS_NHAN_VAT_TAT_CA: NhanVat[] = [...DS_NHAN_VAT_CHINH];

const KICH_BAN: KichBan = {
  ten: "Kịch bản 1: Email giả mạo dẫn đến xâm nhập mạng nội bộ",
  tomTat:
    "Một email hóa đơn giả được gửi tới bộ phận kế toán. Sau khi mở file đính kèm, tài khoản người dùng bị chiếm quyền và hệ thống phát hiện lưu lượng bất thường tới máy chủ tệp nội bộ.",
  mucTieu: [
    "Xác định điểm xâm nhập ban đầu và phạm vi ảnh hưởng",
    "Khoanh vùng máy trạm nghi vấn trong 30 phút",
    "Khôi phục truy cập an toàn và cập nhật IOC",
  ],
  tags: ["Phishing", "Lateral Movement", "Log Analysis", "Containment"],
  tinhHuong: [
    {
      tieuDe: "Cảnh báo từ EDR",
      moTa: "EDR báo phát hiện tiến trình lạ tạo kết nối outbound liên tục từ máy PC-ACCT-17.",
      goiY: "Xác minh hash, đối chiếu lịch sử email và chặn tiến trình nghi vấn.",
    },
    {
      tieuDe: "Tài khoản bị đăng nhập bất thường",
      moTa: "Tài khoản của Ngọc Trâm đăng nhập từ địa chỉ IP ngoài văn phòng lúc 02:14.",
      goiY: "Khóa tài khoản tạm thời, kiểm tra MFA và log VPN.",
    },
    {
      tieuDe: "Lưu lượng SMB tăng đột biến",
      moTa: "Máy chủ file ghi nhận truy cập hàng loạt vào thư mục dự án quan trọng.",
      goiY: "Bật chế độ read-only, thu thập log truy cập và cô lập máy trạm liên quan.",
    },
    {
      tieuDe: "Trao đổi với đối tác",
      moTa: "Đối tác Logistics báo không truy cập được SFTP sau khi SOC chặn IP.",
      goiY: "Xác minh IP đối tác, lập whitelist tạm thời theo SOP.",
    },
  ],
};

function LopVienTheoMau(mau: NguoiChoi["mau"]) {
  switch (mau) {
    case "emerald":
      return "border-emerald-200/70";
    case "rose":
      return "border-rose-200/70";
    case "blue":
      return "border-blue-200/70";
    case "amber":
      return "border-amber-200/70";
  }
}

function LopNenTheoMau(mau: NguoiChoi["mau"]) {
  switch (mau) {
    case "emerald":
      return "bg-emerald-500";
    case "rose":
      return "bg-rose-500";
    case "blue":
      return "bg-blue-500";
    case "amber":
      return "bg-amber-400 text-slate-900";
  }
}

function MauTheoMucDo(mucDo: NhanVat["mucDo"]) {
  switch (mucDo) {
    case "Nội bộ":
      return "bg-slate-100 text-slate-700 ring-slate-200";
    case "Đối tác":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "Đối thủ":
      return "bg-rose-50 text-rose-700 ring-rose-200";
  }
}

function MauNenNhanVat(mau: NhanVat["mau"]) {
  switch (mau) {
    case "emerald":
      return "from-emerald-500 to-emerald-400";
    case "rose":
      return "from-rose-500 to-rose-400";
    case "blue":
      return "from-blue-500 to-blue-400";
    case "amber":
      return "from-amber-400 to-amber-300 text-slate-900";
  }
}

function LayVietTat(ten: string) {
  return ten
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((tu) => tu[0]?.toUpperCase())
    .join("");
}

function HuyHieuTrangThai({
  trangThai,
  nhan,
}: {
  trangThai: NguoiChoi["trangThai"];
  nhan?: string;
}) {
  const nhanHienThi = nhan ?? trangThai;
  const cls =
    trangThai === "Sẵn sàng"
      ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
      : trangThai === "Bận"
      ? "bg-amber-50 text-amber-700 ring-amber-200"
      : trangThai === "Từ chối"
      ? "bg-rose-50 text-rose-700 ring-rose-200"
      : "bg-blue-50 text-blue-700 ring-blue-200";

  return (
    <span className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${cls}`}>
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          trangThai === "Sẵn sàng"
            ? "bg-emerald-500"
            : trangThai === "Bận"
            ? "bg-amber-500"
            : trangThai === "Từ chối"
            ? "bg-rose-500"
            : "bg-blue-500"
        }`}
      />
      {nhanHienThi}
    </span>
  );
}

function NutMoi({
  trangThai,
  onClick,
}: {
  trangThai: NguoiChoi["trangThai"];
  onClick?: () => void;
}) {
  const laSanSang = trangThai === "Sẵn sàng";
  const daMoi = trangThai === "Đã mời";
  const nhan = daMoi ? "Đã mời" : trangThai === "Bận" ? "Đang bận" : "Mời";

  return (
    <button
      type="button"
      disabled={!laSanSang}
      onClick={onClick}
      className={[
        "rounded-full px-3 py-1 text-xs font-semibold transition",
        "ring-1 ring-inset ring-slate-200/70",
        laSanSang
          ? "bg-slate-900 text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
          : "bg-slate-100 text-slate-400 cursor-not-allowed",
      ].join(" ")}
    >
      {nhan}
    </button>
  );
}

function The({ tieuDe, children, className = "" }: { tieuDe?: string; children: React.ReactNode; className?: string }) {
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

export default function Page() {
  const router = useRouter();
  const sp = useSearchParams();
  const phongId = sp.get("phong") ?? "1";
  const laAdmin = true;
  const roleMacDinh = DS_NHAN_VAT_CHINH[0]?.id ?? null;

  const [kichBan, setKichBan] = useState<KichBan>(KICH_BAN);
  const [nguoiChoi, setNguoiChoi] = useState<NguoiChoi[]>(DS_NGUOI_CHOI);
  const [phanCong, setPhanCong] = useState<Record<string, string | null>>(
    Object.fromEntries(DS_NHAN_VAT_TAT_CA.map((nv) => [nv.id, null]))
  );
  const [yeuCauMoi, setYeuCauMoi] = useState<Record<string, string | null>>(
    Object.fromEntries(DS_NHAN_VAT_TAT_CA.map((nv) => [nv.id, null]))
  );
  const [dangKeo, setDangKeo] = useState<string | null>(null);
  const [roleDangHover, setRoleDangHover] = useState<string | null>(null);
  const [thoiGianPhut, setThoiGianPhut] = useState(15);
  const [thongBao, setThongBao] = useState<ThongBao[]>([]);
  const [eventLog, setEventLog] = useState<EventLog[]>([]);
  const [cooldownMoi, setCooldownMoi] = useState<Record<string, number>>({});
  const [nowMs, setNowMs] = useState(Date.now());
  const [hieuUngNguoiChoi, setHieuUngNguoiChoi] = useState<HieuUng | null>(null);
  const [hieuUngRole, setHieuUngRole] = useState<HieuUng | null>(null);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(`mmhcs:phong:${phongId}:kich-ban`);
    let next = KICH_BAN;
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<KichBan>;
        if (parsed?.ten) {
          next = {
            ...KICH_BAN,
            ...parsed,
            mucTieu: Array.isArray(parsed.mucTieu) ? parsed.mucTieu : KICH_BAN.mucTieu,
            tags: Array.isArray(parsed.tags) ? parsed.tags : KICH_BAN.tags,
            tinhHuong: Array.isArray(parsed.tinhHuong) ? parsed.tinhHuong : KICH_BAN.tinhHuong,
          };
        }
      } catch {
        // ignore invalid payload
      }
    }
    setKichBan(next);
    localStorage.setItem("mmhcs:kich-ban:selected", JSON.stringify(next));
    localStorage.setItem("mmhcs:friends", JSON.stringify(DS_NGUOI_CHOI));
    localStorage.setItem("mmhcs:characters", JSON.stringify(DS_NHAN_VAT_TAT_CA));
  }, [phongId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("mmhcs:phanCong", JSON.stringify(phanCong));
  }, [phanCong]);

  useEffect(() => {
    const t = setInterval(() => setNowMs(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  const banDoNguoiChoi = useMemo(() => {
    return Object.fromEntries(nguoiChoi.map((p) => [p.id, p]));
  }, [nguoiChoi]);

  const nguoiChoiTrongPhong = useMemo(() => {
    return nguoiChoi.filter((p) => p.trangThai === "Đã mời");
  }, [nguoiChoi]);

  const vaiTroTheoNguoiChoi = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(phanCong).forEach(([roleId, playerId]) => {
      if (!playerId) return;
      const role = DS_NHAN_VAT_TAT_CA.find((nv) => nv.id === roleId);
      if (role) {
        map[playerId] = role.vaiTro;
      }
    });
    return map;
  }, [phanCong]);

  const yeuCauTheoNguoiChoi = useMemo(() => {
    const map: Record<string, string> = {};
    Object.entries(yeuCauMoi).forEach(([roleId, playerId]) => {
      if (playerId) {
        map[playerId] = roleId;
      }
    });
    return map;
  }, [yeuCauMoi]);

  const themThongBao = (tieuDe: string, noiDung: string, loai: ThongBao["loai"]) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const now = new Date();
    const thoiGian = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(
      now.getSeconds()
    ).padStart(2, "0")}`;
    setThongBao((ds) => [{ id, tieuDe, noiDung, loai }, ...ds].slice(0, 4));
    setEventLog((ds) => [{ thoiGian, noiDung: `${tieuDe}: ${noiDung}` }, ...ds].slice(0, 80));
    setTimeout(() => {
      setThongBao((ds) => ds.filter((tb) => tb.id !== id));
    }, 3500);
  };

  const phatAmThanh = (loai: HieuUng["loai"]) => {
    if (typeof window === "undefined") return;
    const ctx = audioRef.current ?? new AudioContext();
    audioRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const now = ctx.currentTime;

    const tanSo =
      loai === "moi" ? 720 : loai === "drop" ? 640 : loai === "kick" ? 360 : 260;

    osc.type = "sine";
    osc.frequency.setValueAtTime(tanSo, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.28);
  };

  const batHieuUngNguoiChoi = (id: string, loai: HieuUng["loai"]) => {
    setHieuUngNguoiChoi({ id, loai });
    setTimeout(() => setHieuUngNguoiChoi((h) => (h?.id === id ? null : h)), 700);
  };

  const batHieuUngRole = (id: string, loai: HieuUng["loai"]) => {
    setHieuUngRole({ id, loai });
    setTimeout(() => setHieuUngRole((h) => (h?.id === id ? null : h)), 700);
  };

  const capNhatPhanCong = (roleId: string, playerId: string | null) => {
    if (!roleId) return;
    setPhanCong((cu) => {
      const moi = { ...cu };
      Object.keys(moi).forEach((rid) => {
        if (playerId && moi[rid] === playerId) {
          moi[rid] = null;
        }
      });
      moi[roleId] = playerId;
      return moi;
    });

    if (playerId) {
      setNguoiChoi((ds) => ds.map((p) => (p.id === playerId ? { ...p, trangThai: "Đã mời" } : p)));
      batHieuUngNguoiChoi(playerId, "drop");
      batHieuUngRole(roleId, "drop");
      phatAmThanh("drop");
    }
  };

  const guiYeuCauMoi = (roleId: string, playerId: string) => {
    if (!roleId || !playerId) return;
    if (phanCong[roleId]) {
      themThongBao(
        "Vai trò đã có người",
        "Hãy kick hoặc đổi vai trước khi gửi yêu cầu mới.",
        "thong-tin"
      );
      return;
    }

    const nguoi = nguoiChoi.find((p) => p.id === playerId);
    if (nguoi?.trangThai === "Bận") {
      themThongBao("Người chơi đang bận", `${nguoi.ten} đang bận, không thể mời vào vai này.`, "thong-tin");
      return;
    }
    const now = Date.now();
    if ((cooldownMoi[playerId] ?? 0) > now) {
      const con = Math.ceil(((cooldownMoi[playerId] ?? 0) - now) / 1000);
      themThongBao("Chờ mời lại", `Vui lòng chờ ${con}s để mời lại ${nguoi?.ten ?? "người chơi"}.`, "thong-tin");
      return;
    }
    setCooldownMoi((cu) => ({ ...cu, [playerId]: now + 5000 }));

    setYeuCauMoi((cu) => {
      const moi = { ...cu };
      Object.keys(moi).forEach((rid) => {
        if (moi[rid] === playerId) {
          moi[rid] = null;
        }
      });
      moi[roleId] = playerId;
      return moi;
    });

    if (nguoi?.trangThai === "Từ chối") {
      setNguoiChoi((ds) => ds.map((p) => (p.id === playerId ? { ...p, trangThai: "Sẵn sàng" } : p)));
    }

    batHieuUngRole(roleId, "moi");
    phatAmThanh("moi");
  };

  const duyetYeuCau = (roleId: string) => {
    const playerId = yeuCauMoi[roleId];
    if (!playerId) return;
    const nguoi = nguoiChoi.find((p) => p.id === playerId);
    const role = DS_NHAN_VAT_TAT_CA.find((nv) => nv.id === roleId);

    setYeuCauMoi((cu) => ({ ...cu, [roleId]: null }));
    capNhatPhanCong(roleId, playerId);

    if (nguoi && role) {
      themThongBao(
        "Đã chấp nhận yêu cầu",
        `${nguoi.ten} đã vào vai ${role.vaiTro}.`,
        "thanh-cong"
      );
    }
  };

  const tuChoiYeuCau = (roleId: string) => {
    const playerId = yeuCauMoi[roleId];
    if (!playerId) return;
    const nguoi = nguoiChoi.find((p) => p.id === playerId);
    const role = DS_NHAN_VAT_TAT_CA.find((nv) => nv.id === roleId);

    setYeuCauMoi((cu) => ({ ...cu, [roleId]: null }));
    setNguoiChoi((ds) => ds.map((p) => (p.id === playerId ? { ...p, trangThai: "Từ chối" } : p)));

    if (nguoi && role) {
      themThongBao(
        "Từ chối yêu cầu",
        `${nguoi.ten} không được gán vào vai ${role.vaiTro}.`,
        "tu-choi"
      );
    }
    batHieuUngNguoiChoi(playerId, "tu-choi");
    batHieuUngRole(roleId, "tu-choi");
    phatAmThanh("tu-choi");
  };

  const hoanDoiVaiTro = (roleA: string, roleB: string) => {
    if (!roleA || !roleB || roleA === roleB) return;
    setPhanCong((cu) => {
      const moi = { ...cu };
      const tmp = moi[roleA] ?? null;
      moi[roleA] = moi[roleB] ?? null;
      moi[roleB] = tmp;
      return moi;
    });
    batHieuUngRole(roleA, "drop");
    batHieuUngRole(roleB, "drop");
    phatAmThanh("drop");
  };

  const kickKhoiPhong = (roleId: string) => {
    const playerId = phanCong[roleId];
    if (!playerId) return;
    const nguoi = nguoiChoi.find((p) => p.id === playerId);

    setPhanCong((cu) => ({ ...cu, [roleId]: null }));
    setNguoiChoi((ds) => ds.map((p) => (p.id === playerId ? { ...p, trangThai: "Sẵn sàng" } : p)));

    if (nguoi) {
      themThongBao(
        "Đã kick khỏi phòng",
        `${nguoi.ten} đã rời phòng. Vai trò trở về mặc định.`,
        "thong-tin"
      );
    }
    phatAmThanh("kick");
    batHieuUngNguoiChoi(playerId, "kick");
    batHieuUngRole(roleId, "kick");
  };

  const thoiGianHienThi = `00:${String(thoiGianPhut).padStart(2, "0")}:00`;
  const duRole = useMemo(() => {
    return DS_NHAN_VAT_CHINH.every((nv) => {
      const playerId = phanCong[nv.id];
      if (!playerId) return false;
      const player = banDoNguoiChoi[playerId];
      return player?.trangThai === "Đã mời";
    });
  }, [phanCong, banDoNguoiChoi]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#f8fafc,_#eef2f7_55%,_#e2e8f0)] p-4 sm:p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(248,113,113,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(rgba(148,163,184,0.25)_1px,transparent_1px)] [background-size:18px_18px]" />

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

      <div className="relative mx-auto w-full max-w-7xl">
        {/* Header */}
        <div className="mb-4 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200/70">
              MMHCS • Phòng diễn tập an ninh mạng
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl title-scan">
              Bảng điều khiển luyện tập
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Chọn kịch bản, mời người chơi và theo dõi các tình huống mô phỏng theo thời gian thực.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/admin/phong/${phongId}`)}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              Vào chơi
            </button>
            <button
              onClick={() => router.push("/")}
              className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md active:translate-y-0 active:scale-[0.98]"
            >
              Thoát
            </button>
            <div className="relative group">
              <button
                disabled={!duRole}
                onClick={() => {
                  if (!duRole) return;
                  router.push("/admin/phong/1");
                }}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition",
                  duRole
                    ? "bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                    : "cursor-not-allowed bg-slate-200 text-slate-500",
                ].join(" ")}
              >
                Bắt đầu phiên
              </button>
              {!duRole ? (
                <div className="pointer-events-none absolute right-0 top-full mt-2 w-56 rounded-lg bg-slate-900/90 px-3 py-2 text-xs text-slate-200 opacity-0 shadow-lg ring-1 ring-slate-700/70 transition group-hover:opacity-100">
                  Chưa đủ người chơi, không thể bắt đầu phòng.
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Layout chính */}
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:gap-8">
          
          {/* Trung tâm */}
          <section className="space-y-4 lg:space-y-6">
            <The tieuDe="Kịch bản đã chọn">
              <div className="grid gap-4 md:grid-cols-[1fr_260px]">
                <div className="relative overflow-hidden rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-500 via-emerald-400 to-emerald-500 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10" />
                  <div className="absolute -left-16 -bottom-16 h-44 w-44 rounded-full bg-white/10" />
                  <div className="pointer-events-none absolute inset-0 opacity-35">
                    <svg viewBox="0 0 320 180" className="h-full w-full">
                      <defs>
                        <linearGradient id="grid" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
                        </linearGradient>
                      </defs>
                      <rect x="0" y="0" width="320" height="180" fill="url(#grid)" opacity="0.25" />
                      <g stroke="rgba(255,255,255,0.45)" strokeWidth="1">
                        <path d="M20 120 L90 60 L150 90 L210 40 L290 70" fill="none" />
                        <circle cx="90" cy="60" r="3" fill="rgba(255,255,255,0.8)" />
                        <circle cx="210" cy="40" r="3" fill="rgba(255,255,255,0.8)" />
                      </g>
                      <g stroke="rgba(255,255,255,0.35)" strokeWidth="1">
                        <rect x="28" y="24" width="46" height="32" rx="8" fill="none" />
                        <rect x="112" y="18" width="52" height="38" rx="10" fill="none" />
                        <rect x="208" y="24" width="46" height="32" rx="8" fill="none" />
                        <path d="M74 40h38M164 40h44" />
                      </g>
                    </svg>
                  </div>

                  <h2 className="text-lg font-bold text-white">{kichBan.ten}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/90">{kichBan.tomTat}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {kichBan.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 ring-1 ring-black/5 shadow-sm">
                  <div className="text-sm font-semibold text-slate-800">Thông tin nhanh</div>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Số người chơi</span>
                      <span className="text-sm font-semibold text-slate-900">{nguoiChoi.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Độ khó</span>
                      <span className="text-sm font-semibold text-slate-900">Trung bình</span>
                    </div>
                  </div>
                </div>
              </div>
            </The>

            <The tieuDe="Nhân vật trong cốt truyện">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {DS_NHAN_VAT_TAT_CA.map((nv) => {
                  const nguoiDuocMoi = phanCong[nv.id] ? banDoNguoiChoi[phanCong[nv.id] || ""] : null;
                  const hienThiTen = nguoiDuocMoi ? nguoiDuocMoi.ten : nv.ten;
                  const hienThiVaiTro = nv.vaiTro;
                  const hienThiMoTa = nguoiDuocMoi
                    ? `Đã phân công ${nguoiDuocMoi.ten} vào vai ${nv.vaiTro}.`
                    : nv.moTa;
                  const mauHienThi = nguoiDuocMoi ? nguoiDuocMoi.mau : nv.mau;
                  const hieuUngRoleDangChay = hieuUngRole?.id === nv.id ? hieuUngRole.loai : null;
                  const lopHieuUngRole =
                    hieuUngRoleDangChay === "moi"
                      ? "ring-2 ring-emerald-300 shadow-emerald-200/60 animate-pulse"
                      : hieuUngRoleDangChay === "tu-choi"
                      ? "ring-2 ring-rose-300 shadow-rose-200/60 animate-pulse"
                      : hieuUngRoleDangChay === "kick"
                      ? "ring-2 ring-amber-300 shadow-amber-200/60 animate-pulse"
                      : hieuUngRoleDangChay === "drop"
                      ? "ring-2 ring-indigo-300 shadow-indigo-200/60 animate-pulse"
                      : "";
                  const laOptional = nv.optional;
                  const yeuCauId = yeuCauMoi[nv.id];
                  const nguoiYeuCau = yeuCauId ? banDoNguoiChoi[yeuCauId] : null;

                  return (
                    <div
                      key={nv.id}
                      className={[
                        "group flex min-w-[340px] items-start justify-between gap-3 rounded-xl px-3 py-3",
                        laOptional
                          ? "border border-dashed border-slate-300 bg-white/70"
                          : "bg-slate-50 ring-1 ring-slate-200/70",
                        "transition hover:-translate-y-0.5 hover:shadow-md",
                        roleDangHover === nv.id ? "ring-2 ring-indigo-300 bg-indigo-50/50" : "",
                        lopHieuUngRole,
                      ].join(" ")}
                      draggable={laAdmin && !!nguoiDuocMoi}
                      onDragStart={(event) => {
                        if (!nguoiDuocMoi) return;
                        event.dataTransfer.setData("roleId", nv.id);
                        event.dataTransfer.setData("playerId", nguoiDuocMoi.id);
                        setDangKeo(nguoiDuocMoi.id);
                      }}
                      onDragOver={(event) => {
                        if (!laAdmin) return;
                        event.preventDefault();
                        setRoleDangHover(nv.id);
                      }}
                      onDragLeave={() => setRoleDangHover(null)}
                      onDrop={(event) => {
                        if (!laAdmin) return;
                        event.preventDefault();
                        const sourceRoleId = event.dataTransfer.getData("roleId");
                        const playerId =
                          event.dataTransfer.getData("playerId") ||
                          event.dataTransfer.getData("text/plain") ||
                          dangKeo;

                        if (sourceRoleId) {
                          hoanDoiVaiTro(sourceRoleId, nv.id);
                        } else if (playerId) {
                          guiYeuCauMoi(nv.id, playerId);
                        }
                        setDangKeo(null);
                        setRoleDangHover(null);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={[
                            "grid h-11 w-11 place-items-center rounded-2xl text-xs font-bold text-white shadow-sm",
                            "bg-gradient-to-br",
                            MauNenNhanVat(mauHienThi),
                          ].join(" ")}
                          aria-hidden="true"
                        >
                          {laOptional && !nguoiDuocMoi ? "+" : LayVietTat(hienThiTen)}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-slate-900">{hienThiTen}</div>
                          <div className="text-xs text-slate-500">{hienThiVaiTro}</div>
                          <p className="mt-1 text-xs text-slate-500">{hienThiMoTa}</p>
                          {nguoiDuocMoi ? (
                            <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                              Đã thay thế • {nv.ten}
                            </div>
                          ) : null}
                          {laAdmin && !nguoiDuocMoi && !nguoiYeuCau ? (
                            <div className="mt-2 text-[11px] text-slate-400">Thả người chơi để gửi lời mời</div>
                          ) : null}
                          {nguoiYeuCau ? (
                            <div className="mt-2 text-[11px] text-emerald-700">
                              Đã gửi lời mời cho {nguoiYeuCau.ten}.
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${MauTheoMucDo(
                          nv.mucDo
                        )}`}
                      >
                        {nv.mucDo}
                      </span>
                      {laAdmin && nguoiDuocMoi ? (
                        <button
                          type="button"
                          onClick={() => kickKhoiPhong(nv.id)}
                          className="ml-2 self-center rounded-full bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/70 opacity-0 transition hover:bg-rose-100 group-hover:opacity-100"
                        >
                          Kick
                        </button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </The>

            <The tieuDe="Người chơi có thể mời">
              <div className="flex gap-3 overflow-x-auto pb-2">
                {nguoiChoi.map((p) => {
                  const hieuUngDangChay = hieuUngNguoiChoi?.id === p.id ? hieuUngNguoiChoi.loai : null;
                  const trongPhong = Object.values(phanCong).includes(p.id);
                  const nhanTrangThai =
                    p.trangThai === "Đã mời" ? (trongPhong ? "Chung phòng" : "Đã mời") : p.trangThai;
                  const conLai = Math.max(0, (cooldownMoi[p.id] ?? 0) - nowMs);
                  const dangCooldown = conLai > 0;
                  const lopHieuUng =
                    hieuUngDangChay === "moi"
                      ? "ring-2 ring-emerald-300 shadow-emerald-200/60 animate-pulse"
                      : hieuUngDangChay === "tu-choi"
                      ? "ring-2 ring-rose-300 shadow-rose-200/60 animate-pulse"
                      : hieuUngDangChay === "kick"
                      ? "ring-2 ring-amber-300 shadow-amber-200/60 animate-pulse"
                      : hieuUngDangChay === "drop"
                      ? "ring-2 ring-indigo-300 shadow-indigo-200/60 animate-pulse"
                      : "";

                  return (
                    <div
                      key={p.id}
                      className={[
                        "group flex min-w-[340px] items-start justify-between gap-3 rounded-xl bg-slate-50 px-3 py-3",
                        "ring-1 ring-slate-200/70 transition hover:-translate-y-0.5 hover:shadow-md",
                        laAdmin && p.trangThai !== "Bận" ? "cursor-grab" : "",
                        lopHieuUng,
                      ].join(" ")}
                      draggable={laAdmin && p.trangThai !== "Bận"}
                      onDragStart={(event) => {
                        if (!laAdmin || p.trangThai === "Bận") return;
                        event.dataTransfer.setData("playerId", p.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDangKeo(p.id);
                      }}
                      onDragEnd={() => setDangKeo(null)}
                    >
                      <div className="flex min-w-0 items-start gap-3">
                        <div className="relative">
                          <span
                            className={`grid h-10 w-10 place-items-center rounded-xl text-xs font-bold text-white ${LopNenTheoMau(
                              p.mau
                            )}`}
                          >
                            {p.id.toUpperCase()}
                          </span>
                          <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-white ring-1 ring-slate-200" />
                          <span
                            className={`absolute -bottom-1 -right-1 h-2 w-2 rounded-full ${
                              p.trangThai === "Sẵn sàng"
                                ? "bg-emerald-500"
                                : p.trangThai === "Bận"
                                ? "bg-amber-500"
                                : p.trangThai === "Từ chối"
                                ? "bg-rose-500"
                                : "bg-blue-500"
                            }`}
                          />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <div className="text-sm font-semibold leading-snug text-slate-900">{p.ten}</div>
                          <div className="text-xs leading-relaxed text-slate-600">
                            {p.vaiTro} • {p.phongBan}
                          </div>
                          <p className="text-xs leading-relaxed text-slate-600">{p.ghiChu}</p>
                          {vaiTroTheoNguoiChoi[p.id] ? (
                            <div className="mt-2 inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold leading-snug text-indigo-700 ring-1 ring-indigo-200/70">
                              Đang vào vai • {vaiTroTheoNguoiChoi[p.id]}
                            </div>
                          ) : null}
                          {yeuCauTheoNguoiChoi[p.id] ? (
                            <div className="mt-2 rounded-xl border border-emerald-200/70 bg-emerald-50/60 px-3 py-2 text-[11px] text-emerald-800">
                              <div className="text-[11px] font-semibold">Lời mời đang chờ phản hồi</div>
                              <div className="mt-1 text-[11px] text-emerald-700">
                                {p.ten} muốn vào vai{" "}
                                {DS_NHAN_VAT_TAT_CA.find((nv) => nv.id === yeuCauTheoNguoiChoi[p.id])?.vaiTro ??
                                  "vai trò này"}
                                .
                              </div>
                              <div className="mt-2 flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => duyetYeuCau(yeuCauTheoNguoiChoi[p.id])}
                                  className="rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-semibold text-white hover:bg-emerald-500"
                                >
                                  Đồng ý
                                </button>
                                <button
                                  type="button"
                                  onClick={() => tuChoiYeuCau(yeuCauTheoNguoiChoi[p.id])}
                                  className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-rose-700 ring-1 ring-rose-200/80 hover:bg-rose-50"
                                >
                                  Từ chối
                                </button>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <HuyHieuTrangThai trangThai={p.trangThai} nhan={nhanTrangThai} />
                        {dangCooldown ? (
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 ring-1 ring-slate-200">
                            Mời lại ({Math.ceil(conLai / 1000)}s)
                          </span>
                        ) : null}
                      </div>
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
                        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-slate-900/5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </The>

          </section>

          {/* Bên phải */}
          <aside className="space-y-4 lg:space-y-6 lg:sticky lg:top-6 lg:self-start">
            <The tieuDe="Điều khiển">
              <div className="grid gap-3">
                <div className="rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-slate-200/70">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">Thời gian</div>
                      <div className="text-xs text-slate-500">{thoiGianHienThi}</div>
                    </div>
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-rose-600 text-white ring-1 ring-black/10">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <circle cx="12" cy="12" r="8" />
                        <path d="M12 7v5l3 2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <div className="mt-3">
                    <input
                      type="range"
                      min={5}
                      max={90}
                      step={5}
                      value={thoiGianPhut}
                      onChange={(event) => setThoiGianPhut(Number(event.target.value))}
                      className="w-full accent-rose-600"
                    />
                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>05 phút</span>
                      <span>90 phút</span>
                    </div>
                  </div>
                </div>

                <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50 active:scale-[0.99]">
                  Cài đặt kịch bản
                </button>
              </div>
            </The>

            <The tieuDe="Event log">
              <div className="max-h-[420px] space-y-2 overflow-auto">
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
          </aside>
        </div>
      </div>
    </main>
  );
}
