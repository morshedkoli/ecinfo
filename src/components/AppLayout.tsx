
'use client';

import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';
import { SidebarProvider, useSidebar } from './SidebarContext';

function InternalAppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const { collapsed } = useSidebar();

    // Logic must match Sidebar.tsx conditions for hiding
    const isPublicPage = pathname === '/login' || pathname === '/forgot-password';
    const showSidebar = !isPublicPage && !!session;

    // Responsive margins:
    // - Desktop (expanded): ml-64
    // - Desktop (collapsed): ml-20
    // - Mobile: ml-0 (Sidebar handles its own visibility/overlay on mobile)
    const marginClass = showSidebar
        ? (collapsed ? 'md:ml-20' : 'md:ml-64')
        : '';

    return (
        <div className="flex min-h-screen bg-slate-900 text-white">
            <Sidebar />
            <main className={`flex-1 transition-all duration-300 ${marginClass} w-full`}>
                {children}
            </main>
        </div>
    );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <InternalAppLayout>{children}</InternalAppLayout>
        </SidebarProvider>
    );
}
