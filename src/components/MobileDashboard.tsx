'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lead } from '@/types';
import { MessageCircle, Users, Calendar, TrendingUp, ChevronRight, Phone, X, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

interface MobileDashboardProps {
    leads: Lead[];
}

type FilterType = 'new' | 'unread' | 'progress' | 'scheduled' | null;

export function MobileDashboard({ leads }: MobileDashboardProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>(null);

    // Calcular stats
    const newLeads = leads.filter(l => l.status === 'new');
    const unreadChats = leads.filter(l => l.hasUnreadMessages);
    const inProgress = leads.filter(l => l.status === 'in_conversation' || l.status === 'contacted');
    const scheduled = leads.filter(l => l.status === 'scheduled');

    // Chats recientes (últimos 5 con historial)
    const recentChats = leads
        .filter(l => l.history && l.history.length > 0)
        .sort((a, b) => {
            const aTime = a.history[a.history.length - 1]?.timestamp || '';
            const bTime = b.history[b.history.length - 1]?.timestamp || '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
        })
        .slice(0, 5);

    // Obtener leads filtrados
    const getFilteredLeads = () => {
        switch (activeFilter) {
            case 'new': return newLeads;
            case 'unread': return unreadChats;
            case 'progress': return inProgress;
            case 'scheduled': return scheduled;
            default: return [];
        }
    };

    const getFilterTitle = () => {
        switch (activeFilter) {
            case 'new': return 'Leads Nuevos';
            case 'unread': return 'Mensajes Sin Leer';
            case 'progress': return 'En Progreso';
            case 'scheduled': return 'Citas Agendadas';
            default: return '';
        }
    };

    const filteredLeads = getFilteredLeads();

    // Vista de leads filtrados
    if (activeFilter) {
        return (
            <div className="min-h-screen bg-slate-950 pb-20">
                {/* Header con botón regresar */}
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setActiveFilter(null)}
                            className="p-2 rounded-xl bg-slate-800 text-white"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-white">{getFilterTitle()}</h1>
                            <p className="text-xs text-slate-400">{filteredLeads.length} prospecto(s)</p>
                        </div>
                    </div>
                </div>

                {/* Lista de leads */}
                <div className="p-4 space-y-3">
                    {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                            <Link
                                key={lead.id}
                                href="/whatsapp"
                                className="flex items-center gap-3 p-4 bg-slate-900/50 rounded-xl border border-white/5 active:bg-white/10"
                            >
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {lead.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{lead.phone}</p>
                                </div>
                                <a
                                    href={`tel:+52${lead.phone}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-green-600 rounded-lg text-white"
                                >
                                    <Phone className="h-4 w-4" />
                                </a>
                            </Link>
                        ))
                    ) : (
                        <div className="text-center text-slate-500 py-8">
                            No hay prospectos en esta categoría
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vista principal del dashboard
    return (
        <div className="min-h-screen bg-slate-950 pb-20 px-4">
            {/* Header */}
            <div className="pt-4 pb-2">
                <div className="flex items-center gap-3 mb-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                        N
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">NEXUSCRM</p>
                        <p className="text-sm font-medium text-white">Liceo Universitario ▾</p>
                    </div>
                </div>
                <h1 className="text-xl font-bold text-white font-outfit">
                    Hola, David 👋
                </h1>
                <p className="text-xs text-slate-400 mt-0.5">
                    Aquí está tu resumen de hoy
                </p>
            </div>

            {/* Stats Grid - 2x2 que cabe en pantalla */}
            <div className="py-3">
                <div className="grid grid-cols-2 gap-2">
                    {/* Nuevos */}
                    <button
                        onClick={() => setActiveFilter('new')}
                        className="bg-gradient-to-br from-blue-600/30 to-blue-700/20 rounded-xl p-3 border border-blue-500/30 text-left active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Users className="h-3.5 w-3.5 text-blue-400" />
                            <span className="text-[10px] text-blue-300">Nuevos</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{newLeads.length}</p>
                    </button>

                    {/* Sin leer */}
                    <button
                        onClick={() => setActiveFilter('unread')}
                        className="bg-gradient-to-br from-green-600/30 to-green-700/20 rounded-xl p-3 border border-green-500/30 text-left active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <MessageCircle className="h-3.5 w-3.5 text-green-400" />
                            <span className="text-[10px] text-green-300">Sin leer</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{unreadChats.length}</p>
                    </button>

                    {/* En progreso */}
                    <button
                        onClick={() => setActiveFilter('progress')}
                        className="bg-gradient-to-br from-yellow-600/30 to-yellow-700/20 rounded-xl p-3 border border-yellow-500/30 text-left active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <TrendingUp className="h-3.5 w-3.5 text-yellow-400" />
                            <span className="text-[10px] text-yellow-300">En progreso</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{inProgress.length}</p>
                    </button>

                    {/* Citas */}
                    <button
                        onClick={() => setActiveFilter('scheduled')}
                        className="bg-gradient-to-br from-purple-600/30 to-purple-700/20 rounded-xl p-3 border border-purple-500/30 text-left active:scale-95 transition-transform"
                    >
                        <div className="flex items-center gap-1.5 mb-1">
                            <Calendar className="h-3.5 w-3.5 text-purple-400" />
                            <span className="text-[10px] text-purple-300">Citas</span>
                        </div>
                        <p className="text-2xl font-bold text-white">{scheduled.length}</p>
                    </button>
                </div>
            </div>

            {/* Agenda Section */}
            <div className="py-2">
                <div className="bg-slate-900/50 rounded-xl border border-white/5 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-sm font-semibold text-white">Agenda</h2>
                        <Link href="/calendar" className="text-[10px] text-blue-400">Ver agenda</Link>
                    </div>
                    <p className="text-[10px] text-slate-400 mb-2">
                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="text-xs text-slate-500 text-center py-3">
                        Aún no tienes eventos agendados
                    </p>
                </div>
            </div>

            {/* Recent Chats */}
            <div className="py-2">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-sm font-semibold text-white">Chats recientes</h2>
                    <Link href="/whatsapp" className="text-[10px] text-blue-400">Ver chats</Link>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-white/5 overflow-hidden divide-y divide-white/5">
                    {recentChats.length > 0 ? (
                        recentChats.map((lead) => {
                            const lastMessage = lead.history[lead.history.length - 1];
                            return (
                                <Link
                                    key={lead.id}
                                    href="/whatsapp"
                                    className="flex items-center gap-3 p-3 active:bg-white/10 transition-colors"
                                >
                                    <div className="relative flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                            {lead.name.charAt(0)}
                                        </div>
                                        {lead.hasUnreadMessages && (
                                            <div className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                                <span className="text-[8px] text-white font-bold">!</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={clsx(
                                                "text-xs font-medium truncate",
                                                lead.hasUnreadMessages ? "text-white" : "text-slate-300"
                                            )}>
                                                {lead.name}
                                            </p>
                                            <span className="text-[9px] text-slate-500 ml-2 flex-shrink-0">
                                                {format(new Date(lastMessage.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <p className={clsx(
                                            "text-[10px] truncate mt-0.5",
                                            lead.hasUnreadMessages ? "text-green-400 font-medium" : "text-slate-500"
                                        )}>
                                            {lastMessage.content}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="p-4 text-center text-slate-500 text-xs">
                            No hay chats recientes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
