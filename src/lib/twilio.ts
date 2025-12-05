import twilio from 'twilio';

// Configuración del cliente Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+14155238886';

// Validar credenciales
if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials not configured. WhatsApp features will be disabled.');
}

// Cliente de Twilio (solo se instancia si hay credenciales)
const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

/**
 * Envía un mensaje de WhatsApp a un número de teléfono
 * @param to - Número de destino en formato E.164 (ej: +5215512345678)
 * @param message - Contenido del mensaje
 * @returns El SID del mensaje enviado o null si hubo error
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<string | null> {
    if (!client) {
        console.error('Twilio client not initialized. Check your credentials.');
        return null;
    }

    try {
        // Formatear números para WhatsApp
        const fromWhatsApp = `whatsapp:${whatsappNumber}`;
        const toWhatsApp = `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

        const result = await client.messages.create({
            from: fromWhatsApp,
            to: toWhatsApp,
            body: message,
        });

        console.log(`✅ WhatsApp message sent. SID: ${result.sid}`);
        return result.sid;
    } catch (error: any) {
        console.error('❌ Error sending WhatsApp message:', error.message);
        return null;
    }
}

/**
 * Envía un mensaje de plantilla (Template) de WhatsApp
 * Útil para iniciar conversaciones con usuarios que no han escrito primero
 */
export async function sendWhatsAppTemplate(
    to: string,
    contentSid: string,
    variables?: Record<string, string>
): Promise<string | null> {
    if (!client) {
        console.error('Twilio client not initialized.');
        return null;
    }

    try {
        const fromWhatsApp = `whatsapp:${whatsappNumber}`;
        const toWhatsApp = `whatsapp:${to.startsWith('+') ? to : '+' + to}`;

        const result = await client.messages.create({
            from: fromWhatsApp,
            to: toWhatsApp,
            contentSid: contentSid,
            contentVariables: variables ? JSON.stringify(variables) : undefined,
        });

        console.log(`✅ WhatsApp template sent. SID: ${result.sid}`);
        return result.sid;
    } catch (error: any) {
        console.error('❌ Error sending WhatsApp template:', error.message);
        return null;
    }
}

/**
 * Verifica si Twilio está configurado correctamente
 */
export function isTwilioConfigured(): boolean {
    return client !== null;
}

export { client };
