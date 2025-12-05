// Catálogo de Unidades de Negocio
export const BUSINESS_UNITS = {
    'beeplay': {
        id: 'beeplay',
        name: 'Beeplay',
        level: 'Maternal',
        whatsappNumber: '', // Se configurará después
        color: 'blue',
        bgColor: 'bg-blue-900/30',
        textColor: 'text-blue-300',
        borderColor: 'border-blue-700/50',
    },
    'nuevo_beeplay': {
        id: 'nuevo_beeplay',
        name: 'Nuevo Beeplay',
        level: 'Maternal y Kinder',
        whatsappNumber: '', // Se configurará después
        color: 'amber',
        bgColor: 'bg-amber-900/30',
        textColor: 'text-amber-300',
        borderColor: 'border-amber-700/50',
    },
    'liceo_los_cabos': {
        id: 'liceo_los_cabos',
        name: 'Liceo Los Cabos',
        level: 'Kinder - Preparatoria',
        whatsappNumber: '', // Se configurará después
        color: 'green',
        bgColor: 'bg-green-900/30',
        textColor: 'text-green-300',
        borderColor: 'border-green-700/50',
    },
    'liceo_universitario': {
        id: 'liceo_universitario',
        name: 'Liceo Universitario',
        level: 'Universidad',
        whatsappNumber: '', // Se configurará después
        color: 'purple',
        bgColor: 'bg-purple-900/30',
        textColor: 'text-purple-300',
        borderColor: 'border-purple-700/50',
    },
} as const;

export type BusinessUnitId = keyof typeof BUSINESS_UNITS;

export const getBusinessUnit = (id: string) => {
    return BUSINESS_UNITS[id as BusinessUnitId] || null;
};

export const getBusinessUnitOptions = () => {
    return Object.values(BUSINESS_UNITS).map(unit => ({
        id: unit.id,
        name: unit.name,
        level: unit.level,
        label: `${unit.name} (${unit.level})`,
    }));
};
