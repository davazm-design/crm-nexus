import { z } from 'zod';
import { SOURCE_CATALOG } from './sources';
import { BUSINESS_UNITS } from './businessUnits';

// Extract valid values from catalogs for strict validation
const sourceCodes = Object.keys(SOURCE_CATALOG) as [string, ...string[]];
const businessUnitIds = Object.keys(BUSINESS_UNITS) as [string, ...string[]];

export const leadSchema = z.object({
    name: z.string().min(1, "El nombre es obligatorio"),
    phone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos"),
    email: z.string().email("Email inválido").optional().or(z.literal('')),
    source: z.string().refine((val) => sourceCodes.includes(val) || val === '', {
        message: "Fuente inválida",
    }),
    status: z.enum([
        'new', 'cleaned', 'contacted', 'in_conversation',
        'scheduled', 'no_show', 'rescheduled', 'enrolled', 'not_enrolled'
    ]).default('new'),
    priority: z.enum(['hot', 'warm', 'cold']).optional(),
    interestCycle: z.string().optional(),
    businessUnit: z.string().refine((val) => businessUnitIds.includes(val) || val === '' || val === undefined, {
        message: "Unidad de negocio inválida",
    }).optional(),
    tags: z.array(z.string()).default([]),
    observations: z.string().optional().default(''),
    history: z.array(z.object({
        id: z.string(),
        sender: z.enum(['executive', 'prospect']),
        content: z.string(),
        timestamp: z.string()
    })).default([])
});

export const createLeadSchema = leadSchema.omit({
    history: true
}).extend({
    // Allow optional fields to be undefined in input, but apply defaults in logic if needed
});

export const updateLeadSchema = leadSchema.partial();
