'use client';

import { signIn } from "next-auth/react";
import { useState } from "react";
import { Github, Mail, Loader2, Shield, Lock } from "lucide-react";

export default function LoginPage() {
    const [loading, setLoading] = useState<string | null>(null);

    const handleSignIn = async (provider: string) => {
        setLoading(provider);
        try {
            await signIn(provider, { callbackUrl: "/" });
        } catch (error) {
            console.error("Error signing in:", error);
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[120px]" />
            </div>

            {/* Login Card */}
            <div className="relative w-full max-w-md">
                <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8">
                    {/* Logo & Title */}
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 mb-4">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            TEEM CRM
                        </h1>
                        <p className="text-slate-400 text-sm">
                            Sistema de Gestión de Leads
                        </p>
                    </div>

                    {/* Security Badge */}
                    <div className="flex items-center justify-center gap-2 mb-6 py-3 px-4 bg-slate-800/50 rounded-lg border border-white/5">
                        <Lock className="h-4 w-4 text-green-400" />
                        <span className="text-xs text-slate-400">
                            Conexión segura encriptada
                        </span>
                    </div>

                    {/* Login Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => handleSignIn("github")}
                            disabled={loading !== null}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-white/10 rounded-xl text-white font-medium transition-all duration-200"
                        >
                            {loading === "github" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Github className="h-5 w-5" />
                            )}
                            Continuar con GitHub
                        </button>

                        <button
                            onClick={() => handleSignIn("google")}
                            disabled={loading !== null}
                            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:bg-slate-800/50 border border-white/10 rounded-xl text-white font-medium transition-all duration-200"
                        >
                            {loading === "google" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Mail className="h-5 w-5 text-red-400" />
                            )}
                            Continuar con Google
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-white/10" />
                        <span className="text-xs text-slate-500">
                            Autenticación OAuth 2.0
                        </span>
                        <div className="flex-1 h-px bg-white/10" />
                    </div>

                    {/* Info */}
                    <p className="text-center text-xs text-slate-500">
                        Al iniciar sesión, aceptas nuestros términos de servicio
                        y política de privacidad.
                    </p>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    © 2025 TEEM CRM. Todos los derechos reservados.
                </p>
            </div>
        </div>
    );
}
