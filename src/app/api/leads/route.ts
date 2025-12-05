import { NextResponse } from 'next/server';
import { getLeads, addLead } from '@/lib/db';
import { Lead } from '@/types';
import { createLeadSchema } from '@/lib/validations';

export async function GET() {
    const leads = await getLeads();
    return NextResponse.json(leads);
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate input
        const validation = createLeadSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation Error', details: validation.error.format() },
                { status: 400 }
            );
        }

        const newLead: Lead = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            history: [],
            // Defaults that might be overridden by validation.data
            tags: validation.data.tags || [],
            observations: validation.data.observations || '',
            status: validation.data.status || 'new',
            name: validation.data.name,
            phone: validation.data.phone,
            email: validation.data.email || '', // Ensure string
            source: validation.data.source,
            priority: validation.data.priority,
            interestCycle: validation.data.interestCycle as any, // Cast to avoid strict enum issues if any
            businessUnit: validation.data.businessUnit as any,
        };

        const createdLead = await addLead(newLead);
        return NextResponse.json(createdLead, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
