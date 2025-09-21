import { NextResponse } from "next/server";

export const config = { matcher: ["/admin/:path*"] };

export function middleware(req: Request) {
  const url = new URL(req.url);
  
  // Пропускаем страницу входа (с слэшем и без)
  if (url.pathname === "/admin/login" || url.pathname === "/admin/login/") {
    return NextResponse.next();
  }
  
  // Проверяем сессию в cookies
  const sessionCookie = req.headers.get("cookie");
  if (sessionCookie) {
    // Проверяем наличие сессии админа
    if (sessionCookie.includes("admin-session=")) {
      return NextResponse.next();
    }
  }
  
  // Если сессии нет, перенаправляем на логин
  return NextResponse.redirect(new URL("/admin/login", req.url));
}
