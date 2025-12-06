'use client';

import { useState, useEffect } from 'react';
import { X, User, Phone, PhoneCall, Mail, Globe, FileText, Flame, Zap, Snowflake, Calendar, Building2 } from 'lucide-react';
import { Lead, LeadPriority, InterestCycle, BusinessUnitId } from '@/types';
import { getBusinessUnitOptions } from '@/lib/businessUnits';
import { getSourceOptions } from '@/lib/sources';
import clsx from 'clsx';

interface AddLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (lead: Partial<Lead>) => void;
    initialData?: Lead | null;
}

export function AddLeadModal({ isOpen, onClose, onSave, initialData }: AddLeadModalProps) {
    const [formData, setFormData] = useState<{
        name: string;
        phone: string;
        email: string;
        source: string;
        observations: string;
        priority: LeadPriority;
        interestCycle?: InterestCycle;
        businessUnitId?: BusinessUnitId;
    }>({
        name: '',
        phone: '',
        email: '',
        source: '',
        observations: '',
        priority: 'warm' as LeadPriority,
        interestCycle: undefined,
        businessUnitId: undefined,
    });
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name || '',
                phone: initialData.phone || '',
                email: initialData.email || '',
                source: initialData.source || '',
                observations: initialData.observations || '',
                priority: initialData.priority || 'warm',
                interestCycle: initialData.interestCycle || undefined,
                businessUnitId: initialData.businessUnitId as BusinessUnitId || undefined,
            });
        } else {
            setFormData({ name: '', phone: '', email: '', source: '', observations: '', priority: 'warm', interestCycle: undefined, businessUnitId: undefined });
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        // Phone validation
        const cleanPhone = formData.phone.replace(/\D/g, '');
        if (cleanPhone.length !== 10) {
            setError('El teléfono debe tener exactamente 10 dígitos.');
            return;
        }

        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 pb-20 lg:pb-4">
            <div className="w-full max-w-lg max-h-[85vh] lg:max-h-[90vh] rounded-2xl bg-slate-900/95 border border-white/10 shadow-2xl shadow-black/50 overflow-hidden transform transition-all scale-100 flex flex-col">
                <div className="relative p-6 border-b border-white/5 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 flex-shrink-0">
                    <h3 className="text-xl font-bold text-white font-outfit">
                        {initialData ? 'Editar Prospecto' : 'Nuevo Prospecto'}
                    </h3>
                    <p className="text-sm text-slate-400 mt-1">
                        {initialData ? 'Actualiza la información del lead.' : 'Ingresa los datos para registrar un nuevo lead.'}
                    </p>
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                    <div className="p-6 space-y-4 overflow-y-auto flex-1">
                        <div className="space-y-4">
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Nombre Completo</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                        placeholder="Ej. Juan Pérez"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Teléfono</label>
                                    <div className="relative flex gap-2">
                                        <div className="relative flex-1">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                            <input
                                                type="tel"
                                                required
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                                placeholder="55 1234 5678"
                                                maxLength={10}
                                                onInput={(e) => {
                                                    e.currentTarget.value = e.currentTarget.value.replace(/\D/g, '').slice(0, 10);
                                                    setFormData({ ...formData, phone: e.currentTarget.value });
                                                    setError(null);
                                                }}
                                            />
                                        </div>
                                        {/* Botón de llamar - solo visible al editar */}
                                        {initialData && formData.phone && (
                                            <a
                                                href={`tel:+52${formData.phone}`}
                                                className="flex items-center justify-center w-11 h-11 bg-green-600 hover:bg-green-500 text-white rounded-xl transition-colors shadow-lg shadow-green-600/20"
                                                title="Llamar a este número"
                                            >
                                                <PhoneCall className="h-5 w-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                                <div className="group">
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                                            placeholder="correo@ejemplo.com"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Fuente / Campaña</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none z-10" />
                                    <select
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecciona una fuente...</option>
                                        {getSourceOptions().map((source) => (
                                            <option key={source.code} value={source.code}>
                                                {source.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Ciclo de Interés */}
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">
                                    Ciclo de Interés
                                    <span className="ml-2 text-xs text-amber-400">(Solo Gerente)</span>
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none z-10" />
                                    <select
                                        value={formData.interestCycle || ''}
                                        onChange={(e) => setFormData({ ...formData, interestCycle: e.target.value as InterestCycle || undefined })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={false}
                                    >
                                        <option value="">Sin asignar</option>
                                        <optgroup label="2025">
                                            <option value="Enero 2025">Enero 2025</option>
                                            <option value="Mayo 2025">Mayo 2025</option>
                                            <option value="Septiembre 2025">Septiembre 2025</option>
                                        </optgroup>
                                        <optgroup label="2026">
                                            <option value="Enero 2026">Enero 2026</option>
                                            <option value="Mayo 2026">Mayo 2026</option>
                                            <option value="Septiembre 2026">Septiembre 2026</option>
                                        </optgroup>
                                        <optgroup label="2027">
                                            <option value="Enero 2027">Enero 2027</option>
                                            <option value="Mayo 2027">Mayo 2027</option>
                                            <option value="Septiembre 2027">Septiembre 2027</option>
                                        </optgroup>
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                                <p className="mt-1 text-xs text-slate-500">
                                    Este campo será editable solo por el Gerente Comercial
                                </p>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Prioridad</label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: 'hot' })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                                            formData.priority === 'hot'
                                                ? "bg-orange-500/20 border-orange-500 text-orange-400 shadow-lg shadow-orange-500/20"
                                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-orange-500/50 hover:text-orange-400"
                                        )}
                                    >
                                        <Flame className="h-4 w-4" />
                                        <span className="text-sm font-bold">Hot</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: 'warm' })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                                            formData.priority === 'warm'
                                                ? "bg-yellow-500/20 border-yellow-500 text-yellow-400 shadow-lg shadow-yellow-500/20"
                                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-yellow-500/50 hover:text-yellow-400"
                                        )}
                                    >
                                        <Zap className="h-4 w-4" />
                                        <span className="text-sm font-bold">Warm</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, priority: 'cold' })}
                                        className={clsx(
                                            "flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all",
                                            formData.priority === 'cold'
                                                ? "bg-blue-500/20 border-blue-400 text-blue-300 shadow-lg shadow-blue-500/20"
                                                : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-blue-400/50 hover:text-blue-300"
                                        )}
                                    >
                                        <Snowflake className="h-4 w-4" />
                                        <span className="text-sm font-bold">Cold</span>
                                    </button>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Observaciones</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-3 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                                    <textarea
                                        value={formData.observations}
                                        onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all h-24 resize-none"
                                        placeholder="Notas adicionales sobre el prospecto..."
                                    />
                                </div>
                            </div>

                            {/* Unidad de Negocio */}
                            <div className="group">
                                <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider">Unidad de Negocio</label>
                                <div className="relative">
                                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors pointer-events-none z-10" />
                                    <select
                                        value={formData.businessUnitId || ''}
                                        onChange={(e) => setFormData({ ...formData, businessUnitId: e.target.value as BusinessUnitId || undefined })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
                                    >
                                        <option value="">Selecciona una unidad...</option>
                                        {getBusinessUnitOptions().map(unit => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.label}
                                            </option>
                                        ))}
                                    </select>
                                    {/* Custom dropdown arrow */}
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg className="h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="px-6 py-2 bg-red-500/10 border-t border-red-500/20">
                            <p className="text-xs text-red-400 font-medium flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400"></span>
                                {error}
                            </p>
                        </div>
                    )}

                    {/* Fixed footer with buttons */}
                    <div className="flex justify-end gap-3 p-6 pt-4 border-t border-white/5 bg-slate-900/90 flex-shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                        >
                            {initialData ? 'Guardar Cambios' : 'Crear Prospecto'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
