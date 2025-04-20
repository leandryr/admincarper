import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('admin');
  const { pathname } = request.nextUrl;

  // evitamos bucles en /admin/login
  if (pathname.startsWith('/admin/login')) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next(); // permite mostrar login sin redirigir
  }

  // protegemos otras rutas /admin/*
  if (pathname.startsWith('/admin') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
