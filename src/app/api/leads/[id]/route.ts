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

// PATCH: Actualizar un lead
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const updates = await request.json();

        // Separar history de otros updates (history es una relación)
        const { history, ...scalarUpdates } = updates;

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: scalarUpdates,
            include: { history: true },
        });

        return NextResponse.json(updatedLead);
    } catch (error: any) {
        console.error('Error updating lead:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Lead no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Error al actualizar el prospecto' },
            { status: 500 }
        );
    }
}

// DELETE: Eliminar un lead
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // Primero eliminar los mensajes relacionados
        await prisma.message.deleteMany({
            where: { leadId: id },
        });

        // Luego eliminar el lead
        await prisma.lead.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting lead:', error);

        if (error.code === 'P2025') {
            return NextResponse.json(
                { error: 'Lead no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { error: 'Error al eliminar el prospecto' },
            { status: 500 }
        );
    }
}

