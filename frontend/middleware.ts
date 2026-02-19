import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token'); // Ou vérification de ton stockage de session
  const { pathname } = request.nextUrl;

  // 1. Si l'utilisateur va sur "/" -> Rediriger vers "/login"
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. Optionnel : Empêcher l'accès au dashboard sans token
  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
