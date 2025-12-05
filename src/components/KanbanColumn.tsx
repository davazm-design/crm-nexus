'use client';

import { useDroppable } from '@dnd-kit/core';
import { Lead } from '@/types';
import { KanbanCard } from './KanbanCard';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import clsx from 'clsx';

interface KanbanColumnProps {
    id: string;
    title: string;
    leads: Lead[];
    color?: string;
    onEdit?: (lead: Lead) => void;
}

export function KanbanColumn({ id, title, leads, color = 'bg-slate-500', onEdit }: KanbanColumnProps) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    return (
        <div
            ref={setNodeRef}
            className={clsx(
                "flex h-full w-80 min-w-[20rem] flex-col rounded-2xl border transition-colors duration-200",
                isOver ? "bg-slate-800/50 border-blue-500/30" : "bg-slate-900/40 border-white/5"
            )}
        >
            <div className="p-4 flex justify-between items-center sticky top-0 bg-inherit rounded-t-2xl z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                    <div className={clsx("h-2 w-2 rounded-full", color)}></div>
                    <h3 className="font-semibold text-slate-200 text-sm uppercase tracking-wide">{title}</h3>
                </div>
                <span className="bg-white/5 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full border border-white/5">
                    {leads.length}
                </span>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                <SortableContext items={leads.map(l => l.id)} strategy={verticalListSortingStrategy}>
                    {leads.map((lead) => (
                        <KanbanCard key={lead.id} lead={lead} onEdit={onEdit} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
}
