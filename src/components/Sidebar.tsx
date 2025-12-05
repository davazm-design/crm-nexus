'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Upload, MessageSquare, Calendar, Settings, LogOut, Kanban } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Prospectos', href: '/leads', icon: Users },
    { name: 'Pipeline', href: '/kanban', icon: Kanban },
    { name: 'CRP Import', href: '/crp', icon: Upload },
    { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
    { name: 'Calendario', href: '/calendar', icon: Calendar },
    { name: 'Configuración', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-screen w-48 flex-col glass border-r-0 z-20">
            <div className="flex h-20 items-center justify-center border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <span className="text-white font-bold text-lg">N</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight text-white font-outfit">
                        NEXUS<span className="text-blue-400">CRM</span>
                    </h1>
                </div>
            </div>

            <div className="flex-1 px-4 py-6 space-y-8 overflow-y-auto">
                <nav className="space-y-1.5">
                    <p className="px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Menu Principal</p>
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={clsx(
                                    'group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'bg-blue-600/10 text-blue-400 shadow-sm border border-blue-500/20'
                                        : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                )}
                            >
                                <item.icon
                                    className={clsx(
                                        'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                                        isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'
                                    )}
                                />
                                {item.name}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="p-4 border-t border-white/5 bg-slate-900/30">
                <div className="flex items-center p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold text-white shadow-inner border border-white/10">
                        DA
                    </div>
                    <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">David Vazquez</p>
                        <p className="text-xs text-slate-500">Administrador</p>
                    </div>
                    <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                </div>
            </div>
        </div>
    );
}
