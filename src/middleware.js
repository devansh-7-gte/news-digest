import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const res = NextResponse.next();
  
  try {
    const supabase = createMiddlewareClient({ req, res });
    await supabase.auth.getSession();
  } catch (err) {
    // Suppress middleware auth warning for local dev/mock sessions
  }

  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/subscriptions/:path*', '/preferences/:path*', '/history/:path*', '/sources/:path*'],
};
