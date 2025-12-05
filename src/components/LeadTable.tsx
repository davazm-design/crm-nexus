'use client';

import { useEffect, useState, useRef } from 'react';
import { Lead, LeadStatus, LeadPriority } from '@/types';
import { StatusBadge } from './StatusBadge';
import { MoreHorizontal, Phone, Mail, Calendar, Search, Filter, Download, Trash2, Edit, X, Flame, Zap, Snowflake, Users, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import clsx from 'clsx';
import { AddLeadModal } from './AddLeadModal';
import { getSourceName, getSourceOptions } from '@/lib/sources';
import { getBusinessUnit, getBusinessUnitOptions } from '@/lib/businessUnits';
import { useLeads } from '@/hooks/useLeads';

// --- Lead Priority Display Logic ---
const getLeadPriorityDisplay = (priority?: LeadPriority) => {
    if (!priority) priority = 'warm'; // Default to warm if not set

    const displays = {
        hot: { label: 'Hot 🔥', color: 'text-orange-400', bg: 'bg-orange-400/10', icon: Flame },
        warm: { label: 'Warm ⚡', color: 'text-yellow-400', bg: 'bg-yellow-400/10', icon: Zap },
        cold: { label: 'Cold ❄️', color: 'text-blue-300', bg: 'bg-blue-400/10', icon: Snowflake },
    };

    return displays[priority];
};

export function LeadTable() {
    const { leads, loading, deleteLead, updateLead, addLead } = useLeads();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeActionId, setActiveActionId] = useState<string | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const handleAddLead = async (leadData: Partial<Lead>) => {
        try {
            await addLead(leadData);
            setIsCreateModalOpen(false);
        } catch (error) {
            alert('Error al crear el prospecto');
        }
    };

    // Filters State
    const [showFilters, setShowFilters] = useState(false);
    const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
    const [sourceFilter, setSourceFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<LeadPriority | 'all'>('all');
    const [businessUnitFilter, setBusinessUnitFilter] = useState<string>('all');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(50);

    // Selection State
    const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

    // --- Column Resizing State ---
    const [columnWidths, setColumnWidths] = useState({
        checkbox: 48,
        priority: 100,
        prospect: 250,
        contact: 200,
        status: 120,
        source: 120,
        unit: 120,
        date: 120,
        actions: 80
    });

    const resizingRef = useRef<{ column: string, startX: number, startWidth: number } | null>(null);

    const startResize = (e: React.MouseEvent, column: string) => {
        e.preventDefault();
        e.stopPropagation();
        resizingRef.current = {
            column,
            startX: e.pageX,
            startWidth: columnWidths[column as keyof typeof columnWidths]
        };
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = 'col-resize';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!resizingRef.current) return;
        const { column, startX, startWidth } = resizingRef.current;
        const diff = e.pageX - startX;
        const newWidth = Math.max(30, startWidth + diff); // Min width 30px

        setColumnWidths(prev => ({
            ...prev,
            [column]: newWidth
        }));
    };

    const handleMouseUp = () => {
        resizingRef.current = null;
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
    };

    const actionMenuRef = useRef<HTMLDivElement>(null);

    // Close action menu when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
                setActiveActionId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar este prospecto?')) return;

        try {
            await deleteLead(id);
            setActiveActionId(null);
        } catch (error) {
            alert('Error al eliminar el prospecto');
        }
    };

    const handleEdit = (lead: Lead) => {
        setEditingLead(lead);
        setActiveActionId(null);
    };

    const handleSaveEdit = async (updatedData: Partial<Lead>) => {
        if (!editingLead) return;

        try {
            await updateLead(editingLead.id, updatedData);
            setEditingLead(null);
        } catch (error) {
            alert('Error al actualizar el prospecto');
        }
    };

    const handleDeleteAll = async () => {
        const confirmMessage = `⚠️ ADVERTENCIA: Estás a punto de eliminar TODOS los ${leads.length} prospectos.\n\nEsta acción NO se puede deshacer.\n\n¿Estás absolutamente seguro?`;

        if (!confirm(confirmMessage)) return;

        const doubleConfirm = prompt('Escribe "ELIMINAR TODO" para confirmar:');
        if (doubleConfirm !== 'ELIMINAR TODO') {
            alert('Operación cancelada');
            return;
        }

        try {
            const deletePromises = leads.map(lead => deleteLead(lead.id));
            await Promise.all(deletePromises);
            alert(`✅ ${leads.length} prospectos eliminados exitosamente`);
        } catch (error) {
            alert('Error al eliminar los prospectos');
        }
    };

    // --- Selection Handlers ---
    const toggleLeadSelection = (leadId: string) => {
        setSelectedLeads(prev => {
            const newSet = new Set(prev);
            if (newSet.has(leadId)) {
                newSet.delete(leadId);
            } else {
                newSet.add(leadId);
            }
            return newSet;
        });
    };

    const toggleSelectAll = () => {
        if (selectedLeads.size === paginatedLeads.length) {
            setSelectedLeads(new Set());
        } else {
            setSelectedLeads(new Set(paginatedLeads.map(l => l.id)));
        }
    };

    const clearSelection = () => setSelectedLeads(new Set());

    // --- Bulk Actions ---
    const handleBulkDelete = async () => {
        const count = selectedLeads.size;
        if (!confirm(`¿Eliminar ${count} prospecto(s) seleccionado(s)?`)) return;

        try {
            const deletePromises = Array.from(selectedLeads).map(id => deleteLead(id));
            await Promise.all(deletePromises);
            clearSelection();
            alert(`✅ ${count} prospecto(s) eliminado(s)`);
        } catch (error) {
            alert('Error al eliminar los prospectos');
        }
    };

    const handleBulkExport = () => {
        const selectedLeadsData = leads.filter(l => selectedLeads.has(l.id));
        const dataStr = JSON.stringify(selectedLeadsData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `leads-export-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        alert(`✅ ${selectedLeads.size} prospecto(s) exportado(s)`);
    };

    const handleBulkArchive = async () => {
        const count = selectedLeads.size;
        if (!confirm(`¿Archivar ${count} prospecto(s) seleccionado(s)?`)) return;

        try {
            const selectedLeadsData = leads.filter(l => selectedLeads.has(l.id));

            const dataStr = JSON.stringify(selectedLeadsData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `archived-leads-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);

            const deletePromises = Array.from(selectedLeads).map(id => deleteLead(id));
            await Promise.all(deletePromises);
            clearSelection();
            alert(`✅ ${count} prospecto(s) archivado(s) y descargados`);
        } catch (error) {
            alert('Error al archivar los prospectos');
        }
    };

    const handleBulkPriorityChange = async (priority: LeadPriority) => {
        const count = selectedLeads.size;

        try {
            const updatePromises = Array.from(selectedLeads).map(id => updateLead(id, { priority }));
            await Promise.all(updatePromises);
            clearSelection();
            alert(`✅ Prioridad actualizada para ${count} prospecto(s)`);
        } catch (error) {
            alert('Error al actualizar la prioridad');
        }
    };

    // --- Filter Logic ---
    const filteredLeads = leads.filter(lead => {
        const matchesSearch =
            lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.phone.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || lead.status === statusFilter;
        const matchesSource = sourceFilter === 'all' || lead.source === sourceFilter;
        const matchesPriority = priorityFilter === 'all' || (lead.priority || 'warm') === priorityFilter;
        const matchesBusinessUnit = businessUnitFilter === 'all' || lead.businessUnit === businessUnitFilter;

        return matchesSearch && matchesStatus && matchesSource && matchesPriority && matchesBusinessUnit;
    });

    // --- Summary Stats ---
    const totalLeads = leads.length;
    const hotLeadsCount = leads.filter(l => (l.priority || 'warm') === 'hot').length;
    const warmLeadsCount = leads.filter(l => (l.priority || 'warm') === 'warm').length;
    const coldLeadsCount = leads.filter(l => (l.priority || 'warm') === 'cold').length;

    // --- Pagination Logic ---
    const totalPages = Math.ceil(filteredLeads.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedLeads = filteredLeads.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, sourceFilter, priorityFilter, businessUnitFilter]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary Header (Clickable Filters) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ... (Summary buttons remain same) ... */}
                <button
                    onClick={() => setPriorityFilter(priorityFilter === 'hot' ? 'all' : 'hot')}
                    className={clsx(
                        "glass p-4 rounded-xl flex items-center justify-between border-l-4 transition-all hover:scale-[1.02] cursor-pointer w-full text-left group",
                        priorityFilter === 'hot' ? "border-l-orange-500 bg-orange-500/10 ring-1 ring-orange-500/50" : "border-l-orange-500/50 hover:bg-white/5"
                    )}
                >
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold group-hover:text-orange-400 transition-colors">Hot Leads 🔥</p>
                        <p className="text-2xl font-bold text-white font-outfit">{hotLeadsCount}</p>
                    </div>
                    <Flame className={clsx("h-8 w-8 transition-colors", priorityFilter === 'hot' ? "text-orange-500" : "text-orange-500/20 group-hover:text-orange-500/50")} />
                </button>

                <button
                    onClick={() => setPriorityFilter(priorityFilter === 'warm' ? 'all' : 'warm')}
                    className={clsx(
                        "glass p-4 rounded-xl flex items-center justify-between border-l-4 transition-all hover:scale-[1.02] cursor-pointer w-full text-left group",
                        priorityFilter === 'warm' ? "border-l-yellow-500 bg-yellow-500/10 ring-1 ring-yellow-500/50" : "border-l-yellow-500/50 hover:bg-white/5"
                    )}
                >
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold group-hover:text-yellow-400 transition-colors">Warm Leads ⚡</p>
                        <p className="text-2xl font-bold text-white font-outfit">{warmLeadsCount}</p>
                    </div>
                    <Zap className={clsx("h-8 w-8 transition-colors", priorityFilter === 'warm' ? "text-yellow-500" : "text-yellow-500/20 group-hover:text-yellow-500/50")} />
                </button>

                <button
                    onClick={() => setPriorityFilter(priorityFilter === 'cold' ? 'all' : 'cold')}
                    className={clsx(
                        "glass p-4 rounded-xl flex items-center justify-between border-l-4 transition-all hover:scale-[1.02] cursor-pointer w-full text-left group",
                        priorityFilter === 'cold' ? "border-l-blue-400 bg-blue-400/10 ring-1 ring-blue-400/50" : "border-l-blue-400/50 hover:bg-white/5"
                    )}
                >
                    <div>
                        <p className="text-slate-400 text-xs uppercase font-bold group-hover:text-blue-300 transition-colors">Cold Leads ❄️</p>
                        <p className="text-2xl font-bold text-white font-outfit">{coldLeadsCount}</p>
                    </div>
                    <Snowflake className={clsx("h-8 w-8 transition-colors", priorityFilter === 'cold' ? "text-blue-400" : "text-blue-400/20 group-hover:text-blue-400/50")} />
                </button>
            </div>

            {/* Toolbar */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 p-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar por nombre, correo o teléfono..."
                            className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg pl-10 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent placeholder:text-slate-500 transition-all"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Items Per Page Selector */}
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                            <option value={100}>100 por página</option>
                        </select>

                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={clsx(
                                "flex items-center gap-2 px-3 py-2 border rounded-lg text-sm transition-colors",
                                showFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-900/50 border-slate-700/50 text-slate-300 hover:bg-slate-800"
                            )}
                        >
                            <Filter className="h-4 w-4" />
                            Filtros
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg text-sm text-slate-300 hover:bg-slate-800 transition-colors">
                            <Download className="h-4 w-4" />
                            Exportar
                        </button>

                        {/* Delete All Button */}
                        {leads.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="flex items-center gap-2 px-3 py-2 bg-red-900/20 border border-red-700/50 rounded-lg text-sm text-red-400 hover:bg-red-900/30 hover:border-red-600 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                                Eliminar Todo
                            </button>
                        )}

                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Plus className="h-4 w-4" />
                            Nuevo Lead
                        </button>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="glass p-4 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Estado</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as LeadStatus | 'all')}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="all">Todos los estados</option>
                                <option value="new">Nuevo</option>
                                <option value="contacted">Contactado</option>
                                <option value="scheduled">Agendado</option>
                                <option value="enrolled">Inscrito</option>
                                <option value="not_enrolled">No Inscrito</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Origen</label>
                            <select
                                value={sourceFilter}
                                onChange={(e) => setSourceFilter(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="all">Todos los orígenes</option>
                                {getSourceOptions().map(source => (
                                    <option key={source.code} value={source.code}>{source.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1">Unidad de Negocio</label>
                            <select
                                value={businessUnitFilter}
                                onChange={(e) => setBusinessUnitFilter(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            >
                                <option value="all">Todas las unidades</option>
                                {getBusinessUnitOptions().map(unit => (
                                    <option key={unit.id} value={unit.id}>{unit.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={() => {
                                    setStatusFilter('all');
                                    setSourceFilter('all');
                                    setSearchQuery('');
                                    setPriorityFilter('all');
                                    setBusinessUnitFilter('all');
                                }}
                                className="text-sm text-slate-400 hover:text-white underline"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="glass rounded-xl overflow-hidden min-h-[400px]">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-white/5 border-l border-white/5 table-fixed">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th scope="col" className="relative px-3 py-4 border-r border-white/10 text-center group" style={{ width: columnWidths.checkbox }}>
                                    <div className="flex justify-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
                                            onChange={toggleSelectAll}
                                            className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                        />
                                    </div>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'checkbox')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.priority }}>
                                    <span className="block truncate">Prioridad</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'priority')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.prospect }}>
                                    <span className="block truncate">Prospecto</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'prospect')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.contact }}>
                                    <span className="block truncate">Contacto</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'contact')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.status }}>
                                    <span className="block truncate">Estado</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'status')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.source }}>
                                    <span className="block truncate">Origen</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'source')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.unit }}>
                                    <span className="block truncate">Unidad</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'unit')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider border-r border-white/10 group overflow-hidden" style={{ width: columnWidths.date }}>
                                    <span className="block truncate">Fecha</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'date')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                                <th scope="col" className="relative px-2 py-4 w-20 text-center border-r border-white/10 group" style={{ width: columnWidths.actions }}>
                                    <span className="sr-only">Acciones</span>
                                    <div
                                        onMouseDown={(e) => startResize(e, 'actions')}
                                        className="absolute -right-2 top-0 h-full w-4 cursor-col-resize hover:bg-blue-500/50 group-hover:bg-white/10 transition-colors z-10"
                                    />
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 bg-transparent">
                            {paginatedLeads.length > 0 ? (
                                paginatedLeads.map((lead) => {
                                    const priorityDisplay = getLeadPriorityDisplay(lead.priority);
                                    return (
                                        <tr key={lead.id} className="group hover:bg-white/5 transition-colors duration-200">
                                            <td className="px-3 py-4 whitespace-nowrap border-r border-white/10">
                                                <div className="flex justify-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedLeads.has(lead.id)}
                                                        onChange={() => toggleLeadSelection(lead.id)}
                                                        className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600 focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex justify-center w-full">
                                                    <div className={clsx("flex items-center gap-2 px-2 py-1 rounded-full w-fit max-w-full min-w-0 text-xs font-bold border border-white/5", priorityDisplay.bg, priorityDisplay.color)}>
                                                        <priorityDisplay.icon className="h-3 w-3 flex-shrink-0" />
                                                        <span className="truncate min-w-0 flex-1">{priorityDisplay.label}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/20">
                                                        {lead.name.charAt(0)}
                                                    </div>
                                                    <div className="ml-4 min-w-0 flex-1">
                                                        <div
                                                            className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate cursor-pointer hover:underline"
                                                            title={lead.name}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEdit(lead);
                                                            }}
                                                        >
                                                            {lead.name}
                                                        </div>
                                                        <div className="flex gap-1 mt-1">
                                                            {lead.tags.map(tag => (
                                                                <span key={tag} className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="space-y-1">
                                                    <div className="flex items-center text-sm text-slate-300 truncate" title={lead.phone}>
                                                        <Phone className="h-3.5 w-3.5 mr-2 text-slate-500 flex-shrink-0" />
                                                        <span className="truncate min-w-0 flex-1">{lead.phone}</span>
                                                    </div>
                                                    <div className="flex items-center text-sm text-slate-400 truncate" title={lead.email}>
                                                        <Mail className="h-3.5 w-3.5 mr-2 text-slate-500 flex-shrink-0" />
                                                        <span className="truncate min-w-0 flex-1">{lead.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex justify-center w-full">
                                                    <StatusBadge status={lead.status} />
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex justify-center w-full">
                                                    <span
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-900/30 text-blue-300 border border-blue-700/50 cursor-help max-w-full"
                                                        title={getSourceName(lead.source)}
                                                    >
                                                        <span className="truncate min-w-0">{lead.source}</span>
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex justify-center w-full">
                                                    {lead.businessUnit ? (
                                                        (() => {
                                                            const unit = getBusinessUnit(lead.businessUnit);
                                                            return unit ? (
                                                                <span
                                                                    className={clsx(
                                                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border cursor-help max-w-full",
                                                                        unit.bgColor,
                                                                        unit.textColor,
                                                                        unit.borderColor
                                                                    )}
                                                                    title={`${unit.name} (${unit.level})`}
                                                                >
                                                                    <span className="truncate min-w-0">{unit.name}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-xs text-slate-500">-</span>
                                                            );
                                                        })()
                                                    ) : (
                                                        <span className="text-xs text-slate-500">Sin asignar</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-sm text-slate-400 border-r border-white/10 overflow-hidden max-w-0">
                                                <div className="flex items-center justify-center gap-2 w-full">
                                                    <Calendar className="h-4 w-4 text-slate-500 flex-shrink-0" />
                                                    <span className="truncate min-w-0">{format(new Date(lead.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                                                </div>
                                            </td>
                                            <td className="px-2 py-4 whitespace-nowrap text-center text-sm font-medium relative border-r border-white/10">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setActiveActionId(activeActionId === lead.id ? null : lead.id);
                                                    }}
                                                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                                                >
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>

                                                {/* Action Menu */}
                                                {activeActionId === lead.id && (
                                                    <div
                                                        ref={actionMenuRef}
                                                        className="absolute right-8 top-8 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden"
                                                    >
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                                                            onClick={() => handleEdit(lead)}
                                                        >
                                                            <Edit className="h-4 w-4" /> Editar
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-2"
                                                            onClick={() => handleDelete(lead.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" /> Eliminar
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <Search className="h-8 w-8 mb-3 opacity-50" />
                                            <p className="text-lg font-medium">No se encontraron prospectos</p>
                                            <p className="text-sm">Intenta con otra búsqueda o filtro</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            {filteredLeads.length > itemsPerPage && (
                <div className="glass p-4 rounded-xl flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                        Mostrando <span className="font-bold text-white">{startIndex + 1}</span> a{' '}
                        <span className="font-bold text-white">{Math.min(endIndex, filteredLeads.length)}</span> de{' '}
                        <span className="font-bold text-white">{filteredLeads.length}</span> prospectos
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                currentPage === 1
                                    ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                    : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                            )}
                        >
                            Anterior
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                                .filter(page => {
                                    // Show first page, last page, current page, and pages around current
                                    return (
                                        page === 1 ||
                                        page === totalPages ||
                                        (page >= currentPage - 1 && page <= currentPage + 1)
                                    );
                                })
                                .map((page, index, array) => {
                                    // Add ellipsis if there's a gap
                                    const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;

                                    return (
                                        <div key={page} className="flex items-center gap-1">
                                            {showEllipsisBefore && (
                                                <span className="px-2 text-slate-500">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={clsx(
                                                    "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                                    currentPage === page
                                                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 scale-110"
                                                        : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                                                )}
                                            >
                                                {page}
                                            </button>
                                        </div>
                                    );
                                })}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className={clsx(
                                "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                                currentPage === totalPages
                                    ? "bg-slate-800/50 text-slate-600 cursor-not-allowed"
                                    : "bg-slate-800 text-white hover:bg-slate-700 hover:scale-105"
                            )}
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {/* Bulk Actions Bar */}
            {selectedLeads.size > 0 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-4">
                    <div className="glass-card px-6 py-4 rounded-2xl border-2 border-blue-500/50 shadow-2xl shadow-blue-500/20 backdrop-blur-xl">
                        <div className="flex items-center gap-6">
                            {/* Selection Counter */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                                    {selectedLeads.size}
                                </div>
                                <span className="text-white font-medium">
                                    {selectedLeads.size === 1 ? 'prospecto seleccionado' : 'prospectos seleccionados'}
                                </span>
                            </div>

                            <div className="h-8 w-px bg-white/20"></div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2">
                                {/* Priority Change Dropdown */}
                                <div className="relative group">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-all hover:scale-105">
                                        <Flame className="h-4 w-4" />
                                        Prioridad
                                    </button>
                                    <div className="absolute bottom-full mb-2 left-0 hidden group-hover:block bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden min-w-[140px]">
                                        <button
                                            onClick={() => handleBulkPriorityChange('hot')}
                                            className="w-full text-left px-4 py-2 text-sm text-orange-400 hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Flame className="h-3 w-3" /> Hot
                                        </button>
                                        <button
                                            onClick={() => handleBulkPriorityChange('warm')}
                                            className="w-full text-left px-4 py-2 text-sm text-yellow-400 hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Zap className="h-3 w-3" /> Warm
                                        </button>
                                        <button
                                            onClick={() => handleBulkPriorityChange('cold')}
                                            className="w-full text-left px-4 py-2 text-sm text-blue-300 hover:bg-slate-800 flex items-center gap-2"
                                        >
                                            <Snowflake className="h-3 w-3" /> Cold
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={handleBulkExport}
                                    className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm text-white transition-all hover:scale-105"
                                >
                                    <Download className="h-4 w-4" />
                                    Exportar
                                </button>

                                <button
                                    onClick={handleBulkArchive}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-700/50 rounded-lg text-sm text-indigo-300 transition-all hover:scale-105"
                                >
                                    <Download className="h-4 w-4" />
                                    Archivar
                                </button>

                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 rounded-lg text-sm text-red-400 transition-all hover:scale-105"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Eliminar
                                </button>

                                <div className="h-8 w-px bg-white/20"></div>

                                <button
                                    onClick={clearSelection}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded-lg text-sm text-slate-400 hover:text-white transition-all"
                                >
                                    <X className="h-4 w-4" />
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <AddLeadModal
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                onSave={handleSaveEdit}
                initialData={editingLead}
            />

            <AddLeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSave={handleAddLead}
            />
        </div>
    );
}
