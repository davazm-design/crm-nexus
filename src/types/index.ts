import { SourceCode } from '@/lib/sources';
import { BusinessUnitId } from '@/lib/businessUnits';

// Re-export para compatibilidad
export type { BusinessUnitId };

// ============================================
// ENUMS Y TIPOS BASE
// ============================================

export type LeadStatus =
    | 'new'
    | 'cleaned'
    | 'contacted'
    | 'in_conversation'
    | 'scheduled'
    | 'no_show'
    | 'rescheduled'
    | 'enrolled'
    | 'not_enrolled';

export type LeadPriority = 'hot' | 'warm' | 'cold';

export type MessageSender = 'executive' | 'prospect';

export type InterestCycle =
    | 'Enero 2025' | 'Mayo 2025' | 'Septiembre 2025'
    | 'Enero 2026' | 'Mayo 2026' | 'Septiembre 2026'
    | 'Enero 2027' | 'Mayo 2027' | 'Septiembre 2027';

// Roles jerárquicos (de mayor a menor poder)
export type UserRole =
    | 'SUPER_ADMIN'   // Dueño del SaaS
    | 'OWNER'         // Dueño del negocio
    | 'ADMIN'         // Administrador de organización
    | 'DIRECTOR'      // Director de unidad
    | 'MANAGER'       // Gerente/Coordinador
    | 'AGENT';        // Ejecutivo

export type SubscriptionStatus =
    | 'TRIAL'
    | 'ACTIVE'
    | 'PAST_DUE'
    | 'CANCELLED'
    | 'SUSPENDED';

// ============================================
// INTERFACES MULTI-TENANT
// ============================================

// Organización (Cliente/Tenant)
export interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    timezone: string;
    subscriptionStatus: SubscriptionStatus;
    trialEndsAt?: string;
    createdAt: string;
    updatedAt: string;
}

// Unidad de Negocio
export interface BusinessUnit {
    id: string;
    name: string;
    slug: string;
    description?: string;
    color?: string;
    whatsappNumber?: string;
    isActive: boolean;
    organizationId: string;
    createdAt: string;
    updatedAt: string;
}

// Usuario del sistema
export interface User {
    id: string;
    name?: string;
    email: string;
    image?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    organizationId?: string;
    organization?: Organization;
    businessUnits?: UserBusinessUnit[];
    createdAt: string;
    updatedAt: string;
}

// Relación Usuario <-> Unidad de Negocio
export interface UserBusinessUnit {
    id: string;
    userId: string;
    businessUnitId: string;
    roleOverride?: UserRole;
    assignedAt: string;
    businessUnit?: BusinessUnit;
}

// ============================================
// INTERFACES DE NEGOCIO
// ============================================

export interface Message {
    id: string;
    sender: MessageSender;
    content: string;
    timestamp: string;
}

export interface Lead {
    id: string;
    name: string;
    phone: string;
    email?: string;
    source: SourceCode | string;

    // Multi-tenant (opcional durante migración)
    organizationId?: string;
    businessUnitId?: string;
    businessUnit?: BusinessUnit;

    // Asignación
    assignedToId?: string;
    assignedTo?: User;
    createdById?: string;
    createdBy?: User;

    // Metadatos
    priority?: LeadPriority;
    interestCycle?: InterestCycle;
    status: LeadStatus;
    tags: string[];
    observations?: string;

    // Fechas
    createdAt: string;
    updatedAt?: string;
    scheduledAt?: string;

    // WhatsApp
    hasUnreadMessages?: boolean;
    history: Message[];
}

// ============================================
// HELPERS DE PERMISOS
// ============================================

// Orden jerárquico de roles (mayor índice = más poder)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
    'AGENT': 1,
    'MANAGER': 2,
    'DIRECTOR': 3,
    'ADMIN': 4,
    'OWNER': 5,
    'SUPER_ADMIN': 6,
};

// Verificar si un rol tiene al menos cierto nivel
export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Verificar si puede ver todos los leads (no solo los asignados)
export function canViewAllLeads(role: UserRole): boolean {
    return hasMinRole(role, 'MANAGER');
}

// Verificar si puede eliminar leads
export function canDeleteLeads(role: UserRole): boolean {
    return hasMinRole(role, 'DIRECTOR');
}

// Verificar si puede gestionar usuarios
export function canManageUsers(role: UserRole): boolean {
    return hasMinRole(role, 'ADMIN');
}

// Verificar si puede configurar la organización
export function canConfigureOrg(role: UserRole): boolean {
    return hasMinRole(role, 'OWNER');
}

// Labels amigables para roles
export const ROLE_LABELS: Record<UserRole, string> = {
    'SUPER_ADMIN': 'Super Administrador',
    'OWNER': 'Propietario',
    'ADMIN': 'Administrador',
    'DIRECTOR': 'Director',
    'MANAGER': 'Gerente',
    'AGENT': 'Ejecutivo',
};

// ============================================
// TIPOS LEGACY (mantener compatibilidad)
// ============================================

export interface Settings {
    // Add settings here if needed
}

export interface DB {
    leads: Lead[];
    settings: Settings;
}
