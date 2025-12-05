'use client';

import { LeadTable } from '@/components/LeadTable';

export default function LeadsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-white">Prospectos</h2>
                    <p className="text-slate-400">Gestiona y da seguimiento a tus leads</p>
                </div>
            </div>

            <LeadTable />
        </div>
    );
}
