import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const session = req.cookies.get("mmhcs_session")?.value;
  const role = req.cookies.get("mmhcs_role")?.value;

  const isLoggedIn = Boolean(session);

  // Các route cần đăng nhập
  const canLoginPage = pathname.startsWith("/dang-nhap");
  const isAdminArea = pathname.startsWith("/admin");
  const isUserArea = pathname.startsWith("/user");

  // Chưa login mà vào vùng bảo vệ -> đá về /dang-nhap
  if (!isLoggedIn && (isAdminArea || isUserArea)) {
    const url = req.nextUrl.clone();
    url.pathname = "/dang-nhap";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  // Admin area: bắt buộc role=admin hoặc là host của phòng
  if (isLoggedIn && isAdminArea && role !== "admin") {
    const hostRoom = req.cookies.get("mmhcs_host_room")?.value;
    const match = pathname.match(/^\/admin\/phong\/([^/]+)(?:\/|$)/);
    const roomId = match?.[1];
    const vaoTrangMoi = pathname === "/admin";
    const vaoKetQua = pathname.startsWith("/admin/ket-qua");

    if (vaoTrangMoi) {
      if (!hostRoom) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } else if (vaoKetQua) {
      if (!hostRoom) {
        const url = req.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
    } else if (!hostRoom || !roomId || hostRoom !== roomId) {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // Nếu đã login mà vẫn vào /dang-nhap -> tự đá về trang chung
  if (isLoggedIn && canLoginPage) {
    const url = req.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dang-nhap", "/admin/:path*", "/user/:path*"],
};
