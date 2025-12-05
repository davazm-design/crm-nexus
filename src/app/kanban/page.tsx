import { KanbanBoard } from '@/components/KanbanBoard';

export default function KanbanPage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Pipeline de Ventas</h2>
                <p className="text-slate-400">Arrastra y suelta los leads para avanzar en el proceso.</p>
            </div>

            <div className="flex-1 overflow-hidden">
                <KanbanBoard />
            </div>
        </div>
    );
}
