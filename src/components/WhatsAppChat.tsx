'use client';

import { useState, useEffect, useRef } from 'react';
import { Lead, Message } from '@/types';

interface WhatsAppChatProps {
    lead: Lead;
    onClose: () => void;
    onMessageSent?: () => void;
}

export default function WhatsAppChat({ lead, onClose, onMessageSent }: WhatsAppChatProps) {
    const [messages, setMessages] = useState<Message[]>(lead.history || []);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll al último mensaje
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Polling para nuevos mensajes (cada 5 segundos)
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/leads/${lead.id}`);
                if (res.ok) {
                    const updatedLead = await res.json();
                    if (updatedLead.history?.length > messages.length) {
                        setMessages(updatedLead.history);
                    }
                }
            } catch (e) {
                // Silently fail polling
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [lead.id, messages.length]);

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return;

        setSending(true);
        setError(null);

        try {
            const res = await fetch('/api/whatsapp/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leadId: lead.id,
                    message: newMessage.trim(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Error al enviar mensaje');
            }

            // Agregar mensaje al estado local
            const sentMessage: Message = {
                id: data.savedMessage?.id || Date.now().toString(),
                content: newMessage.trim(),
                sender: 'executive',
                timestamp: new Date().toISOString(),
            };

            setMessages(prev => [...prev, sentMessage]);
            setNewMessage('');
            onMessageSent?.();

        } catch (err: any) {
            setError(err.message);
        } finally {
            setSending(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const formatTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleTimeString('es-MX', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl w-full max-w-lg h-[600px] flex flex-col overflow-hidden shadow-2xl border border-gray-700">
                {/* Header */}
                <div className="bg-[#075E54] p-4 flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="text-white hover:bg-white/10 p-2 rounded-full transition"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center text-white font-bold">
                        {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-white font-semibold">{lead.name}</h3>
                        <p className="text-green-200 text-sm">{lead.phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        <span className="text-green-200 text-xs">WhatsApp</span>
                    </div>
                </div>

                {/* Messages Area */}
                <div
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23128C7E\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                        backgroundColor: '#0B141A'
                    }}
                >
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 mt-10">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            <p>No hay mensajes aún</p>
                            <p className="text-sm mt-2">Envía el primer mensaje para iniciar la conversación</p>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div
                                key={msg.id || idx}
                                className={`flex ${msg.sender === 'executive' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-lg px-3 py-2 ${msg.sender === 'executive'
                                            ? 'bg-[#005C4B] text-white rounded-br-none'
                                            : 'bg-gray-800 text-white rounded-bl-none'
                                        }`}
                                >
                                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    <p className={`text-xs mt-1 ${msg.sender === 'executive' ? 'text-green-200' : 'text-gray-400'}`}>
                                        {formatTime(msg.timestamp)}
                                        {msg.sender === 'executive' && (
                                            <span className="ml-1">✓✓</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/20 text-red-400 px-4 py-2 text-sm">
                        ⚠️ {error}
                    </div>
                )}

                {/* Input Area */}
                <div className="bg-gray-800 p-3 flex items-end gap-2">
                    <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Escribe un mensaje..."
                        className="flex-1 bg-gray-700 text-white rounded-2xl px-4 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#25D366] max-h-32"
                        rows={1}
                        disabled={sending}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!newMessage.trim() || sending}
                        className="bg-[#25D366] hover:bg-[#128C7E] disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
                    >
                        {sending ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
