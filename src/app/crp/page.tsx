'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

export default function CRPPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ added: number; duplicates: number } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [dragActive, setDragActive] = useState(false);
    const router = useRouter();

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Error al procesar el archivo');
            }

            const data = await response.json();
            setResult(data);
            setFile(null);
            // Refresh leads data or redirect after short delay
            setTimeout(() => router.push('/leads'), 3000);
        } catch (err) {
            setError('Hubo un error al subir el archivo. Asegúrate de que sea un CSV o Excel válido.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold text-white font-outfit">Centro de Recepción de Prospectos</h2>
                <p className="text-slate-400 max-w-xl mx-auto">
                    Importa, limpia y normaliza tus bases de datos de Facebook Leads automáticamente.
                </p>
            </div>

            <div className="glass-card rounded-2xl p-8 md:p-12">
                <div
                    className={clsx(
                        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-12 transition-all duration-300",
                        dragActive
                            ? "border-blue-500 bg-blue-500/5 scale-[1.02]"
                            : "border-slate-700 hover:border-blue-500/50 hover:bg-slate-800/50"
                    )}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 shadow-xl">
                        <FileSpreadsheet className="h-10 w-10 text-blue-500" />
                    </div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                        Arrastra tu archivo aquí
                    </h3>
                    <p className="text-slate-400 mb-8 text-center max-w-sm">
                        O haz clic para seleccionar desde tu ordenador. Soportamos archivos .csv, .xlsx y .xls
                    </p>

                    <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                    />
                    <label
                        htmlFor="file-upload"
                        className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                    >
                        Seleccionar Archivo
                    </label>
                </div>

                {file && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-4">
                                    <FileSpreadsheet className="h-5 w-5 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">{file.name}</p>
                                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setFile(null)}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="flex items-center bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-500/20"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-4 w-4 mr-2" />
                                            Procesar Archivo
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {result && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex items-start">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mr-4">
                                <CheckCircle className="h-5 w-5 text-emerald-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-medium text-emerald-400 mb-1">¡Importación Exitosa!</h4>
                                <p className="text-emerald-200/80 mb-4">
                                    Hemos procesado tu archivo correctamente. Aquí está el resumen:
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                                        <span className="block text-2xl font-bold text-emerald-400">{result.added}</span>
                                        <span className="text-xs text-emerald-200/60 uppercase tracking-wider">Nuevos Leads</span>
                                    </div>
                                    <div className="bg-emerald-500/10 rounded-lg p-3 text-center">
                                        <span className="block text-2xl font-bold text-emerald-400">{result.duplicates}</span>
                                        <span className="text-xs text-emerald-200/60 uppercase tracking-wider">Duplicados</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-3 mt-0.5" />
                            <div className="text-left">
                                <h4 className="text-sm font-medium text-red-400">Error en la importación</h4>
                                <p className="text-sm text-red-300/80 mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
