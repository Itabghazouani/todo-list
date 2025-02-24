import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname;

  const isPublicPath =
    path === '/' ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up') ||
    path.startsWith('/api/webhooks/clerk') ||
    path.startsWith('/_next') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico');

  if (isPublicPath) {
    return NextResponse.next();
  }

  try {
    await auth.protect();
    return NextResponse.next();
  } catch (error) {
    console.error('Authentication error:', error);
    return new Response('Unauthorized', { status: 401 });
  }
});

export const config = {
  matcher: [
    /*
     * Match all routes except for:
     * 1. /api/webhooks/clerk (webhook endpoint)
     * 2. /_next (Next.js internals)
     * 3. /static (static files)
     * 4. all files in the public folder
     */
    '/((?!api/webhooks/clerk|_next|static|.*\\..*).*)',
  ],
};
