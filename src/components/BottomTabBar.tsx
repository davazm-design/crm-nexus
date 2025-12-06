'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Kanban, MessageSquare, MoreHorizontal } from 'lucide-react';
import clsx from 'clsx';

const tabs = [
    { name: 'Inicio', href: '/', icon: Home },
    { name: 'Pipeline', href: '/kanban', icon: Kanban },
    { name: 'Chats', href: '/whatsapp', icon: MessageSquare },
    { name: 'Más', href: '/menu', icon: MoreHorizontal },
];

export function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
            <div className="flex justify-around items-center h-14 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href ||
                        (tab.href === '/menu' && ['/leads', '/crp', '/calendar', '/settings'].includes(pathname));

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                'flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-all duration-200',
                                isActive
                                    ? 'text-blue-400'
                                    : 'text-slate-500 active:text-slate-300'
                            )}
                        >
                            <tab.icon className={clsx(
                                'h-5 w-5 transition-transform',
                                isActive && 'scale-110'
                            )} />
                            <span className={clsx(
                                'text-[9px] font-medium mt-0.5',
                                isActive ? 'text-blue-400' : 'text-slate-500'
                            )}>
                                {tab.name}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
