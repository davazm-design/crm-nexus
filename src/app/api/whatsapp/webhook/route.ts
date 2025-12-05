import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Webhook para recibir mensajes entrantes de WhatsApp via Twilio
 * Esta URL debe configurarse en Twilio: Console > Messaging > Settings > WhatsApp Sandbox
 * 
 * Twilio envía datos como application/x-www-form-urlencoded
 */
export async function POST(request: NextRequest) {
    try {
        // Parsear el body como form data
        const formData = await request.formData();

        // Extraer datos del mensaje entrante
        const from = formData.get('From')?.toString() || '';  // whatsapp:+5215512345678
        const body = formData.get('Body')?.toString() || '';
        const messageSid = formData.get('MessageSid')?.toString() || '';

        // Limpiar el número de teléfono (quitar "whatsapp:")
        const phoneNumber = from.replace('whatsapp:', '');

        console.log(`📥 Incoming WhatsApp message from ${phoneNumber}: ${body}`);

        // Buscar el lead por número de teléfono
        // Intentamos varias variantes del número por si hay diferencias de formato
        const phoneVariants = [
            phoneNumber,
            phoneNumber.replace('+', ''),
            phoneNumber.replace('+52', '52'),
            phoneNumber.replace('+521', '52'),
        ];

        const lead = await prisma.lead.findFirst({
            where: {
                OR: phoneVariants.map(phone => ({ phone: { contains: phone.slice(-10) } }))
            }
        });

        if (lead) {
            // Guardar el mensaje en el historial del lead
            await prisma.message.create({
                data: {
                    leadId: lead.id,
                    content: body,
                    sender: 'prospect',
                    timestamp: new Date(),
                },
            });
            console.log(`✅ Message saved to lead ${lead.id}`);
        } else {
            console.log(`⚠️ No lead found for phone ${phoneNumber}. Message not saved.`);
            // Opcionalmente, podrías crear un lead nuevo automáticamente aquí
        }

        // Twilio espera una respuesta TwiML vacía para confirmar recepción
        // Si quisieras responder automáticamente, usarías TwiML aquí
        return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/xml',
                },
            }
        );

    } catch (error: any) {
        console.error('Error in WhatsApp webhook:', error);
        // Aún así respondemos con TwiML vacío para evitar reintentos de Twilio
        return new NextResponse(
            '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
            {
                status: 200,
                headers: {
                    'Content-Type': 'text/xml',
                },
            }
        );
    }
}

// GET: Verificación del webhook (Twilio a veces hace GET para verificar)
export async function GET() {
    return NextResponse.json({
        status: 'ok',
        message: 'WhatsApp webhook is ready'
    });
}
