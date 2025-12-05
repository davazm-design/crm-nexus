import clsx from 'clsx';
import { LeadStatus } from '@/types';

const statusStyles: Record<LeadStatus, string> = {
    new: 'bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]',
    cleaned: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-[0_0_10px_rgba(99,102,241,0.1)]',
    contacted: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 shadow-[0_0_10px_rgba(234,179,8,0.1)]',
    in_conversation: 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]',
    scheduled: 'bg-purple-500/10 text-purple-400 border-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.1)]',
    no_show: 'bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]',
    rescheduled: 'bg-pink-500/10 text-pink-400 border-pink-500/20 shadow-[0_0_10px_rgba(236,72,153,0.1)]',
    enrolled: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    not_enrolled: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
};

const statusLabels: Record<LeadStatus, string> = {
    new: 'Nuevo',
    cleaned: 'Limpiado',
    contacted: 'Contactado',
    in_conversation: 'En Conversación',
    scheduled: 'Citado',
    no_show: 'No Asistió',
    rescheduled: 'Reprogramado',
    enrolled: 'Inscrito',
    not_enrolled: 'No Inscrito',
};

export function StatusBadge({ status }: { status: LeadStatus }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 hover:scale-105 max-w-full',
                statusStyles[status]
            )}
        >
            <span className={clsx("mr-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0", statusStyles[status].replace('bg-', 'bg-opacity-100 bg-').split(' ')[1])}></span>
            <span className="truncate">{statusLabels[status]}</span>
        </span>
    );
}
