'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Lead, LeadStatus } from '@/types';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { AddLeadModal } from './AddLeadModal';
import { useLeads } from '@/hooks/useLeads';

const COLUMNS: LeadStatus[] = [
    'new',
    'cleaned',
    'contacted',
    'in_conversation',
    'scheduled',
    'rescheduled',
    'enrolled',
    'no_show',
    'not_enrolled'
];

const COLUMN_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
    new: { label: 'Nuevo', color: 'bg-blue-500' },
    cleaned: { label: 'Limpiado', color: 'bg-indigo-500' },
    contacted: { label: 'Contactado', color: 'bg-yellow-500' },
    in_conversation: { label: 'En Conversación', color: 'bg-orange-500' },
    scheduled: { label: 'Citado', color: 'bg-purple-500' },
    no_show: { label: 'No Asistió', color: 'bg-red-500' },
    rescheduled: { label: 'Reprogramado', color: 'bg-pink-500' },
    enrolled: { label: 'Inscrito', color: 'bg-emerald-500' },
    not_enrolled: { label: 'No Inscrito', color: 'bg-slate-500' },
};

export function KanbanBoard() {
    const { leads, loading, updateLead } = useLeads();
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        // Visual feedback only, real update happens on DragEnd
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeLead = leads.find((l) => l.id === activeId);
        if (!activeLead) return;

        let newStatus: LeadStatus | null = null;

        if (COLUMNS.includes(overId as LeadStatus)) {
            newStatus = overId as LeadStatus;
        } else {
            const overLead = leads.find(l => l.id === overId);
            if (overLead) newStatus = overLead.status;
        }

        if (newStatus && activeLead.status !== newStatus) {
            try {
                await updateLead(activeId, { status: newStatus });
            } catch (error) {
                alert('Error al mover la tarjeta');
            }
        }
    };

    const handleEdit = useCallback((lead: Lead) => {
        setEditingLead(lead);
    }, []);

    const handleSaveEdit = async (updatedData: Partial<Lead>) => {
        if (!editingLead) return;

        try {
            await updateLead(editingLead.id, updatedData);
            setEditingLead(null);
        } catch (error) {
            alert('Error al actualizar el prospecto');
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
        >
            {loading ? (
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <div className="h-full overflow-x-auto pb-4">
                    <div className="flex h-full gap-6 min-w-max px-4">
                        {COLUMNS.map((status) => (
                            <KanbanColumn
                                key={status}
                                id={status}
                                title={COLUMN_CONFIG[status].label}
                                color={COLUMN_CONFIG[status].color}
                                leads={leads.filter((l) => l.status === status)}
                                onEdit={handleEdit}
                            />
                        ))}
                    </div>
                </div>
            )}
            <DragOverlay>
                {activeId ? (
                    <KanbanCard lead={leads.find(l => l.id === activeId)!} />
                ) : null}
            </DragOverlay>
            <AddLeadModal
                isOpen={!!editingLead}
                onClose={() => setEditingLead(null)}
                onSave={handleSaveEdit}
                initialData={editingLead}
            />
        </DndContext>
    );
}
