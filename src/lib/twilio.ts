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
 * Formatea un número de teléfono para WhatsApp
 * - Si tiene 10 dígitos (México), agrega +521
 * - Si ya tiene +, lo deja como está
 * - Si no, agrega +
 */
function formatPhoneForWhatsApp(phone: string): string {
    // Limpiar espacios y caracteres no numéricos excepto +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // Si tiene 10 dígitos exactos (número mexicano sin código), agregar +521
    if (/^\d{10}$/.test(cleaned)) {
        return `+521${cleaned}`;
    }

    // Si ya tiene +, dejarlo
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // Si no, agregar +
    return `+${cleaned}`;
}

/**
 * Envía un mensaje de WhatsApp a un número de teléfono
 * @param to - Número de destino (puede ser 10 dígitos o formato E.164)
 * @param message - Contenido del mensaje
 * @returns El SID del mensaje enviado o null si hubo error
 */
export async function sendWhatsAppMessage(to: string, message: string): Promise<string | null> {
    if (!client) {
        console.error('Twilio client not initialized. Check your credentials.');
        return null;
    }

    try {
        const formattedPhone = formatPhoneForWhatsApp(to);
        const fromWhatsApp = `whatsapp:${whatsappNumber}`;
        const toWhatsApp = `whatsapp:${formattedPhone}`;

        console.log(`📱 Sending WhatsApp to ${toWhatsApp} from ${fromWhatsApp}`);

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
