
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    MapPin,
    Settings,
    ChevronLeft,
    Menu,
    LogOut,
    Shield,
    Database
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useSidebar } from './SidebarContext';
import { useEffect, useState } from 'react';

export default function Sidebar() {
    const pathname = usePathname();
    const { collapsed, setCollapsed, toggleSidebar } = useSidebar();
    const { data: session } = useSession();
    const isAdmin = (session?.user as any)?.role === 'admin';
    const [isMobile, setIsMobile] = useState(false);

    // Handle screen resize to auto-collapse on mobile
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                // On mobile, we might want it hidden/collapsed by default
            } else {
                // On desktop, we respect the user's choice or default to open
            }
        };

        // Initial check
        handleResize();

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Hide sidebar on public pages or if not authenticated
    if (pathname === '/login' || pathname === '/forgot-password' || !session) {
        return null;
    }

    const navigation = [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Voters', href: '/voters', icon: Users },
        { name: 'Voter Areas', href: '/areas', icon: MapPin },
        // Import Data only for Admins
        ...(isAdmin ? [{ name: 'Import Data', href: '/import-data', icon: Database }] : []),
        // Settings only for Admins
        ...(isAdmin ? [{ name: 'Settings', href: '/settings', icon: Settings }] : []),
        // User Management only for Admins
        ...(isAdmin ? [{ name: 'Manage Users', href: '/admin/users', icon: Shield }] : []),
    ];

    return (
        <>
            {/* Mobile Entry Button (Only visible on mobile when sidebar is hidden?) 
                 Actually, usually the header has a menu button. 
                 For now, we will assume a fixed sidebar on desktop and a slide-over on mobile.
             */}

            <aside
                className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 border-r border-slate-700/50 
                ${collapsed ? 'w-20' : 'w-64'} 
                ${isMobile ? (collapsed ? '-translate-x-full' : 'translate-x-0 w-64') : 'translate-x-0'}
                `}
            >
                {/* Header */}
                <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
                    {!collapsed && (
                        <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap">
                            Voter DB
                        </h1>
                    )}
                    <button
                        onClick={toggleSidebar}
                        className="rounded-lg p-2 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors ml-auto"
                    >
                        {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-3 flex-1 overflow-y-auto overflow-x-hidden">
                    <ul className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        title={collapsed ? item.name : ''}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                            }`}
                                    >
                                        <item.icon size={20} className="flex-shrink-0" />
                                        {!collapsed && (
                                            <span className="font-medium whitespace-nowrap">{item.name}</span>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Footer / Logout */}
                <div className={`absolute bottom-0 left-0 right-0 p-4 bg-slate-900/50 backdrop-blur-sm border-t border-slate-700 ${collapsed ? 'items-center flex flex-col' : ''}`}>

                    {session && (
                        <button
                            onClick={() => signOut()}
                            title="Sign Out"
                            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full ${collapsed ? 'justify-center' : ''}`}
                        >
                            <LogOut size={20} />
                            {!collapsed && <span className="font-medium whitespace-nowrap">Sign Out</span>}
                        </button>
                    )}

                    {!collapsed && session && (
                        <div className="mt-4 rounded-xl bg-slate-700/50 p-3">
                            <p className="text-xs text-slate-400">Signed in as</p>
                            <p className="text-sm font-medium text-white truncate w-40">
                                {session.user?.name}
                                <span className="ml-2 text-xs text-violet-400">({(session.user as any).role})</span>
                            </p>
                        </div>
                    )}
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isMobile && !collapsed && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm transition-opacity"
                    onClick={() => setCollapsed(true)}
                />
            )}

            {/* Mobile Menu Toggle (Floating button when sidebar is hidden on mobile) */}
            {isMobile && collapsed && (
                <button
                    onClick={toggleSidebar}
                    className="fixed bottom-4 right-4 z-50 rounded-full bg-violet-600 p-4 text-white shadow-lg shadow-violet-500/50 hover:bg-violet-500 transition-transform hover:scale-105 active:scale-95"
                >
                    <Menu size={24} />
                </button>
            )}
        </>
    );
}
