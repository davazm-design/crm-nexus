import { useState, useEffect, useCallback } from 'react';
import { Lead } from '@/types';

export function useLeads() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/leads');
            if (!res.ok) throw new Error('Failed to fetch leads');
            const data = await res.json();
            setLeads(data);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Error al cargar los prospectos');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const addLead = async (leadData: Partial<Lead>) => {
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create lead');
            }

            const newLead = await res.json();
            setLeads(prev => [...prev, newLead]);
            return newLead;
        } catch (err: any) {
            console.error(err);
            throw err;
        }
    };

    const updateLead = async (id: string, updates: Partial<Lead>) => {
        // Optimistic update
        const previousLeads = [...leads];
        setLeads(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));

        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (!res.ok) {
                throw new Error('Failed to update lead');
            }

            const updatedLead = await res.json();
            // Confirm with server data
            setLeads(prev => prev.map(l => l.id === id ? updatedLead : l));
            return updatedLead;
        } catch (err) {
            console.error(err);
            // Rollback
            setLeads(previousLeads);
            throw err;
        }
    };

    const deleteLead = async (id: string) => {
        // Optimistic update
        const previousLeads = [...leads];
        setLeads(prev => prev.filter(l => l.id !== id));

        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                throw new Error('Failed to delete lead');
            }
        } catch (err) {
            console.error(err);
            // Rollback
            setLeads(previousLeads);
            throw err;
        }
    };

    return {
        leads,
        loading,
        error,
        fetchLeads,
        addLead,
        updateLead,
        deleteLead
    };
}
