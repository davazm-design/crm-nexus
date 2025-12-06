'use client';

import { useState, createContext, useContext, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, Users, Upload, MessageSquare, Calendar, Settings, LogOut, Kanban, Menu, X, Shield, Loader2 } from 'lucide-react';
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

// Context para el estado del sidebar
const SidebarContext = createContext<{
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}>({
    isOpen: false,
    toggle: () => { },
    close: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);

    const toggle = () => setIsOpen(prev => !prev);
    const close = () => setIsOpen(false);

    return (
        <SidebarContext.Provider value={{ isOpen, toggle, close }}>
            {children}
        </SidebarContext.Provider>
    );
}

// Botón hamburguesa para móvil
export function MobileMenuButton() {
    const { isOpen, toggle } = useSidebar();

    return (
        <button
            onClick={toggle}
            className="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-xl bg-slate-800/80 backdrop-blur-md border border-white/10 text-white shadow-lg"
            aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const { isOpen, close } = useSidebar();
    const { data: session, status } = useSession();

    // Cerrar sidebar al cambiar de ruta (en móvil)
    useEffect(() => {
        close();
    }, [pathname]);

    const handleSignOut = () => {
        signOut({ callbackUrl: '/login' });
    };

    // Obtener iniciales del nombre
    const getInitials = (name?: string | null) => {
        if (!name) return '??';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Obtener rol legible
    const getRoleLabel = (role?: string) => {
        return role === 'ADMIN' ? 'Administrador' : 'Ejecutivo';
    };

    return (
        <>
            {/* Overlay para cerrar en móvil */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
                    onClick={close}
                />
            )}

            {/* Sidebar */}
            <div className={clsx(
                "flex h-screen w-64 flex-col glass border-r-0 z-40 transition-transform duration-300 ease-in-out",
                // En móvil: posición fija y slide
                "fixed lg:relative",
                "lg:translate-x-0",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-20 items-center justify-center border-b border-white/5 px-4">
                    <div className="flex items-center gap-3">
                        <Image
                            src="/logo-teem.jpg"
                            alt="TEEM Logo"
                            width={40}
                            height={40}
                            className="rounded-lg"
                        />
                        <div>
                            <h1 className="text-lg font-bold tracking-tight text-white font-outfit">
                                TEEM<span className="text-indigo-400">CRM</span>
                            </h1>
                            <p className="text-[8px] text-slate-500 uppercase">Gestión de Prospectos</p>
                        </div>
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
                                    onClick={close}
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

                {/* User Section */}
                <div className="p-4 border-t border-white/5 bg-slate-900/30">
                    {status === 'loading' ? (
                        <div className="flex items-center justify-center p-4">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-500" />
                        </div>
                    ) : session?.user ? (
                        <div
                            onClick={handleSignOut}
                            className="flex items-center p-2 rounded-xl hover:bg-red-500/10 transition-colors cursor-pointer group"
                        >
                            {session.user.image ? (
                                <img
                                    src={session.user.image}
                                    alt={session.user.name || 'Usuario'}
                                    className="h-10 w-10 rounded-full border border-white/10"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-inner border border-white/10">
                                    {getInitials(session.user.name)}
                                </div>
                            )}
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-white truncate group-hover:text-red-400 transition-colors">
                                    {session.user.name || 'Usuario'}
                                </p>
                                <div className="flex items-center gap-1">
                                    <Shield className="h-3 w-3 text-slate-500" />
                                    <p className="text-xs text-slate-500">
                                        {getRoleLabel(session.user.role)}
                                    </p>
                                </div>
                            </div>
                            <LogOut className="h-4 w-4 text-slate-500 group-hover:text-red-400 transition-colors" />
                        </div>
                    ) : null}
                </div>
            </div>
        </>
    );
}
