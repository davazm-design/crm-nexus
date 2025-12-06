'use client';

import { useState, useEffect, useRef } from 'react';
import { Lead, LeadStatus } from '@/types';
import {
    ChevronLeft,
    ChevronRight,
    Phone,
    MessageCircle,
    Calendar,
    User,
    Building2,
    CalendarClock,
    ChevronDown,
    Check,
    Plus,
    RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import Link from 'next/link';
import { getBusinessUnit } from '@/lib/businessUnits';
import { AddLeadModal } from './AddLeadModal';
import { PullToRefresh } from './PullToRefresh';

// Configuración de columnas
const COLUMNS: { id: LeadStatus; label: string; color: string; shortLabel: string }[] = [
    { id: 'new', label: 'Nuevo', shortLabel: 'Nuevo', color: 'bg-blue-500' },
    { id: 'cleaned', label: 'Limpiado', shortLabel: 'Limpio', color: 'bg-indigo-500' },
    { id: 'contacted', label: 'Contactado', shortLabel: 'Contact.', color: 'bg-yellow-500' },
    { id: 'in_conversation', label: 'En Conversación', shortLabel: 'Convers.', color: 'bg-orange-500' },
    { id: 'scheduled', label: 'Citado', shortLabel: 'Citado', color: 'bg-purple-500' },
    { id: 'rescheduled', label: 'Reprogramado', shortLabel: 'Reprog.', color: 'bg-pink-500' },
    { id: 'enrolled', label: 'Inscrito', shortLabel: 'Inscrito', color: 'bg-emerald-500' },
    { id: 'no_show', label: 'No Asistió', shortLabel: 'No Show', color: 'bg-red-500' },
    { id: 'not_enrolled', label: 'No Inscrito', shortLabel: 'No Insc.', color: 'bg-slate-500' },
];

export function MobileKanban() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeColumnIndex, setActiveColumnIndex] = useState(0);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [showStatusSelector, setShowStatusSelector] = useState<string | null>(null);
    const tabsRef = useRef<HTMLDivElement>(null);

    const fetchLeads = async () => {
        try {
            const res = await fetch('/api/leads');
            const data = await res.json();
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLeads();
    }, []);

    // Scroll tabs para mostrar el tab activo
    useEffect(() => {
        if (tabsRef.current) {
            const activeTab = tabsRef.current.children[activeColumnIndex] as HTMLElement;
            if (activeTab) {
                activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
            }
        }
    }, [activeColumnIndex]);

    const activeColumn = COLUMNS[activeColumnIndex];
    const columnLeads = leads.filter(l => l.status === activeColumn.id);

    const handlePrevColumn = () => {
        setActiveColumnIndex(prev => Math.max(0, prev - 1));
    };

    const handleNextColumn = () => {
        setActiveColumnIndex(prev => Math.min(COLUMNS.length - 1, prev + 1));
    };

    const handleChangeStatus = async (leadId: string, newStatus: LeadStatus) => {
        try {
            const res = await fetch(`/api/leads/${leadId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            if (res.ok) {
                setLeads(prev => prev.map(l =>
                    l.id === leadId ? { ...l, status: newStatus } : l
                ));
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
        setShowStatusSelector(null);
    };

    const handleSaveEdit = async (updatedData: Partial<Lead>) => {
        if (!editingLead) return;
        try {
            const res = await fetch(`/api/leads/${editingLead.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (res.ok) {
                await fetchLeads();
            }
        } catch (error) {
            console.error('Error updating lead:', error);
        }
        setEditingLead(null);
    };

    // Contar leads por columna
    const getColumnCount = (columnId: LeadStatus) => {
        return leads.filter(l => l.status === columnId).length;
    };

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
            <div className="sticky top-0 bg-slate-950/95 backdrop-blur-lg z-20 border-b border-white/5">
                <div className="p-4 pb-2">
                    <h1 className="text-lg font-bold text-white">Pipeline de Ventas</h1>
                    <p className="text-xs text-slate-500">
                        {leads.length} prospectos en total
                    </p>
                </div>

                {/* Tabs de columnas */}
                <div className="relative">
                    <div
                        ref={tabsRef}
                        className="flex overflow-x-auto gap-1 px-4 pb-3 scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {COLUMNS.map((col, index) => {
                            const count = getColumnCount(col.id);
                            const isActive = index === activeColumnIndex;
                            return (
                                <button
                                    key={col.id}
                                    onClick={() => setActiveColumnIndex(index)}
                                    className={clsx(
                                        "flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5",
                                        isActive
                                            ? "bg-white/10 text-white"
                                            : "text-slate-500 active:bg-white/5"
                                    )}
                                >
                                    <div className={clsx("h-2 w-2 rounded-full", col.color)} />
                                    {col.shortLabel}
                                    {count > 0 && (
                                        <span className={clsx(
                                            "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                                            isActive ? "bg-white/20" : "bg-slate-800"
                                        )}>
                                            {count}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Navegación entre columnas */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-900/50 border-b border-white/5">
                <button
                    onClick={handlePrevColumn}
                    disabled={activeColumnIndex === 0}
                    className={clsx(
                        "p-2 rounded-lg transition-colors",
                        activeColumnIndex === 0
                            ? "text-slate-700"
                            : "text-slate-400 active:bg-white/10"
                    )}
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-2">
                    <div className={clsx("h-3 w-3 rounded-full", activeColumn.color)} />
                    <span className="text-sm font-semibold text-white">{activeColumn.label}</span>
                    <span className="text-xs text-slate-500">({columnLeads.length})</span>
                </div>

                <button
                    onClick={handleNextColumn}
                    disabled={activeColumnIndex === COLUMNS.length - 1}
                    className={clsx(
                        "p-2 rounded-lg transition-colors",
                        activeColumnIndex === COLUMNS.length - 1
                            ? "text-slate-700"
                            : "text-slate-400 active:bg-white/10"
                    )}
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>

            {/* Lista de leads */}
            <div className="p-4 space-y-3">
                {columnLeads.length > 0 ? (
                    columnLeads.map(lead => (
                        <MobileKanbanCard
                            key={lead.id}
                            lead={lead}
                            onEdit={() => setEditingLead(lead)}
                            onChangeStatus={() => setShowStatusSelector(lead.id)}
                            showStatusSelector={showStatusSelector === lead.id}
                            onSelectStatus={(status) => handleChangeStatus(lead.id, status)}
                            onCloseSelector={() => setShowStatusSelector(null)}
                            columns={COLUMNS}
                        />
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="h-20 w-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                            <User className="h-10 w-10 text-slate-600" />
                        </div>
                        <p className="text-slate-400 font-medium text-lg mb-1">
                            Sin prospectos
                        </p>
                        <p className="text-slate-600 text-sm">
                            No hay leads en "{activeColumn.label}"
                        </p>
                    </div>
                )}
            </div>

            {/* Modal de edición */}
            <AddLeadModal
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                onSave={handleSaveEdit}
                initialData={editingLead}
            />
        </PullToRefresh >
    );
}

// Componente de tarjeta optimizado para móvil
interface MobileKanbanCardProps {
    lead: Lead;
    onEdit: () => void;
    onChangeStatus: () => void;
    showStatusSelector: boolean;
    onSelectStatus: (status: LeadStatus) => void;
    onCloseSelector: () => void;
    columns: typeof COLUMNS;
}

function MobileKanbanCard({
    lead,
    onEdit,
    onChangeStatus,
    showStatusSelector,
    onSelectStatus,
    onCloseSelector,
    columns
}: MobileKanbanCardProps) {
    const businessUnit = lead.businessUnit ? getBusinessUnit(lead.businessUnit) : null;

    return (
        <div className="bg-slate-900/70 rounded-xl border border-white/5 overflow-hidden">
            {/* Header de la tarjeta */}
            <div className="p-4">
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {lead.name.charAt(0)}
                        </div>
                        {lead.hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-green-500 rounded-full flex items-center justify-center animate-pulse ring-2 ring-slate-900">
                                <MessageCircle className="h-3 w-3 text-white" />
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <button
                            onClick={onEdit}
                            className="text-base font-semibold text-white hover:text-blue-400 transition-colors text-left"
                        >
                            {lead.name}
                        </button>
                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.createdAt), "d 'de' MMM", { locale: es })}
                        </p>
                    </div>

                    {/* Botón de cambiar status */}
                    <button
                        onClick={onChangeStatus}
                        className="p-2 bg-slate-800 rounded-lg text-slate-400 active:bg-slate-700 flex items-center gap-1"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                </div>

                {/* Teléfono */}
                <a
                    href={`tel:+52${lead.phone}`}
                    className="mt-3 flex items-center gap-2 text-sm text-slate-300 bg-slate-800/50 p-2.5 rounded-lg active:bg-green-500/20"
                >
                    <Phone className="h-4 w-4 text-green-400" />
                    {lead.phone}
                </a>

                {/* Tags de unidad de negocio y ciclo */}
                {(businessUnit || lead.interestCycle) && (
                    <div className="flex flex-wrap gap-2 mt-3">
                        {businessUnit && (
                            <div className={clsx(
                                "text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1",
                                businessUnit.bgColor,
                                businessUnit.textColor,
                                businessUnit.borderColor
                            )}>
                                <Building2 className="h-3 w-3" />
                                {businessUnit.name}
                            </div>
                        )}
                        {lead.interestCycle && (
                            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1 px-2 py-1 bg-slate-800 rounded-md">
                                <CalendarClock className="h-3 w-3" />
                                {lead.interestCycle}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Acciones rápidas */}
            <div className="flex border-t border-white/5">
                <a
                    href={`tel:+52${lead.phone}`}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-green-400 text-sm font-medium active:bg-green-500/10 border-r border-white/5"
                >
                    <Phone className="h-4 w-4" />
                    Llamar
                </a>
                <Link
                    href="/whatsapp"
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-emerald-400 text-sm font-medium active:bg-emerald-500/10 border-r border-white/5"
                >
                    <MessageCircle className="h-4 w-4" />
                    Chat
                </Link>
                <button
                    onClick={onEdit}
                    className="flex-1 py-3 flex items-center justify-center gap-2 text-blue-400 text-sm font-medium active:bg-blue-500/10"
                >
                    <User className="h-4 w-4" />
                    Editar
                </button>
            </div>

            {/* Selector de status (modal inline) */}
            {showStatusSelector && (
                <div className="border-t border-white/5 bg-slate-800/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400 font-medium">Mover a:</span>
                        <button
                            onClick={onCloseSelector}
                            className="text-xs text-slate-500 active:text-white"
                        >
                            Cancelar
                        </button>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {columns.map(col => (
                            <button
                                key={col.id}
                                onClick={() => onSelectStatus(col.id)}
                                disabled={lead.status === col.id}
                                className={clsx(
                                    "p-2 rounded-lg text-[10px] font-medium flex items-center justify-center gap-1 transition-all",
                                    lead.status === col.id
                                        ? "bg-white/10 text-white ring-1 ring-white/20"
                                        : "bg-slate-700/50 text-slate-300 active:bg-slate-600"
                                )}
                            >
                                <div className={clsx("h-2 w-2 rounded-full flex-shrink-0", col.color)} />
                                <span className="truncate">{col.shortLabel}</span>
                                {lead.status === col.id && <Check className="h-3 w-3 text-green-400 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
