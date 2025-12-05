import { ChatInterface } from '@/components/ChatInterface';

export default function WhatsAppPage() {
    return (
        <div className="space-y-6 h-full flex flex-col">
            <div>
                <h2 className="text-3xl font-bold text-white font-outfit">Seguimiento WhatsApp</h2>
                <p className="text-slate-400">Gestiona las conversaciones con tus prospectos en tiempo real.</p>
            </div>

            <div className="flex-1">
                <ChatInterface />
            </div>
        </div>
    );
}
