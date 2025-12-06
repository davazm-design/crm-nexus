'use client';

import { useState, useEffect } from 'react';
import { Lead } from '@/types';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChevronLeft,
    ChevronRight,
    Clock,
    Calendar as CalendarIcon,
    Phone,
    X,
    Check,
    XCircle,
    Edit3,
    Plus,
    MessageCircle,
    ArrowLeft
} from 'lucide-react';
import clsx from 'clsx';
import Link from 'next/link';
import { PullToRefresh } from './PullToRefresh';

interface MobileCalendarProps {
    // props si necesitamos
}

export function MobileCalendar({ }: MobileCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [leads, setLeads] = useState<Lead[]>([]);
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showDayView, setShowDayView] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data: Lead[] = await res.json();
            setAllLeads(data);
            setLeads(data.filter(l => l.status === 'scheduled' || l.status === 'rescheduled'));
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    const getLeadsForDay = (day: Date) => {
        return leads.filter(lead => {
            if (!lead.scheduledAt) return false;
            return isSameDay(parseISO(lead.scheduledAt), day);
        });
    };

    const handleSelectDay = (day: Date) => {
        setSelectedDate(day);
        setShowDayView(true);
    };

    const handleScheduleAppointment = async (leadId: string, time: string, notes: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(hours, minutes, 0, 0);

        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'scheduled',
                    scheduledAt: appointmentDate.toISOString(),
                    observations: notes,
                }),
            });

            if (res.ok) {
                await fetchLeads();
                setShowScheduleModal(false);
                setEditingAppointment(null);
            }
        } catch (error) {
            console.error('Error scheduling:', error);
        }
    };

    const handleUpdateStatus = async (lead: Lead, newStatus: 'enrolled' | 'no_show') => {
        try {
            const res = await fetch(`/api/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (res.ok) {
                await fetchLeads();
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const selectedDayAppointments = getLeadsForDay(selectedDate);

    // Vista de Modal para agendar/editar
    if (showScheduleModal) {
        return (
            <ScheduleModalMobile
                selectedDate={selectedDate}
                leads={allLeads}
                editingAppointment={editingAppointment}
                onSchedule={handleScheduleAppointment}
                onClose={() => {
                    setShowScheduleModal(false);
                    setEditingAppointment(null);
                }}
            />
        );
    }

    // Vista del día seleccionado
    if (showDayView) {
        return (
            <div className="min-h-screen bg-slate-950 pb-20">
                {/* Header */}
                <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 p-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowDayView(false)}
                            className="p-2 rounded-xl bg-slate-800 text-white active:bg-slate-700"
                        >
                            <ArrowLeft className="h-5 w-5" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-white">
                                {format(selectedDate, 'd', { locale: es })} de {format(selectedDate, 'MMMM', { locale: es })}
                            </h1>
                            <p className="text-xs text-slate-400 capitalize">
                                {format(selectedDate, 'EEEE', { locale: es })}
                            </p>
                        </div>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            className="p-2 bg-blue-600 rounded-xl text-white active:bg-blue-500"
                        >
                            <Plus className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Lista de citas */}
                <div className="p-4 space-y-3">
                    {selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments
                            .sort((a, b) => {
                                const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                                const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                                return timeA - timeB;
                            })
                            .map((lead) => (
                                <div key={lead.id} className="p-4 bg-slate-900/70 rounded-xl border border-white/5 relative overflow-hidden">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />

                                    {/* Header de la cita */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                            {lead.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-white">{lead.name}</p>
                                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                                <Clock className="h-3 w-3" />
                                                {lead.scheduledAt && format(parseISO(lead.scheduledAt), 'HH:mm')}
                                                <span className={clsx(
                                                    "px-2 py-0.5 rounded-full text-[10px] font-medium",
                                                    lead.status === 'scheduled' && "bg-blue-500/20 text-blue-400",
                                                    lead.status === 'rescheduled' && "bg-yellow-500/20 text-yellow-400"
                                                )}>
                                                    {lead.status === 'scheduled' ? 'Confirmada' : 'Reagendada'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Teléfono */}
                                    <a
                                        href={`tel:+52${lead.phone}`}
                                        className="flex items-center gap-2 text-sm text-green-400 mb-3 active:text-green-300"
                                    >
                                        <Phone className="h-4 w-4" />
                                        {lead.phone}
                                    </a>

                                    {/* Notas */}
                                    {lead.observations && (
                                        <div className="text-xs text-slate-400 bg-slate-800/50 p-3 rounded-lg mb-3">
                                            "{lead.observations}"
                                        </div>
                                    )}

                                    {/* Acciones */}
                                    <div className="grid grid-cols-4 gap-2">
                                        <button
                                            onClick={() => handleUpdateStatus(lead, 'enrolled')}
                                            className="py-2 bg-emerald-600/20 text-emerald-400 text-xs font-medium rounded-lg flex flex-col items-center gap-1 active:bg-emerald-600/40"
                                        >
                                            <Check className="h-4 w-4" />
                                            Inscrito
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(lead, 'no_show')}
                                            className="py-2 bg-red-600/20 text-red-400 text-xs font-medium rounded-lg flex flex-col items-center gap-1 active:bg-red-600/40"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            No Show
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingAppointment(lead);
                                                setShowScheduleModal(true);
                                            }}
                                            className="py-2 bg-slate-700 text-slate-300 text-xs font-medium rounded-lg flex flex-col items-center gap-1 active:bg-slate-600"
                                        >
                                            <Edit3 className="h-4 w-4" />
                                            Editar
                                        </button>
                                        <Link
                                            href="/whatsapp"
                                            className="py-2 bg-green-600/20 text-green-400 text-xs font-medium rounded-lg flex flex-col items-center gap-1 active:bg-green-600/40"
                                        >
                                            <MessageCircle className="h-4 w-4" />
                                            Chat
                                        </Link>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <CalendarIcon className="h-10 w-10 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium text-lg mb-1">No hay citas</p>
                            <p className="text-slate-600 text-sm mb-6">para este día</p>
                            <button
                                onClick={() => setShowScheduleModal(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium active:bg-blue-500 flex items-center gap-2"
                            >
                                <Plus className="h-5 w-5" />
                                Agendar Cita
                            </button>
                        </div>
                    )}
                </div>

                {/* FAB para agregar cita */}
                {selectedDayAppointments.length > 0 && (
                    <button
                        onClick={() => setShowScheduleModal(true)}
                        className="fixed bottom-20 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 active:bg-blue-500 z-20"
                    >
                        <Plus className="h-6 w-6" />
                    </button>
                )}
            </div>
        );
    }

    // Vista principal del calendario
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <PullToRefresh onRefresh={fetchLeads} className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 p-4 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-blue-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white capitalize">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h1>
                            <p className="text-[10px] text-slate-500">
                                {leads.length} cita(s) agendadas
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-1 bg-slate-800/50 p-1 rounded-lg">
                        <button onClick={prevMonth} className="p-2 text-slate-400 active:text-white active:bg-white/10 rounded">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={nextMonth} className="p-2 text-slate-400 active:text-white active:bg-white/10 rounded">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Citas de hoy (si hay) */}
            {getLeadsForDay(new Date()).length > 0 && (
                <div className="mx-4 mt-4 p-3 bg-blue-600/10 border border-blue-500/30 rounded-xl">
                    <p className="text-xs text-blue-400 font-medium mb-2">📅 Hoy tienes {getLeadsForDay(new Date()).length} cita(s)</p>
                    <button
                        onClick={() => {
                            setSelectedDate(new Date());
                            setShowDayView(true);
                        }}
                        className="text-xs text-blue-300 underline"
                    >
                        Ver citas de hoy →
                    </button>
                </div>
            )}

            {/* Días de la semana */}
            <div className="grid grid-cols-7 gap-1 px-4 pt-4 pb-2">
                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-xs font-semibold text-slate-500 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Grid de días */}
            <div className="grid grid-cols-7 gap-1 px-4">
                {days.map((day) => {
                    const dayLeads = getLeadsForDay(day);
                    const isCurrentMonth = isSameMonth(day, monthStart);
                    const isTodayDate = isToday(day);

                    return (
                        <button
                            key={day.toString()}
                            onClick={() => handleSelectDay(day)}
                            className={clsx(
                                'aspect-square rounded-xl p-1 flex flex-col items-center justify-center transition-all relative',
                                !isCurrentMonth && 'text-slate-700',
                                isCurrentMonth && 'text-slate-300 active:bg-slate-800',
                                isTodayDate && 'ring-2 ring-blue-500'
                            )}
                        >
                            <span className={clsx(
                                "text-sm font-medium",
                                isTodayDate && "bg-blue-600 text-white h-7 w-7 rounded-full flex items-center justify-center"
                            )}>
                                {format(day, 'd')}
                            </span>
                            {dayLeads.length > 0 && (
                                <div className="absolute bottom-1 flex gap-0.5">
                                    {dayLeads.slice(0, 3).map((_, i) => (
                                        <div key={i} className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                                    ))}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Próximas citas */}
            <div className="mt-6 px-4">
                <h2 className="text-sm font-semibold text-white mb-3">Próximas Citas</h2>
                <div className="space-y-2">
                    {leads
                        .filter(l => l.scheduledAt && new Date(l.scheduledAt) >= new Date())
                        .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
                        .slice(0, 5)
                        .map(lead => (
                            <button
                                key={lead.id}
                                onClick={() => {
                                    setSelectedDate(parseISO(lead.scheduledAt!));
                                    setShowDayView(true);
                                }}
                                className="w-full flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-white/5 active:bg-slate-800 text-left"
                            >
                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                    {lead.name.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                                    <p className="text-xs text-slate-400">
                                        {format(parseISO(lead.scheduledAt!), "d 'de' MMM, HH:mm", { locale: es })}
                                    </p>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-500" />
                            </button>
                        ))}
                    {leads.filter(l => l.scheduledAt && new Date(l.scheduledAt) >= new Date()).length === 0 && (
                        <div className="text-center text-slate-500 py-4 text-sm">
                            No hay citas próximas
                        </div>
                    )}
                </div>
            </div>

            {/* FAB para agregar cita rápida */}
            <button
                onClick={() => {
                    setSelectedDate(new Date());
                    setShowScheduleModal(true);
                }}
                className="fixed bottom-20 right-4 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-600/30 active:bg-blue-500 z-20 flex items-center gap-2"
            >
                <Plus className="h-6 w-6" />
            </button>
        </PullToRefresh>
    );
}

// Modal para agendar/editar cita (versión móvil)
function ScheduleModalMobile({
    selectedDate,
    leads,
    editingAppointment,
    onSchedule,
    onClose
}: {
    selectedDate: Date;
    leads: Lead[];
    editingAppointment: Lead | null;
    onSchedule: (leadId: string, time: string, notes: string) => Promise<void>;
    onClose: () => void;
}) {
    const [selectedLeadId, setSelectedLeadId] = useState(editingAppointment?.id || '');
    const [selectedTime, setSelectedTime] = useState(
        editingAppointment?.scheduledAt
            ? format(parseISO(editingAppointment.scheduledAt), 'HH:mm')
            : '09:00'
    );
    const [notes, setNotes] = useState(editingAppointment?.observations || '');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const availableLeads = leads.filter(l => l.status !== 'scheduled' && l.status !== 'enrolled');
    const filteredLeads = availableLeads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00'
    ];

    const handleSubmit = async () => {
        if (!selectedLeadId && !editingAppointment) return;
        setIsSubmitting(true);
        await onSchedule(editingAppointment?.id || selectedLeadId, selectedTime, notes);
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-20">
            {/* Header */}
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-10 p-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl bg-slate-800 text-white active:bg-slate-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold text-white">
                            {editingAppointment ? 'Editar Cita' : 'Nueva Cita'}
                        </h1>
                        <p className="text-xs text-slate-400">
                            {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-4 space-y-6">
                {/* Selección de Lead */}
                {!editingAppointment && (
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Seleccionar Prospecto
                        </label>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-3"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-2">
                            {filteredLeads.slice(0, 10).map(lead => (
                                <button
                                    key={lead.id}
                                    onClick={() => setSelectedLeadId(lead.id)}
                                    className={clsx(
                                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all",
                                        selectedLeadId === lead.id
                                            ? "bg-blue-600/20 border-2 border-blue-500"
                                            : "bg-slate-800/50 border border-slate-700/50 active:bg-slate-700"
                                    )}
                                >
                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {lead.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{lead.name}</p>
                                        <p className="text-xs text-slate-400">{lead.phone}</p>
                                    </div>
                                    {selectedLeadId === lead.id && (
                                        <Check className="h-5 w-5 text-blue-400" />
                                    )}
                                </button>
                            ))}
                            {filteredLeads.length === 0 && (
                                <div className="text-center text-slate-500 py-4 text-sm">
                                    No se encontraron prospectos
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Lead seleccionado (editando) */}
                {editingAppointment && (
                    <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {editingAppointment.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-medium text-white">{editingAppointment.name}</p>
                            <p className="text-sm text-slate-400">{editingAppointment.phone}</p>
                        </div>
                    </div>
                )}

                {/* Selección de Hora */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        <Clock className="inline h-4 w-4 mr-1" /> Hora de la Cita
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {timeSlots.map(time => (
                            <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                className={clsx(
                                    "py-2.5 px-2 rounded-lg text-sm font-medium transition-all",
                                    selectedTime === time
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-800 text-slate-300 active:bg-slate-700"
                                )}
                            >
                                {time}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Notas */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Notas / Observaciones
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ej: Interesado en Licenciatura en Derecho..."
                        rows={3}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-base text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                    />
                </div>
            </div>

            {/* Botones de acción */}
            <div className="fixed bottom-16 left-0 right-0 p-4 bg-slate-950/95 backdrop-blur-lg border-t border-white/5 flex gap-3">
                <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-slate-800 text-slate-300 rounded-xl font-medium active:bg-slate-700"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={(!selectedLeadId && !editingAppointment) || isSubmitting}
                    className={clsx(
                        "flex-1 py-3 rounded-xl font-medium flex items-center justify-center gap-2",
                        (!selectedLeadId && !editingAppointment) || isSubmitting
                            ? "bg-slate-700 text-slate-500"
                            : "bg-blue-600 text-white active:bg-blue-500"
                    )}
                >
                    {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                        <>
                            <CalendarIcon className="h-4 w-4" />
                            {editingAppointment ? 'Guardar' : 'Agendar'}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
