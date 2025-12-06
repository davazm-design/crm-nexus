'use client';

import Link from 'next/link';
import { Users, Upload, Calendar, Settings, ChevronRight, Bell, HelpCircle, LogOut } from 'lucide-react';
import clsx from 'clsx';

const menuItems = [
    {
        section: 'Gestión',
        items: [
            { name: 'Prospectos', href: '/leads', icon: Users, description: 'Lista completa de leads' },
            { name: 'CRP Import', href: '/crp', icon: Upload, description: 'Importar desde Excel' },
            { name: 'Calendario', href: '/calendar', icon: Calendar, description: 'Citas y recordatorios' },
        ]
    },
    {
        section: 'Configuración',
        items: [
            { name: 'Ajustes', href: '/settings', icon: Settings, description: 'Preferencias de la app' },
            { name: 'Notificaciones', href: '/notifications', icon: Bell, description: 'Alertas y avisos' },
            { name: 'Ayuda', href: '/help', icon: HelpCircle, description: 'Soporte y FAQ' },
        ]
    }
];

export default function MobileMenuPage() {
    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="p-4 pt-6">
                <h1 className="text-2xl font-bold text-white font-outfit">Más opciones</h1>
                <p className="text-sm text-slate-400 mt-1">Accede a todas las funciones</p>
            </div>

            {/* Menu Sections */}
            <div className="px-4 space-y-6">
                {menuItems.map((section) => (
                    <div key={section.section}>
                        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                            {section.section}
                        </h2>
                        <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                            {section.items.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="flex items-center justify-between p-4 hover:bg-white/5 active:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                                            <item.icon className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-white">{item.name}</p>
                                            <p className="text-xs text-slate-500">{item.description}</p>
                                        </div>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-slate-600" />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* User Card */}
            <div className="px-4 mt-8">
                <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl border border-white/10 p-4">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                            DA
                        </div>
                        <div className="flex-1">
                            <p className="text-white font-medium">David Vazquez</p>
                            <p className="text-xs text-slate-400">Administrador</p>
                        </div>
                        <button className="p-3 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Version */}
            <div className="text-center mt-8 text-xs text-slate-600">
                NexusCRM v1.0.0
            </div>
        </div>
    );
}
