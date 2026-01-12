
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const { pathname } = req.nextUrl;
    const role = (req.auth?.user as any)?.role;

    console.log(`[Middleware] ${req.method} ${pathname} | Auth: ${isLoggedIn} | Role: ${role} | Cookie: ${req.headers.get('cookie') ? 'Yes' : 'No'}`);

    // Define public paths that don't require authentication
    const publicPaths = ['/login', '/forgot-password'];
    const isPublicPath = publicPaths.includes(pathname);

    // Also allow auth API routes
    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }

    // 1. Redirect unauthenticated users to login (unless on a public path)
    if (!isLoggedIn && !isPublicPath) {
        console.log(`[Middleware] Redirecting to /login`);
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // 2. Redirect authenticated users away from login page
    if (isLoggedIn && isPublicPath) {
        console.log(`[Middleware] Redirecting to /`);
        return NextResponse.redirect(new URL("/", req.url));
    }

    // 3. Admin-only routes protection
    const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/settings");

    if (isAdminRoute && role !== "admin") {
        console.log(`[Middleware] Redirecting non-admin to /`);
        // Redirect non-admins to home if they try to access admin pages
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
