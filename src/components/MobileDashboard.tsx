'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Lead } from '@/types';
import { MessageCircle, Users, Calendar, TrendingUp, ChevronRight, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';

interface MobileDashboardProps {
    leads: Lead[];
}

export function MobileDashboard({ leads }: MobileDashboardProps) {
    // Calcular stats
    const newLeads = leads.filter(l => l.status === 'new').length;
    const inConversation = leads.filter(l => l.status === 'in_conversation').length;
    const scheduled = leads.filter(l => l.status === 'scheduled').length;
    const unreadChats = leads.filter(l => l.hasUnreadMessages).length;

    // Chats recientes (últimos 5 con historial)
    const recentChats = leads
        .filter(l => l.history && l.history.length > 0)
        .sort((a, b) => {
            const aTime = a.history[a.history.length - 1]?.timestamp || '';
            const bTime = b.history[b.history.length - 1]?.timestamp || '';
            return new Date(bTime).getTime() - new Date(aTime).getTime();
        })
        .slice(0, 5);

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <div className="p-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                            N
                        </div>
                        <div>
                            <p className="text-xs text-slate-500">NEXUSCRM</p>
                            <p className="text-sm font-medium text-white">Liceo Universitario ▾</p>
                        </div>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center text-sm font-bold text-white border border-white/10">
                        DA
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-white font-outfit">
                    Hola, David 👋
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                    Aquí está tu resumen de hoy
                </p>
            </div>

            {/* Stats Grid */}
            <div className="px-4 py-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/10 rounded-2xl p-4 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Users className="h-4 w-4 text-blue-400" />
                            <span className="text-xs text-blue-300">Nuevos</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{newLeads}</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-600/20 to-green-700/10 rounded-2xl p-4 border border-green-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-green-300">Sin leer</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{unreadChats}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-600/20 to-yellow-700/10 rounded-2xl p-4 border border-yellow-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="h-4 w-4 text-yellow-400" />
                            <span className="text-xs text-yellow-300">En progreso</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{inConversation}</p>
                    </div>
                    <div className="bg-gradient-to-br from-purple-600/20 to-purple-700/10 rounded-2xl p-4 border border-purple-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="h-4 w-4 text-purple-400" />
                            <span className="text-xs text-purple-300">Citas</span>
                        </div>
                        <p className="text-3xl font-bold text-white">{scheduled}</p>
                    </div>
                </div>
            </div>

            {/* Agenda Section */}
            <div className="px-4 py-2">
                <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-semibold text-white">Agenda</h2>
                        <Link href="/calendar" className="text-xs text-blue-400">Ver agenda</Link>
                    </div>
                    <p className="text-xs text-slate-400 mb-2">
                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                    </p>
                    <p className="text-sm text-slate-500 text-center py-4">
                        Aún no tienes eventos agendados
                    </p>
                </div>
            </div>

            {/* Recent Chats */}
            <div className="px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold text-white">Chats recientes</h2>
                    <Link href="/whatsapp" className="text-xs text-blue-400">Ver chats</Link>
                </div>

                <div className="bg-slate-900/50 rounded-2xl border border-white/5 overflow-hidden divide-y divide-white/5">
                    {recentChats.length > 0 ? (
                        recentChats.map((lead) => {
                            const lastMessage = lead.history[lead.history.length - 1];
                            return (
                                <Link
                                    key={lead.id}
                                    href="/whatsapp"
                                    className="flex items-center gap-3 p-4 hover:bg-white/5 active:bg-white/10 transition-colors"
                                >
                                    <div className="relative">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {lead.name.charAt(0)}
                                        </div>
                                        {lead.hasUnreadMessages && (
                                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                                <span className="text-[10px] text-white font-bold">!</span>
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-slate-900">
                                            <Phone className="h-2.5 w-2.5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className={clsx(
                                                "text-sm font-medium truncate",
                                                lead.hasUnreadMessages ? "text-white" : "text-slate-300"
                                            )}>
                                                {lead.name}
                                            </p>
                                            <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                                                {format(new Date(lastMessage.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                        <p className={clsx(
                                            "text-xs truncate mt-0.5",
                                            lead.hasUnreadMessages ? "text-green-400 font-medium" : "text-slate-500"
                                        )}>
                                            {lastMessage.content}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })
                    ) : (
                        <div className="p-6 text-center text-slate-500 text-sm">
                            No hay chats recientes
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
