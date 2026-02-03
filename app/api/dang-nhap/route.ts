import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Body = {
  username?: string;
  password?: string;
};

function taoTokenGiaLap(username: string, role: string) {
  // demo token, ban co the thay JWT sau
  return Buffer.from(`${username}:${role}:${Date.now()}`).toString("base64url");
}

export async function POST(req: Request) {
  const body = (await req.json()) as Body;
  const username = (body.username ?? "").trim();
  const password = (body.password ?? "").trim();

  if (!username || !password) {
    return NextResponse.json({ ok: false, message: "Thiếu thông tin đăng nhập." }, { status: 400 });
  }

  // Demo credential
  const isAdmin = username === "admin" && password === "admin123";
  const isUser = username === "user" && password === "user123";
  const hopLe = isAdmin || isUser;

  if (!hopLe) {
    return NextResponse.json({ ok: false, message: "Sai tài khoản hoặc mật khẩu." }, { status: 401 });
  }

  const role = isAdmin ? "admin" : "user";
  const token = taoTokenGiaLap(username, role);

  const res = NextResponse.json({ ok: true, role }, { status: 200 });

  // Cookie HttpOnly: bao mat hon localStorage
  res.cookies.set("mmhcs_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // dev localhost
    path: "/",
    maxAge: 60 * 60 * 8, // 8 tieng
  });

  res.cookies.set("mmhcs_role", role, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  res.cookies.set("mmhcs_user", username, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  return res;
}
