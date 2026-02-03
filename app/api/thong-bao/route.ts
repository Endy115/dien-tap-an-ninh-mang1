import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ThongBao = {
  id: string;
  type: "invite" | "system";
  title: string;
  body: string;
  time: string;
  read?: boolean;
  roomId?: string;
};

// In-memory demo store (non-persistent). Good enough for dev preview.
const STORE: ThongBao[] = [
  {
    id: "n1",
    type: "invite",
    title: "Mời vào phòng #1",
    body: "Admin đã mời bạn tham gia phòng diễn tập.",
    time: "Vừa xong",
    roomId: "1",
  },
  {
    id: "n2",
    type: "system",
    title: "Kịch bản mới",
    body: "Phishing Campaign đã được tạo, sẵn sàng tham gia.",
    time: "5 phút trước",
  },
  {
    id: "n3",
    type: "system",
    title: "Thông báo hệ thống",
    body: "Cập nhật chính sách ghi log đã hoàn tất.",
    time: "Hôm qua",
    read: true,
  },
];

export async function GET() {
  return NextResponse.json({ ok: true, items: STORE }, { status: 200 });
}
