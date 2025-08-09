import { NextRequest, NextResponse } from "next/server";

const AUTH_REFRESH_ENDPOINT = "/api/auth/refresh";
const protectedPaths = ["/dashboard", "/vocab-assessment"];

export async function middleware(req: NextRequest) {
  const accessToken = req.cookies.get("accessToken");
  const refreshToken = req.cookies.get("refreshToken");
  const { pathname } = req.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname.startsWith(path));

  if (!accessToken && isProtected) {
    if (!refreshToken) {
      return NextResponse.redirect(new URL("/login", req.url));
    }
    return await refreshTokenAndContinue(req, refreshToken.value);
  }

  return NextResponse.next();
}

async function refreshTokenAndContinue(req: NextRequest, refreshToken: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${AUTH_REFRESH_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (res.ok) {
      // Token refreshed successfully
      const response = NextResponse.next({
        request: {
          headers: req.headers,
        },
      });
      const setCookies = res.headers.getSetCookie();

      setCookies.forEach((cookie) => {
        response.headers.append("Set-Cookie", cookie);
      });
      return response;
    } else {
      // Token not refreshed, redirecting to login
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("refreshToken");
      response.cookies.delete("accessToken");
      return response;
    }
  } catch (error) {
    console.error("Error refreshing token in middleware: ", error);
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
