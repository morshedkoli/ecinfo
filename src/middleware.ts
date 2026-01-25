
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const role = (req.auth?.user as any)?.role;

    console.log(`[Middleware] ${req.method} ${pathname} | Auth: ${isLoggedIn} | Role: ${role}`);

    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/forgot-password'];
    const isPublicPath = publicPaths.includes(pathname);
    const isApiRoute = pathname.startsWith('/api');

    // Also allow auth API routes
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // 1. Redirect unauthenticated users
    if (!isLoggedIn && !isPublicPath) {
        if (isApiRoute) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        console.log(`[Middleware] Redirecting to /login`);
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Redirect authenticated users away from login page
    if (isLoggedIn && isPublicPath) {
        console.log(`[Middleware] Redirecting to /`);
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Admin-only routes protection
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/settings") || pathname.startsWith("/api/admin");

    if (isAdminRoute && role !== "admin") {
        if (isApiRoute) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        console.log(`[Middleware] Redirecting non-admin to /`);
        // Redirect non-admins to home if they try to access admin pages
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
