import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = { 
  matcher: ["/admin/:path*"]
};

export function middleware(request: NextRequest) {
  const url = new URL(request.url);
  
  // Пропускаем страницу входа
  if (url.pathname === "/admin/login") {
    return NextResponse.next();
  }
  
  // Пропускаем API routes
  if (url.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }
  
  // Проверяем сессию в cookies
  const sessionCookie = request.cookies.get("admin-session");
  
  if (sessionCookie && sessionCookie.value) {
    try {
      const sessionData = JSON.parse(sessionCookie.value);
      if (sessionData.email && sessionData.role) {
        return NextResponse.next();
      }
    } catch (error) {
      console.error("Invalid session cookie:", error);
    }
  }
  
  // Если сессии нет, перенаправляем на логин
  return NextResponse.redirect(new URL("/admin/login", request.url));
}
