import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Demo users
const DEMO_USERS = {
  "admin@pixelprint.com": {
    email: "admin@pixelprint.com",
    password: "admin123",
    role: "admin",
    name: "Administrator"
  },
  "user@pixelprint.com": {
    email: "user@pixelprint.com", 
    password: "user123",
    role: "user",
    name: "User"
  }
};

export async function POST(request: NextRequest) {
  console.log("🔐 API AUTH POST: Starting...");
  try {
    const { email, password } = await request.json();
    console.log("🔐 API AUTH POST: Received credentials:", { email, password: "***" });

    // Проверяем учетные данные
    const user = Object.values(DEMO_USERS).find(
      u => u.email === email && u.password === password
    );
    console.log("🔐 API AUTH POST: User found:", user ? "YES" : "NO");

    if (!user) {
      console.log("❌ API AUTH POST: Invalid credentials");
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    console.log("✅ API AUTH POST: Valid credentials, creating session");
    // Создаем сессию
    const sessionData = {
      email: user.email,
      role: user.role,
      name: user.name,
      loginTime: new Date().toISOString()
    };
    console.log("🔐 API AUTH POST: Session data:", sessionData);

    // Устанавливаем cookie с сессией
    const response = NextResponse.json(
      { 
        success: true, 
        user: {
          email: user.email,
          role: user.role,
          name: user.name
        }
      },
      { status: 200 }
    );

    // Устанавливаем HTTP-only cookie
    response.cookies.set("admin-session", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  console.log("🔍 API AUTH GET: Checking session...");
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("admin-session");
    console.log("🔍 API AUTH GET: Session cookie:", sessionCookie ? "EXISTS" : "NOT FOUND");

    if (!sessionCookie) {
      console.log("❌ API AUTH GET: No session cookie");
      return NextResponse.json(
        { authenticated: false },
        { status: 200 }
      );
    }

    const sessionData = JSON.parse(sessionCookie.value);
    console.log("✅ API AUTH GET: Session found:", sessionData);
    
    return NextResponse.json({
      authenticated: true,
      user: {
        email: sessionData.email,
        role: sessionData.role,
        name: sessionData.name
      }
    });
  } catch (error) {
    console.error("💥 API AUTH GET ERROR:", error);
    return NextResponse.json(
      { authenticated: false },
      { status: 200 }
    );
  }
}

export async function DELETE() {
  try {
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Удаляем cookie
    response.cookies.set("admin-session", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { error: "Logout error" },
      { status: 500 }
    );
  }
}
