import { SourceCode } from '@/lib/sources';
import { BusinessUnitId } from '@/lib/businessUnits';

export type LeadStatus =
    | 'new'
    | 'cleaned'
    | 'contacted'
    | 'in_conversation'
    | 'scheduled'
    | 'no_show'
    | 'rescheduled'
    | 'enrolled'
    | 'not_enrolled';

export type LeadPriority = 'hot' | 'warm' | 'cold';

export type InterestCycle =
    | 'Enero 2025' | 'Mayo 2025' | 'Septiembre 2025'
    | 'Enero 2026' | 'Mayo 2026' | 'Septiembre 2026'
    | 'Enero 2027' | 'Mayo 2027' | 'Septiembre 2027';

export type { BusinessUnitId }; // Re-export for convenience if needed

export type MessageSender = 'executive' | 'prospect';

export interface Message {
    id: string;
    sender: MessageSender;
    content: string;
    timestamp: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email: string;
    source: SourceCode | string; // Allow string for legacy/import but prefer SourceCode
    createdAt: string;
    scheduledAt?: string;
    status: LeadStatus;
    priority?: LeadPriority;
    interestCycle?: InterestCycle;
    businessUnit?: BusinessUnitId;
    tags: string[];
    observations: string;
    history: Message[];
}

export interface Settings {
    // Add settings here if needed
}

export interface DB {
    leads: Lead[];
    settings: Settings;
}
