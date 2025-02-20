import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export default clerkMiddleware(async (auth, request) => {
  const path = request.nextUrl.pathname;

  // Define our public paths - notice how we group related paths together for clarity
  const isPublicPath =
    // Authentication-related paths
    path === '/' ||
    path.startsWith('/sign-in') ||
    path.startsWith('/sign-up') ||
    // API webhooks
    path.startsWith('/api/webhooks/clerk') ||
    // Static assets
    path.startsWith('/_next') ||
    path.endsWith('.svg') ||
    path.endsWith('.ico');

  // For public paths, we allow the request to continue
  if (isPublicPath) {
    return NextResponse.next();
  }

  // For protected paths, ensure the user is authenticated
  try {
    // Instead of returning auth.protect() directly, we use it for verification
    await auth.protect();
    // If protection succeeds, allow the request to continue
    return NextResponse.next();
  } catch (error) {
    // Let Clerk handle the unauthorized case
    console.error('Authentication error:', error);
    // Return 401 Unauthorized or redirect to sign-in
    return new Response('Unauthorized', { status: 401 });
  }
});

// Updated matcher configuration that Next.js accepts
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
