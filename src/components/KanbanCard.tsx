'use client';
import { memo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Lead } from '@/types';
import { Phone, Calendar, MoreHorizontal, Building2, CalendarClock, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { getBusinessUnit } from '@/lib/businessUnits';
import clsx from 'clsx';

interface KanbanCardProps {
    lead: Lead;
    onEdit?: (lead: Lead) => void;
}

export function KanbanCard({ lead, onEdit }: KanbanCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: lead.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const businessUnit = lead.businessUnit ? getBusinessUnit(lead.businessUnit) : null;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={clsx(
                "group relative bg-slate-800/50 backdrop-blur-sm p-4 rounded-xl border border-white/5 hover:border-blue-500/30 cursor-grab active:cursor-grabbing transition-all duration-200",
                isDragging ? "shadow-2xl shadow-blue-500/20 rotate-2 scale-105 z-50 ring-2 ring-blue-500/50" : "shadow-sm hover:shadow-md hover:-translate-y-1"
            )}
        >
            <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-blue-500/20">
                            {lead.name.charAt(0)}
                        </div>
                        {/* Badge de mensaje nuevo */}
                        {lead.hasUnreadMessages && (
                            <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full flex items-center justify-center animate-pulse ring-2 ring-slate-800" title="Nuevo mensaje">
                                <MessageCircle className="h-2.5 w-2.5 text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <div
                            className="font-medium text-slate-200 text-sm cursor-pointer hover:text-blue-400 hover:underline transition-colors"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit?.(lead);
                            }}
                        >
                            {lead.name}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(lead.createdAt), 'MMM d')}
                        </div>
                    </div>
                </div>
                <button
                    className="text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit?.(lead);
                    }}
                >
                    <MoreHorizontal className="h-4 w-4" />
                </button>
            </div>

            <div className="space-y-2">
                <div className="text-xs text-slate-400 flex items-center gap-2 bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    <Phone className="h-3 w-3 text-slate-500" /> {lead.phone}
                </div>

                {/* Business Unit & Interest Cycle */}
                {(businessUnit || lead.interestCycle) && (
                    <div className="flex flex-wrap gap-2">
                        {businessUnit && (
                            <div className={clsx(
                                "text-[10px] font-bold px-2 py-1 rounded-md border flex items-center gap-1.5",
                                businessUnit.bgColor,
                                businessUnit.textColor,
                                businessUnit.borderColor
                            )}>
                                <Building2 className="h-3 w-3" />
                                {businessUnit.name}
                            </div>
                        )}

                        {lead.interestCycle && (
                            <div className="text-[10px] font-medium text-slate-400 flex items-center gap-1.5 px-2 py-1 bg-slate-900/30 rounded-md border border-slate-800">
                                <CalendarClock className="h-3 w-3 text-slate-500" />
                                {lead.interestCycle}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                    {lead.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                            {tag}
                        </span>
                    ))}
                    {lead.tags.length > 3 && (
                        <span className="text-[10px] font-medium bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                            +{lead.tags.length - 3}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
