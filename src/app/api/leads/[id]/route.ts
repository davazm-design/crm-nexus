import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET: Obtener un lead por ID con su historial de mensajes
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        const lead = await prisma.lead.findUnique({
            where: { id },
            include: { history: true },
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(lead);
    } catch (error: any) {
        console.error('Error fetching lead:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
