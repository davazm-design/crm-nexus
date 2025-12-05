import { Lead } from '@/types';

/**
 * LeadRepository define el contrato estricto que cualquier
 * implementación de base de datos (JSON local, Supabase, Firebase, etc.)
 * debe cumplir.
 * 
 * Esto nos permite cambiar el backend sin tocar el frontend ni la lógica de negocio.
 */
export interface LeadRepository {
    /**
     * Obtiene todos los leads de la base de datos.
     */
    getAll(): Promise<Lead[]>;

    /**
     * Busca un lead por su ID.
     */
    getById(id: string): Promise<Lead | null>;

    /**
     * Crea un nuevo lead.
     * @param lead Datos del lead a crear
     */
    create(lead: Lead): Promise<Lead>;

    /**
     * Actualiza un lead existente.
     * @param id ID del lead a actualizar
     * @param updates Objeto con los campos a actualizar (parcial)
     */
    update(id: string, updates: Partial<Lead>): Promise<Lead | null>;

    /**
     * Elimina un lead por su ID.
     * @param id ID del lead a eliminar
     */
    delete(id: string): Promise<void>;
}
