import { CalendarView } from '@/components/CalendarView';

export default function CalendarPage() {
    return (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
            <div>
                <h2 className="text-2xl font-bold text-white">Calendario de Citas</h2>
                <p className="text-slate-400">Visualiza y gestiona las citas programadas.</p>
            </div>

            <div className="flex-1 overflow-hidden">
                <CalendarView />
            </div>
        </div>
    );
}
