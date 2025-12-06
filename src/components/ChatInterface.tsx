'use client';

import { useState, useEffect, useRef } from 'react';
import { Lead, Message } from '@/types';
import { Send, User, Bot, Phone, Search, MoreVertical, Paperclip, Smile } from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export function ChatInterface() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
    const [message, setMessage] = useState('');
    const [sender, setSender] = useState<'executive' | 'prospect'>('executive');
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
            // Actualizar estado local
            setLeads(prev => prev.map(l =>
                l.id === leadId ? { ...l, hasUnreadMessages: false } : l
            ));
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    };

    // Cuando se selecciona un lead con mensajes sin leer, marcarlos como leídos
    useEffect(() => {
        if (selectedLead?.hasUnreadMessages) {
            markAsRead(selectedLead.id);
        }
    }, [selectedLeadId]);

    // Polling para nuevos mensajes (cada 5 segundos)
    useEffect(() => {
        if (!selectedLeadId) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/leads');
                if (res.ok) {
                    const updatedLeads = await res.json();
                    setLeads(updatedLeads);
                }
            } catch (e) {
                // Silently fail
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedLeadId]);

    const handleSendMessage = async () => {
        if (!message.trim() || !selectedLead || sending) return;

        setSending(true);
        setSendError(null);

        const newMessage: Message = {
            id: crypto.randomUUID(),
            sender,
            content: message,
            timestamp: new Date().toISOString(),
        };

        // Si es ejecutivo, enviar por WhatsApp REAL
        if (sender === 'executive') {
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

                if (!res.ok) {
                    throw new Error(data.error || 'Error al enviar mensaje');
                }

                // El mensaje ya fue guardado por la API, actualizar estado local
                setLeads(prev => prev.map(l =>
                    l.id === selectedLead.id
                        ? { ...l, history: [...l.history, { ...newMessage, id: data.savedMessage?.id || newMessage.id }] }
                        : l
                ));
                setMessage('');
            } catch (error: any) {
                setSendError(error.message);
                console.error('Error sending WhatsApp:', error);
            }
        } else {
            // Si es prospecto (simulación), guardar localmente
            const updatedHistory = [...selectedLead.history, newMessage];

            setLeads(prev => prev.map(l =>
                l.id === selectedLead.id ? { ...l, history: updatedHistory } : l
            ));

            setMessage('');

            try {
                await fetch(`/api/leads/${selectedLead.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ history: updatedHistory }),
                });
            } catch (error) {
                console.error('Failed to save simulated message', error);
            }
        }

        setSending(false);
    };

    return (
        <div className="flex h-[calc(100vh-10rem)] glass rounded-2xl overflow-hidden shadow-2xl shadow-black/50">
            {/* Sidebar List */}
            <div className="w-80 border-r border-white/5 flex flex-col bg-slate-900/50 backdrop-blur-md">
                <div className="p-4 border-b border-white/5">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar conversación..."
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-500"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {leads.map((lead) => (
                        <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={clsx(
                                'p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-all duration-200',
                                selectedLeadId === lead.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : 'border-l-2 border-l-transparent'
                            )}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={clsx("font-medium text-sm", selectedLeadId === lead.id ? "text-blue-400" : "text-slate-200")}>
                                    {lead.name}
                                </span>
                                {lead.history.length > 0 && (
                                    <span className="text-[10px] text-slate-500">
                                        {format(new Date(lead.history[lead.history.length - 1].timestamp), 'HH:mm')}
                                    </span>
                                )}
                            </div>
                            <div className="text-xs text-slate-400 truncate pr-2">
                                {lead.history.length > 0
                                    ? lead.history[lead.history.length - 1].content
                                    : <span className="italic opacity-50">Sin mensajes previos</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-slate-950/30 relative">
                {/* Chat Background Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#4f46e5 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

                {selectedLead ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-white/5 bg-slate-900/50 backdrop-blur-md flex justify-between items-center z-10">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                    {selectedLead.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-sm">{selectedLead.name}</h3>
                                    <div className="flex items-center gap-2 text-xs text-slate-400">
                                        <Phone className="h-3 w-3" /> {selectedLead.phone}
                                        <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                        <span className="text-emerald-400">En línea</span>
                                    </div>
                                </div>
                            </div>
                            <button className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                <MoreVertical className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar z-0">
                            {selectedLead.history.map((msg, index) => {
                                const isExecutive = msg.sender === 'executive';
                                return (
                                    <div
                                        key={msg.id}
                                        className={clsx(
                                            'flex w-full',
                                            isExecutive ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        <div className={clsx("flex flex-col max-w-[70%]", isExecutive ? "items-end" : "items-start")}>
                                            <div
                                                className={clsx(
                                                    'rounded-2xl p-4 text-sm shadow-md relative',
                                                    isExecutive
                                                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-none'
                                                        : 'bg-slate-800 text-slate-200 rounded-tl-none border border-white/5'
                                                )}
                                            >
                                                <p className="leading-relaxed">{msg.content}</p>
                                            </div>
                                            <span className="text-[10px] text-slate-500 mt-1 px-1">
                                                {format(new Date(msg.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 border-t border-white/5 bg-slate-900/50 backdrop-blur-md z-10">
                            {/* Error Message */}
                            {sendError && (
                                <div className="bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs mb-3 flex items-center gap-2">
                                    <span>⚠️</span>
                                    <span>{sendError}</span>
                                    <button onClick={() => setSendError(null)} className="ml-auto text-red-300 hover:text-white">✕</button>
                                </div>
                            )}
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mr-2">Enviar como:</span>
                                <button
                                    onClick={() => setSender('executive')}
                                    className={clsx(
                                        "text-xs px-3 py-1 rounded-full transition-all flex items-center gap-1",
                                        sender === 'executive'
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                                    )}
                                >
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                    Ejecutivo (WhatsApp Real)
                                </button>
                                <button
                                    onClick={() => setSender('prospect')}
                                    className={clsx(
                                        "text-xs px-3 py-1 rounded-full transition-all",
                                        sender === 'prospect'
                                            ? 'bg-slate-500/20 text-slate-300 border border-slate-500/30'
                                            : 'bg-slate-800 text-slate-400 border border-transparent hover:bg-slate-700'
                                    )}
                                >
                                    👤 Prospecto (Simulado)
                                </button>
                            </div>
                            <div className="flex items-end gap-2 bg-slate-800/50 border border-slate-700/50 rounded-xl p-2">
                                <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                                    <Smile className="h-5 w-5" />
                                </button>
                                <button className="p-2 text-slate-400 hover:text-blue-400 transition-colors">
                                    <Paperclip className="h-5 w-5" />
                                </button>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Escribe un mensaje..."
                                    className="flex-1 bg-transparent border-none text-white placeholder:text-slate-500 focus:ring-0 resize-none max-h-32 py-2 text-sm custom-scrollbar"
                                    rows={1}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!message.trim() || sending}
                                    className={clsx(
                                        "p-2 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg",
                                        sender === 'executive'
                                            ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                                            : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                                    )}
                                >
                                    {sending ? (
                                        <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <Send className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                        <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4 animate-pulse">
                            <Search className="h-8 w-8 text-slate-600" />
                        </div>
                        <p className="text-lg font-medium text-slate-400">Selecciona una conversación</p>
                        <p className="text-sm text-slate-600">Para ver el historial de mensajes</p>
                    </div>
                )}
            </div>
        </div>
    );
}
