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
} from 'lucide-react';
import { useState } from 'react';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Voters', href: '/voters', icon: Users },
    { name: 'Voter Areas', href: '/areas', icon: MapPin },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`fixed left-0 top-0 z-40 h-screen bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'
                }`}
        >
            {/* Header */}
            <div className="flex h-16 items-center justify-between border-b border-slate-700 px-4">
                {!collapsed && (
                    <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                        Voter DB
                    </h1>
                )}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="rounded-lg p-2 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                    {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="mt-6 px-3">
                <ul className="space-y-2">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200 ${isActive
                                            ? 'bg-gradient-to-r from-violet-600 to-cyan-600 text-white shadow-lg shadow-violet-500/25'
                                            : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                                        }`}
                                >
                                    <item.icon size={20} className="flex-shrink-0" />
                                    {!collapsed && (
                                        <span className="font-medium">{item.name}</span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="absolute bottom-6 left-0 right-0 px-4">
                    <div className="rounded-xl bg-slate-700/50 p-4">
                        <p className="text-xs text-slate-400">
                            Voter Management System
                        </p>
                        <p className="text-xs text-slate-500 mt-1">v1.0.0</p>
                    </div>
                </div>
            )}
        </aside>
    );
}
