import { Lead } from '@/types';

export function normalizeName(name: string): string {
    if (!name) return '';
    return name
        .toLowerCase()
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
        .trim();
}

export function normalizePhone(phone: string): string {
    if (!phone) return '';
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    // Basic normalization for Mexico (assuming mostly MX leads based on user language)
    // If it starts with 52 and has 12 digits, keep it. If 10 digits, add 52? 
    // For now, let's just keep digits to be safe, maybe format if needed for display.
    return digits;
}

export function isDuplicate(lead: Partial<Lead>, existingLeads: Lead[]): boolean {
    return existingLeads.some(
        (existing) =>
            (lead.email && existing.email === lead.email) ||
            (lead.phone && existing.phone === lead.phone)
    );
}
