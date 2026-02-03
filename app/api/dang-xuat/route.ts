import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const res = NextResponse.redirect(new URL("/dang-nhap", req.url));
  res.cookies.set("mmhcs_session", "", { path: "/", maxAge: 0 });
  res.cookies.set("mmhcs_role", "", { path: "/", maxAge: 0 });
  res.cookies.set("mmhcs_user", "", { path: "/", maxAge: 0 });
  res.cookies.set("mmhcs_host_room", "", { path: "/", maxAge: 0 });
  return res;
}
