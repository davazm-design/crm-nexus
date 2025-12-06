'use client';

import { CalendarView } from '@/components/CalendarView';
import { MobileCalendar } from '@/components/MobileCalendar';
import { useMobile } from '@/components/MobileProvider';

export default function CalendarPage() {
    const { isMobile } = useMobile();

    // Vista móvil optimizada
    if (isMobile) {
        return <MobileCalendar />;
    }

    // Vista desktop
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
