// Catálogo de fuentes/campañas
export const SOURCE_CATALOG = {
    '01': 'Redes sociales y sitio web',
    '02': 'Recomendación',
    '03': 'Publicidad tradicional y admisiones',
    '04': 'Alianzas educativas',
    '05': 'Alianzas empresariales y convenios',
    '06': 'Activaciones',
    '07': 'Eventos de prospección',
} as const;

export type SourceCode = keyof typeof SOURCE_CATALOG;

export const getSourceName = (code: string): string => {
    return SOURCE_CATALOG[code as SourceCode] || code;
};

export const getSourceOptions = () => {
    return Object.entries(SOURCE_CATALOG).map(([code, name]) => ({
        code,
        name,
        label: `${code} - ${name}`,
    }));
};
