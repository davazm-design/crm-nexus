'use client';

import { useState, useEffect, useRef } from 'react';
import { Lead, Message } from '@/types';
import { Send, Phone, PhoneCall, Search, ArrowLeft, MessageCircle } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';

export function MobileChatInterface() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch('/api/leads')
            .then((res) => res.json())
            .then(setLeads);
    }, []);

    const selectedLead = leads.find((l) => l.id === selectedLeadId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [selectedLead?.history]);

    // Marcar mensajes como leídos cuando se selecciona un lead
    const markAsRead = async (leadId: string) => {
        try {
            await fetch('/api/whatsapp/mark-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ leadId }),
            });
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, hasUnreadMessages: false } : l
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    useEffect(() => {
        if (selectedLead?.hasUnreadMessages) {
            markAsRead(selectedLead.id);
        }
    }, [selectedLeadId]);

    // Polling para nuevos mensajes
    useEffect(() => {
        if (!selectedLeadId) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/leads');
                if (res.ok) {
                    const updatedLeads = await res.json();
                    setLeads(updatedLeads);
                }
            } catch (e) { }
        }, 5000);
        return () => clearInterval(interval);
    }, [selectedLeadId]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedLead || sending) return;
        setSending(true);
        setSendError(null);

        const newMessage: Message = {
            id: crypto.randomUUID(),
            sender: 'executive',
            content: message,
            timestamp: new Date().toISOString(),
        };

        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: selectedLead.id,
                    message: message.trim(),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Error al enviar mensaje');

            setLeads(prev => prev.map(l =>
                l.id === selectedLead.id
                    ? { ...l, history: [...l.history, { ...newMessage, id: data.savedMessage?.id || newMessage.id }] }
                    : l
            ));
            setMessage('');
        } catch (error: any) {
            setSendError(error.message);
        }

        setSending(false);
    };

    // Vista de lista de chats
    if (!selectedLead) {
        return (
            <div className="min-h-screen bg-slate-950 pb-20">
                {/* Header */}
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 p-4 border-b border-white/5">
                    <h1 className="text-lg font-bold text-white">Chats</h1>
                    <p className="text-xs text-slate-400">Conversaciones con prospectos</p>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Chat List */}
                <div className="px-4 space-y-2">
                    {leads.map((lead) => {
                        const lastMessage = lead.history?.[lead.history.length - 1];
                        return (
                            <div
                                key={lead.id}
                                onClick={() => setSelectedLeadId(lead.id)}
                                className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5 active:bg-white/10 cursor-pointer"
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                        {lead.name.charAt(0)}
                                    </div>
                                    {lead.hasUnreadMessages && (
                                        <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-slate-900 animate-pulse">
                                            <MessageCircle className="h-3 w-3 text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className={clsx(
                                            "text-sm font-medium truncate",
                                            lead.hasUnreadMessages ? "text-white" : "text-slate-300"
                                        )}>
                                            {lead.name}
                                        </p>
                                        {lastMessage && (
                                            <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">
                                                {format(new Date(lastMessage.timestamp), 'HH:mm')}
                                            </span>
                                        )}
                                    </div>
                                    <p className={clsx(
                                        "text-xs truncate mt-0.5",
                                        lead.hasUnreadMessages ? "text-green-400 font-medium" : "text-slate-500"
                                    )}>
                                        {lastMessage?.content || 'Sin mensajes'}
                                    </p>
                                </div>
                            </div>
                        );
                    })}

                    {leads.length === 0 && (
                        <div className="text-center text-slate-500 py-8">
                            No hay conversaciones
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vista de conversación individual
    return (
        <div className="flex flex-col h-screen bg-slate-950">
            {/* Header con botón regresar */}
            <div className="sticky top-0 bg-slate-900/95 backdrop-blur-lg z-10 p-3 border-b border-white/5 flex items-center gap-3">
                <button
                    onClick={() => setSelectedLeadId(null)}
                    className="p-2 rounded-xl bg-slate-800 text-white"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {selectedLead.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{selectedLead.name}</p>
                    <p className="text-[10px] text-slate-400">{selectedLead.phone}</p>
                </div>
                <a
                    href={`tel:+52${selectedLead.phone}`}
                    className="p-2 bg-green-600 rounded-xl text-white"
                >
                    <PhoneCall className="h-5 w-5" />
                </a>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
                {selectedLead.history.map((msg) => {
                    const isExecutive = msg.sender === 'executive';
                    return (
                        <div
                            key={msg.id}
                            className={clsx(
                                'flex w-full',
                                isExecutive ? 'justify-end' : 'justify-start'
                            )}
                        >
                            <div
                                className={clsx(
                                    'rounded-2xl px-4 py-2 text-sm max-w-[80%]',
                                    isExecutive
                                        ? 'bg-blue-600 text-white rounded-br-sm'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-sm'
                                )}
                            >
                                <p>{msg.content}</p>
                                <p className={clsx(
                                    "text-[9px] mt-1",
                                    isExecutive ? 'text-blue-200' : 'text-slate-400'
                                )}>
                                    {format(new Date(msg.timestamp), 'HH:mm')}
                                </p>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="fixed bottom-14 left-0 right-0 p-3 bg-slate-900/95 backdrop-blur-lg border-t border-white/5">
                {sendError && (
                    <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-lg text-xs text-red-300">
                        {sendError}
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-slate-800 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={sending || !message.trim()}
                        className={clsx(
                            "p-3 rounded-xl text-white transition-all",
                            sending || !message.trim()
                                ? 'bg-slate-700 text-slate-400'
                                : 'bg-blue-600 hover:bg-blue-500 active:scale-95'
                        )}
                    >
                        <Send className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
