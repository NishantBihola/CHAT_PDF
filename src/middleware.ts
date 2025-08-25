// src/middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Public routes (no auth needed)
const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  // add any other public paths here, e.g. docs, marketing pages, etc.
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect everything that isn't public
  if (!isPublicRoute(req)) {
    await auth.protect(); // <-- note: await + no parentheses on auth
  }
});

// Keep matcher lean so it doesn't run for static assets
export const config = {
  matcher: [
    // All paths except _next/static, _next/image, assets with a dot, favicon, etc.
    "/((?!_next|.*\\..*|favicon.ico).*)",
    // Always run for API if you have protected APIs
    "/(api|trpc)(.*)",
  ],
};
