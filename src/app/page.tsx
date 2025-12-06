'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lead } from '@/types';
import {
  Users,
  TrendingUp,
  Calendar,
  ArrowRight,
  AlertCircle,
  Phone,
  CheckCircle2,
  Target,
  Clock,
  MessageSquare,
  Tag,
  Zap,
  BarChart3
} from 'lucide-react';
import clsx from 'clsx';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { AddLeadModal } from '@/components/AddLeadModal';
import { useMobile } from '@/components/MobileProvider';
import { MobileDashboard } from '@/components/MobileDashboard';

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const { isMobile } = useMobile();

  useEffect(() => {
    fetch('/api/leads')
      .then((res) => res.json())
      .then((data) => {
        setLeads(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch leads', err);
        setLoading(false);
      });
  }, []);

  const handleQuickAction = (action: 'call' | 'schedule' | 'tag', lead: Lead) => {
    if (action === 'schedule') {
      setSelectedLead(lead);
      setIsModalOpen(true);
    } else {
      alert(`Acción rápida: ${action} para ${lead.name} (Simulado)`);
    }
  };

  const handleSaveAppointment = async (leadData: Partial<Lead>) => {
    // Refresh leads after update
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
    setIsModalOpen(false);
    setSelectedLead(null);
  };

  const refreshLeads = async () => {
    const res = await fetch('/api/leads');
    const data = await res.json();
    setLeads(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Mostrar dashboard móvil en pantallas pequeñas
  if (isMobile) {
    return <MobileDashboard leads={leads} onRefresh={refreshLeads} />;
  }

  // --- Metrics Calculation ---
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new');
  const contactedLeads = leads.filter(l => ['contacted', 'in_conversation'].includes(l.status));
  const scheduledLeads = leads.filter(l => l.status === 'scheduled');
  const enrolledLeads = leads.filter(l => l.status === 'enrolled');

  // Active vs Inactive
  const activeStatus = ['new', 'contacted', 'in_conversation', 'scheduled'];
  const activeLeadsCount = leads.filter(l => activeStatus.includes(l.status)).length;
  const inactiveLeadsCount = totalLeads - activeLeadsCount;

  // Conversion by Channel (Source)
  const sourceStats = leads.reduce((acc, lead) => {
    const source = lead.source || 'Desconocido';
    if (!acc[source]) acc[source] = { total: 0, enrolled: 0 };
    acc[source].total++;
    if (lead.status === 'enrolled') acc[source].enrolled++;
    return acc;
  }, {} as Record<string, { total: number; enrolled: number }>);

  const sourceConversion = Object.entries(sourceStats).map(([source, stats]) => ({
    source,
    rate: stats.total > 0 ? (stats.enrolled / stats.total) * 100 : 0,
    total: stats.total
  })).sort((a, b) => b.rate - a.rate);

  // Funnel Data
  const funnelData = [
    { label: 'Nuevos', count: newLeads.length, color: 'bg-blue-500', icon: Users },
    { label: 'Contactados', count: contactedLeads.length, color: 'bg-indigo-500', icon: Phone },
    { label: 'Citas', count: scheduledLeads.length, color: 'bg-purple-500', icon: Calendar },
    { label: 'Inscritos', count: enrolledLeads.length, color: 'bg-emerald-500', icon: CheckCircle2 },
  ];

  // Goal (Hardcoded for demo)
  const monthlyGoal = 20;
  const currentProgress = enrolledLeads.length;
  const progressPercentage = Math.min((currentProgress / monthlyGoal) * 100, 100);

  // Hot Leads (New leads created in the last 24 hours)
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);
  const hotLeads = newLeads.filter(l => new Date(l.createdAt) > oneDayAgo).slice(0, 5);

  return (
    <div className="space-y-8 pb-8">
      {/* Header & Goal Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-2">
          <h2 className="text-3xl font-bold text-white font-outfit">Hola, David 👋</h2>
          <p className="text-slate-400">Tienes <span className="text-white font-bold">{hotLeads.length} Hot Leads 🔥</span> esperando tu llamada. ¡A por ellos!</p>

          {/* Quick Action Banner */}
          <div className="mt-6 flex gap-4">
            <Link href="/leads" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-[0.98]">
              <Phone className="h-5 w-5" />
              Iniciar Sesión de Llamadas
            </Link>
            <Link href="/calendar" className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-medium transition-all border border-white/5">
              <Calendar className="h-5 w-5" />
              Ver Agenda
            </Link>
          </div>
        </div>

        {/* Goal Card */}
        <div className="glass rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Target className="h-32 w-32 text-emerald-500" />
          </div>
          <div className="relative z-10">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-slate-400 text-sm font-medium uppercase tracking-wide">Meta Mensual</p>
                <h3 className="text-3xl font-bold text-white font-outfit">{currentProgress} / {monthlyGoal}</h3>
              </div>
              <span className="text-emerald-400 font-bold text-lg">{progressPercentage.toFixed(0)}%</span>
            </div>
            <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-slate-400 mt-3 flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-emerald-400" />
              Faltan {monthlyGoal - currentProgress} inscritos para el bono.
            </p>
          </div>
        </div>
      </div>

      {/* Action Center Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Funnel & Metrics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Visual Funnel */}
          <div className="glass rounded-2xl p-6 shadow-xl shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white font-outfit flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Embudo de Ventas
              </h3>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div> Activos ({activeLeadsCount})
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  <div className="h-2 w-2 rounded-full bg-slate-600"></div> Inactivos ({inactiveLeadsCount})
                </div>
              </div>
            </div>

            <div className="space-y-4 relative">
              {/* Connecting Line */}
              <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/50 via-purple-500/50 to-emerald-500/50 -z-10"></div>

              {funnelData.map((stage, idx) => {
                const prevCount = idx > 0 ? funnelData[idx - 1].count : stage.count;
                const conversion = prevCount > 0 ? ((stage.count / prevCount) * 100).toFixed(0) : '100';
                const isLast = idx === funnelData.length - 1;

                return (
                  <div key={stage.label} className="relative">
                    <div className="flex items-center gap-4 bg-slate-800/40 border border-white/5 p-4 rounded-xl hover:bg-slate-800/60 transition-colors">
                      <div className={clsx("h-10 w-10 rounded-lg flex items-center justify-center shadow-lg text-white", stage.color)}>
                        <stage.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300 font-medium">{stage.label}</span>
                          <span className="text-white font-bold text-lg">{stage.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-900 rounded-full mt-2 overflow-hidden">
                          <div
                            className={clsx("h-full rounded-full opacity-80", stage.color)}
                            style={{ width: `${(stage.count / (totalLeads || 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    {/* Conversion Badge */}
                    {!isLast && (
                      <div className="absolute left-10 -bottom-3 transform -translate-x-1/2 z-10">
                        <div className="bg-slate-900 text-[10px] font-bold text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
                          {conversion}%
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Conversion by Channel */}
          <div className="glass rounded-2xl p-6 shadow-xl shadow-black/20">
            <h3 className="text-xl font-bold text-white mb-6 font-outfit flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-400" />
              Conversión por Canal
            </h3>
            <div className="space-y-4">
              {sourceConversion.map((item) => (
                <div key={item.source} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">{item.source}</span>
                    <span className="text-slate-400">{item.rate.toFixed(1)}% ({item.total} leads)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      style={{ width: `${item.rate}%` }}
                    ></div>
                  </div>
                </div>
              ))}
              {sourceConversion.length === 0 && (
                <div className="text-center text-slate-500 py-4">No hay datos suficientes</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Urgent Actions */}
        <div className="space-y-6">
          {/* Hot Leads */}
          <div className="glass rounded-2xl p-6 border-l-4 border-l-orange-500 shadow-xl shadow-black/20">
            <h3 className="text-lg font-bold text-white font-outfit mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-orange-500" />
              Hot Leads 🔥
            </h3>
            <div className="space-y-3">
              {hotLeads.length > 0 ? (
                hotLeads.map(lead => (
                  <div key={lead.id} className="p-3 bg-slate-800/50 rounded-lg border border-white/5 group hover:border-orange-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-200">{lead.name}</p>
                          <p className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Reciente
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* Quick Actions Panel */}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => handleQuickAction('call', lead)}
                        className="flex-1 py-1.5 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Phone className="h-3 w-3" /> Llamar
                      </button>
                      <button
                        onClick={() => handleQuickAction('schedule', lead)}
                        className="flex-1 py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 text-xs font-medium rounded transition-colors flex items-center justify-center gap-1"
                      >
                        <Calendar className="h-3 w-3" /> Agendar
                      </button>
                      <button
                        onClick={() => handleQuickAction('tag', lead)}
                        className="py-1.5 px-2 bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium rounded transition-colors"
                      >
                        <Tag className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 text-center py-4">¡Todo frío! No hay Hot Leads por ahora.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedLead(null);
        }}
        onSave={handleSaveAppointment}
        initialData={selectedLead}
      />
    </div>
  );
}
