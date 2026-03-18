import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host.startsWith('waitlist.')) {
    const url = req.nextUrl.clone();
    if (url.pathname === '/' || url.pathname === '') {
      url.pathname = '/waitlist';
    }
    return NextResponse.rewrite(url);
  }
  if (host.startsWith('members.')) {
    const url = req.nextUrl.clone();
    if (url.pathname === '/' || url.pathname === '') url.pathname = '/members';
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!api|_next|icon|favicon).*)'] };
