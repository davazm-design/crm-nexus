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
    subMonths
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Clock, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import clsx from 'clsx';
import { AddLeadModal } from './AddLeadModal';

export function CalendarView() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [leads, setLeads] = useState<Lead[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetch('/api/leads')
            .then((res) => res.json())
            .then((data: Lead[]) => {
                setLeads(data.filter(l => l.status === 'scheduled'));
            });
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
            const dateToCompare = lead.scheduledAt ? new Date(lead.scheduledAt) : new Date(lead.createdAt);
            return isSameDay(dateToCompare, day);
        });
    };

    const handleAddAppointment = async (leadData: Partial<Lead>) => {
        if (!selectedDate) return;

        // Set time to 9:00 AM by default for the selected date
        const appointmentDate = new Date(selectedDate);
        appointmentDate.setHours(9, 0, 0, 0);

        const newLead = {
            ...leadData,
            status: 'scheduled' as const,
            scheduledAt: appointmentDate.toISOString(),
            createdAt: new Date().toISOString(),
        };

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newLead),
            });

            if (res.ok) {
                const createdLead = await res.json();
                setLeads([...leads, createdLead]);
                setIsModalOpen(false);
            }
        } catch (error) {
            console.error('Error creating appointment', error);
        }
    };

    return (
        <div className="flex h-full gap-6 flex-col lg:flex-row">
            <div className="flex-1 glass rounded-2xl p-6 shadow-xl shadow-black/20">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-600/10 flex items-center justify-center">
                            <CalendarIcon className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white capitalize font-outfit">
                                {format(currentMonth, 'MMMM yyyy', { locale: es })}
                            </h2>
                            <p className="text-slate-400 text-sm">Gestiona tus citas y eventos</p>
                        </div>
                    </div>
                    <div className="flex gap-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
                        <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 gap-4 mb-4">
                    {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                        <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 gap-2 lg:gap-4">
                    {days.map((day, dayIdx) => {
                        const dayLeads = getLeadsForDay(day);
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, monthStart);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                onClick={() => setSelectedDate(day)}
                                className={clsx(
                                    'min-h-[100px] rounded-xl p-3 cursor-pointer transition-all duration-200 flex flex-col justify-between group relative overflow-hidden',
                                    !isCurrentMonth ? 'bg-slate-900/20 text-slate-600' : 'bg-slate-800/40 text-slate-300 hover:bg-slate-800/80',
                                    isSelected ? 'ring-2 ring-blue-500 bg-blue-500/10' : 'border border-white/5',
                                    isToday && !isSelected && 'ring-1 ring-blue-500/50'
                                )}
                            >
                                <div className="flex justify-between items-start z-10">
                                    <span className={clsx(
                                        "text-sm font-semibold h-7 w-7 flex items-center justify-center rounded-full",
                                        isToday ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30" : ""
                                    )}>
                                        {format(day, 'd')}
                                    </span>
                                    {dayLeads.length > 0 && (
                                        <span className="flex h-5 min-w-[1.25rem] px-1 items-center justify-center rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                                            {dayLeads.length}
                                        </span>
                                    )}
                                </div>
                                <div className="space-y-1 z-10">
                                    {dayLeads.slice(0, 2).map(lead => (
                                        <div key={lead.id} className="text-[10px] truncate text-blue-200 bg-blue-500/20 px-1.5 py-0.5 rounded border border-blue-500/10">
                                            {lead.name}
                                        </div>
                                    ))}
                                    {dayLeads.length > 2 && (
                                        <div className="text-[10px] text-slate-500 pl-1">
                                            +{dayLeads.length - 2} más
                                        </div>
                                    )}
                                </div>
                                {isSelected && <div className="absolute inset-0 bg-blue-500/5 pointer-events-none"></div>}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar for selected day details */}
            <div className="w-full lg:w-96 glass rounded-2xl p-6 flex flex-col h-full shadow-xl shadow-black/20">
                <h3 className="text-xl font-bold text-white mb-6 font-outfit border-b border-white/5 pb-4">
                    Agenda del Día
                </h3>

                <div className="mb-6">
                    <div className="text-4xl font-bold text-white mb-1">
                        {selectedDate ? format(selectedDate, 'd', { locale: es }) : '--'}
                    </div>
                    <div className="text-slate-400 capitalize text-lg">
                        {selectedDate ? format(selectedDate, 'EEEE, MMMM yyyy', { locale: es }) : 'Selecciona una fecha'}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 pr-2">
                    {selectedDate && getLeadsForDay(selectedDate).length > 0 ? (
                        getLeadsForDay(selectedDate).map((lead, idx) => (
                            <div key={lead.id} className="group p-4 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all duration-200 relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <div className="font-semibold text-slate-200">{lead.name}</div>
                                    <span className="text-xs font-medium bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                                        Cita
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-3.5 w-3.5 text-slate-500" />
                                        {format(new Date(lead.scheduledAt || lead.createdAt), 'HH:mm')}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                                        Oficina Central
                                    </div>
                                </div>
                                <div className="text-xs text-slate-500 bg-slate-900/50 p-2 rounded-lg border border-white/5 italic">
                                    "{lead.observations || 'Sin observaciones adicionales'}"
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-40 text-center">
                            <div className="h-12 w-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3">
                                <CalendarIcon className="h-6 w-6 text-slate-600" />
                            </div>
                            <p className="text-slate-400 font-medium">No hay citas programadas</p>
                            <p className="text-slate-600 text-sm">Para este día</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]"
                >
                    Agendar Nueva Cita
                </button>
            </div>

            <AddLeadModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleAddAppointment}
            />
        </div>
    );
}
