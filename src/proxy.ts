import type {NextRequest} from 'next/server'
import {NextResponse} from 'next/server'
import {getRoleFromJwtToken} from "@/util/FnCommon";
import {Role} from "@/type/enum";

export function proxy(request: NextRequest) {
  const refreshToken = request.cookies.get('accessToken')?.value;
  const {pathname} = request.nextUrl;
  if (!refreshToken) {

    if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
      return NextResponse.redirect(new URL("/login", request.url));
    } else {
      return NextResponse.next();
    }

  }

  const role: Role = getRoleFromJwtToken(refreshToken);
  if (role === Role.USER) {

    if (pathname.startsWith("/admin") || pathname.startsWith("/owner")) {
      return NextResponse.redirect(new URL("/", request.url));
    } else if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }

  } else if (role === Role.OWNER) {

    if (pathname === "/owner" || pathname === "/login") {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    } else if (pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/owner/dashboard", request.url));
    }

  } else if (role === Role.ADMIN) {

    if (pathname === "/admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else if (!pathname.startsWith("/admin")) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }

  }
  return NextResponse.next();
}


export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ]
}