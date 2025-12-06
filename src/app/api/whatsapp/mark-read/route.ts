import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST: Marcar mensajes como leídos para un lead específico
 * Body: { leadId: string }
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { leadId } = body;

        if (!leadId) {
            return NextResponse.json(
                { error: 'leadId is required' },
                { status: 400 }
            );
        }

        // Marcar como leído
        await prisma.lead.update({
            where: { id: leadId },
            data: { hasUnreadMessages: false },
        });

        console.log(`✅ Messages marked as read for lead ${leadId}`);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Error marking messages as read:', error);
        return NextResponse.json(
            { error: 'Failed to mark messages as read' },
            { status: 500 }
        );
    }
}
