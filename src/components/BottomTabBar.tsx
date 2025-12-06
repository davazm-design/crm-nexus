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
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-lg border-t border-white/10 safe-area-bottom">
            <div className="flex justify-around items-center h-16 px-2">
                {tabs.map((tab) => {
                    const isActive = pathname === tab.href ||
                        (tab.href === '/menu' && ['/leads', '/crp', '/calendar', '/settings'].includes(pathname));

                    return (
                        <Link
                            key={tab.name}
                            href={tab.href}
                            className={clsx(
                                'flex flex-col items-center justify-center flex-1 py-2 rounded-xl transition-all duration-200',
                                isActive
                                    ? 'text-blue-400'
                                    : 'text-slate-500 active:text-slate-300'
                            )}
                        >
                            <div className={clsx(
                                'p-1.5 rounded-xl transition-all duration-200',
                                isActive && 'bg-blue-500/20'
                            )}>
                                <tab.icon className={clsx(
                                    'h-6 w-6 transition-transform',
                                    isActive && 'scale-110'
                                )} />
                            </div>
                            <span className={clsx(
                                'text-[10px] font-medium mt-0.5',
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
