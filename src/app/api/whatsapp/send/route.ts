import { NextRequest, NextResponse } from 'next/server';
import { sendWhatsAppMessage, isTwilioConfigured } from '@/lib/twilio';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// Schema de validación para enviar mensaje
const SendMessageSchema = z.object({
    leadId: z.string().uuid(),
    message: z.string().min(1).max(4096),
});

// POST: Enviar mensaje de WhatsApp a un lead
export async function POST(request: NextRequest) {
    try {
        // Verificar que Twilio esté configurado
        if (!isTwilioConfigured()) {
            return NextResponse.json(
                { error: 'WhatsApp no está configurado. Contacta al administrador.' },
                { status: 503 }
            );
        }

        const body = await request.json();
        const validation = SendMessageSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Datos inválidos', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { leadId, message } = validation.data;

        // Buscar el lead en la base de datos
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
        });

        if (!lead) {
            return NextResponse.json(
                { error: 'Lead no encontrado' },
                { status: 404 }
            );
        }

        if (!lead.phone) {
            return NextResponse.json(
                { error: 'El lead no tiene número de teléfono' },
                { status: 400 }
            );
        }

        // Enviar mensaje por WhatsApp
        const result = await sendWhatsAppMessage(lead.phone, message);

        // Verificar si hubo error
        if ('error' in result) {
            return NextResponse.json(
                { error: result.error, code: result.code },
                { status: 400 }
            );
        }

        // Guardar el mensaje en el historial del lead
        const savedMessage = await prisma.message.create({
            data: {
                leadId: leadId,
                content: message,
                sender: 'executive',
                timestamp: new Date(),
            },
        });

        return NextResponse.json({
            success: true,
            messageSid: result.sid,
            savedMessage: savedMessage,
        });

    } catch (error: any) {
        console.error('Error in WhatsApp send API:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}
