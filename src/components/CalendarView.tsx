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
    User,
    X,
    Check,
    XCircle,
    Edit3,
    Trash2,
    Plus,
    MessageCircle
} from 'lucide-react';
import clsx from 'clsx';
import { AddLeadModal } from './AddLeadModal';
import Link from 'next/link';

// Modal para agregar/editar cita
interface AppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    leads: Lead[];
    onSchedule: (leadId: string, date: Date, time: string, notes: string) => Promise<void>;
    editingAppointment?: Lead | null;
}

function AppointmentModal({ isOpen, onClose, selectedDate, leads, onSchedule, editingAppointment }: AppointmentModalProps) {
    const [selectedLeadId, setSelectedLeadId] = useState('');
    const [selectedTime, setSelectedTime] = useState('09:00');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Leads que NO tienen cita agendada (disponibles para agendar)
    const availableLeads = leads.filter(l => l.status !== 'scheduled' && l.status !== 'enrolled');
    const filteredLeads = availableLeads.filter(l =>
        l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        l.phone.includes(searchTerm)
    );

    useEffect(() => {
        if (editingAppointment) {
            setSelectedLeadId(editingAppointment.id);
            if (editingAppointment.scheduledAt) {
                const date = parseISO(editingAppointment.scheduledAt);
                setSelectedTime(format(date, 'HH:mm'));
            }
            setNotes(editingAppointment.observations || '');
        } else {
            setSelectedLeadId('');
            setSelectedTime('09:00');
            setNotes('');
        }
    }, [editingAppointment, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = async () => {
        if (!selectedLeadId && !editingAppointment) return;

        setIsSubmitting(true);
        try {
            await onSchedule(
                editingAppointment?.id || selectedLeadId,
                selectedDate,
                selectedTime,
                notes
            );
            onClose();
        } catch (error) {
            console.error('Error scheduling:', error);
        }
        setIsSubmitting(false);
    };

    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00'
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-slate-900 rounded-2xl border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-white/10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                {editingAppointment ? 'Editar Cita' : 'Agendar Cita'}
                            </h2>
                            <p className="text-sm text-slate-400">
                                {format(selectedDate, "EEEE d 'de' MMMM, yyyy", { locale: es })}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                            <X className="h-5 w-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Selección de Lead (solo si no estamos editando) */}
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
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-3"
                            />
                            <div className="max-h-40 overflow-y-auto space-y-2 bg-slate-800/50 rounded-xl p-2 border border-slate-700/50">
                                {filteredLeads.length > 0 ? (
                                    filteredLeads.map(lead => (
                                        <button
                                            key={lead.id}
                                            onClick={() => setSelectedLeadId(lead.id)}
                                            className={clsx(
                                                "w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all",
                                                selectedLeadId === lead.id
                                                    ? "bg-blue-600/20 border border-blue-500/50"
                                                    : "bg-slate-800/50 border border-transparent hover:bg-slate-700/50"
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
                                    ))
                                ) : (
                                    <div className="text-center text-slate-500 py-4 text-sm">
                                        No hay prospectos disponibles
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Lead seleccionado (si estamos editando) */}
                    {editingAppointment && (
                        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
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
                                        "py-2 px-3 rounded-lg text-sm font-medium transition-all",
                                        selectedTime === time
                                            ? "bg-blue-600 text-white"
                                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
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
                            placeholder="Ej: Interesado en Licenciatura en Derecho, viene con su mamá..."
                            rows={3}
                            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={(!selectedLeadId && !editingAppointment) || isSubmitting}
                        className={clsx(
                            "flex-1 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2",
                            (!selectedLeadId && !editingAppointment) || isSubmitting
                                ? "bg-slate-700 text-slate-500 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20"
                        )}
                    >
                        {isSubmitting ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <CalendarIcon className="h-4 w-4" />
                                {editingAppointment ? 'Guardar Cambios' : 'Agendar Cita'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [leads, setLeads] = useState<Lead[]>([]);
    const [allLeads, setAllLeads] = useState<Lead[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
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
    const goToToday = () => {
        setCurrentMonth(new Date());
        setSelectedDate(new Date());
    };

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

    const handleScheduleAppointment = async (leadId: string, date: Date, time: string, notes: string) => {
        const [hours, minutes] = time.split(':').map(Number);
        const appointmentDate = new Date(date);
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
            }
        } catch (error) {
            console.error('Error scheduling:', error);
        }
    };

    const handleUpdateStatus = async (lead: Lead, newStatus: 'enrolled' | 'no_show' | 'rescheduled') => {
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

    const handleCancelAppointment = async (lead: Lead) => {
        if (!confirm(`¿Cancelar la cita de ${lead.name}?`)) return;

        try {
            const res = await fetch(`/api/leads/${lead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'contacted',
                    scheduledAt: null
                }),
            });

            if (res.ok) {
                await fetchLeads();
            }
        } catch (error) {
            console.error('Error canceling:', error);
        }
    };

    const todayAppointments = getLeadsForDay(new Date());
    const selectedDayAppointments = getLeadsForDay(selectedDate);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="flex h-full gap-6 flex-col lg:flex-row">
            {/* Calendario Principal */}
            <div className="flex-1 glass rounded-2xl p-6 shadow-xl shadow-black/20">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white capitalize font-outfit">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {todayAppointments.length} cita(s) hoy
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={goToToday}
                            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
                        >
                            Hoy
                        </button>
                        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-white/5">
                            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className="h-5 w-5" />
                            </button>
                            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                                <ChevronRight className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Días de la semana */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Grid de días */}
                <div className="grid grid-cols-7 gap-2">
                    {days.map((day) => {
                        const dayLeads = getLeadsForDay(day);
                        const isSelected = isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isTodayDate = isToday(day);

                        return (
                            <button
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    'min-h-[80px] lg:min-h-[100px] rounded-xl p-2 lg:p-3 transition-all duration-200 flex flex-col text-left relative',
                                    !isCurrentMonth && 'bg-slate-900/20 text-slate-600',
                                    isCurrentMonth && !isSelected && 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80',
                                    isSelected && 'ring-2 ring-blue-500 bg-blue-500/10',
                                    !isSelected && isTodayDate && 'ring-1 ring-blue-500/50'
                                )}
                            >
                                <div className="flex justify-between items-start">
                                    <span className={clsx(
                                        "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                                        isTodayDate && "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayLeads.length > 0 && (
                                        <span className="flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                            {dayLeads.length}
                                        </span>
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 mt-1 overflow-hidden">
                                    {dayLeads.slice(0, 2).map(lead => (
                                        <div key={lead.id} className="text-[9px] lg:text-[10px] truncate text-blue-200 bg-blue-500/20 px-1.5 py-0.5 rounded">
                                            {lead.scheduledAt && format(parseISO(lead.scheduledAt), 'HH:mm')} {lead.name.split(' ')[0]}
                                        </div>
                                    ))}
                                    {dayLeads.length > 2 && (
                                        <div className="text-[9px] text-slate-500">
                                            +{dayLeads.length - 2} más
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Panel lateral - Detalles del día */}
            <div className="w-full lg:w-96 glass rounded-2xl p-6 flex flex-col shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white font-outfit">
                        Agenda del Día
                    </h3>
                    <button
                        onClick={() => {
                            setEditingAppointment(null);
                            setIsModalOpen(true);
                        }}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors"
                    >
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                {/* Fecha seleccionada */}
                <div className="mb-4 pb-4 border-b border-white/10">
                    <div className="text-4xl font-bold text-white mb-1">
                        {format(selectedDate, 'd', { locale: es })}
                    </div>
                    <div className="text-slate-400 capitalize">
                        {format(selectedDate, "EEEE, MMMM yyyy", { locale: es })}
                    </div>
                </div>

                {/* Lista de citas */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                    {selectedDayAppointments.length > 0 ? (
                        selectedDayAppointments
                            .sort((a, b) => {
                                const timeA = a.scheduledAt ? new Date(a.scheduledAt).getTime() : 0;
                                const timeB = b.scheduledAt ? new Date(b.scheduledAt).getTime() : 0;
                                return timeA - timeB;
                            })
                            .map((lead) => (
                                <div key={lead.id} className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 transition-all relative overflow-hidden group">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600" />

                                    {/* Header de la cita */}
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                                {lead.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-white">{lead.name}</p>
                                                <p className="text-xs text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {lead.scheduledAt && format(parseISO(lead.scheduledAt), 'HH:mm')}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={clsx(
                                            "text-[10px] font-medium px-2 py-1 rounded-full",
                                            lead.status === 'scheduled' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                                            lead.status === 'rescheduled' && "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                                        )}>
                                            {lead.status === 'scheduled' ? 'Confirmada' : 'Reagendada'}
                                        </span>
                                    </div>

                                    {/* Info del prospecto */}
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 ml-[52px]">
                                        <a href={`tel:+52${lead.phone}`} className="flex items-center gap-1 text-green-400 hover:text-green-300">
                                            <Phone className="h-3 w-3" />
                                            {lead.phone}
                                        </a>
                                    </div>

                                    {/* Notas */}
                                    {lead.observations && (
                                        <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded-lg mb-3 ml-[52px]">
                                            "{lead.observations}"
                                        </div>
                                    )}

                                    {/* Acciones */}
                                    <div className="flex gap-2 ml-[52px]">
                                        <button
                                            onClick={() => handleUpdateStatus(lead, 'enrolled')}
                                            className="flex-1 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                                            title="Marcar como inscrito"
                                        >
                                            <Check className="h-3 w-3" /> Inscrito
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(lead, 'no_show')}
                                            className="flex-1 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1"
                                            title="No se presentó"
                                        >
                                            <XCircle className="h-3 w-3" /> No Show
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditingAppointment(lead);
                                                setIsModalOpen(true);
                                            }}
                                            className="p-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                                            title="Editar cita"
                                        >
                                            <Edit3 className="h-3.5 w-3.5" />
                                        </button>
                                        <Link
                                            href="/whatsapp"
                                            className="p-1.5 bg-green-600/20 hover:bg-green-600/40 text-green-400 rounded-lg transition-colors"
                                            title="Enviar WhatsApp"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <div className="h-16 w-16 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                                <CalendarIcon className="h-8 w-8 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No hay citas</p>
                            <p className="text-slate-600 text-sm">para este día</p>
                        </div>
                    )}
                </div>

                {/* Botón para agregar cita */}
                <button
                    onClick={() => {
                        setEditingAppointment(null);
                        setIsModalOpen(true);
                    }}
                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Agendar Nueva Cita
                </button>
            </div>

            {/* Modal de cita */}
            <AppointmentModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingAppointment(null);
                }}
                selectedDate={selectedDate}
                leads={allLeads}
                onSchedule={handleScheduleAppointment}
                editingAppointment={editingAppointment}
            />
        </div>
    );
}
