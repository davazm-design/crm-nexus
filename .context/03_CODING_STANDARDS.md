# 📏 Estándares de Código y Arquitectura (TEEM CRM)

Este documento define las reglas inquebrantables para el desarrollo de este proyecto. Cualquier código generado por IA o humanos debe adherirse estrictamente a estos principios.

---

## 1. TypeScript & Tipado

*   **Strict Mode:** Siempre activado. No se permiten tipos implícitos.
*   **Prohibido `any`:** Usar `unknown` si el tipo es incierto y validarlo después, o definir interfaces parciales.
*   **Interfaces Centralizadas:** Todos los tipos de dominio (Lead, Message, etc.) deben vivir en `src/types/index.ts` o exportarse desde sus módulos de dominio en `src/lib`.
*   **Enums vs Union Types:** Preferimos Union Types de strings (`type Status = 'new' | 'contacted'`) sobre Enums de TS, ya que son más fáciles de serializar/deserializar en JSON y bases de datos.

## 2. Arquitectura de Datos (Backend)

*   **Validación Zod (CRÍTICO):** NUNCA confiar en el input del cliente.
    *   Toda ruta de API (`route.ts`) debe validar `req.body` o `searchParams` usando un esquema Zod definido en `src/lib/validations.ts`.
*   **Repository Pattern:** La UI nunca debe saber si usamos JSON o SQL.
    *   Usar hooks (`useLeads`) para la comunicación cliente-servidor.
    *   El backend debe respetar la interfaz `LeadRepository` (definida en `src/lib/repository.ts`).
*   **Atomicidad:** Si se usa el sistema de archivos (`db.ts`), siempre implementar mecanismos de seguridad (backups, escritura atómica) para evitar corrupción.

## 3. Frontend & UI (React/Next.js)

*   **Server vs Client Components:**
    *   Por defecto, usar Server Components (RSC) para páginas (`page.tsx`).
    *   Usar `'use client'` solo en las hojas (hojas del árbol de componentes) que requieren interactividad (hooks, eventos).
*   **Estilos (Tailwind CSS):**
    *   Usar clases utilitarias de Tailwind.
    *   Evitar estilos en línea (`style={{...}}`).
    *   Usar `clsx` o `cn` para clases condicionales.
    *   Mantener el diseño "Glassmorphism" consistente (fondos translúcidos, bordes sutiles).
*   **Gestión de Estado:**
    *   Preferir estado local (`useState`) o composición de componentes.
    *   Para estado global de datos, usar Custom Hooks (`useLeads`) que encapsulen la lógica de fetch/update.

## 4. Estructura de Archivos

*   `src/app/api`: Solo endpoints de Next.js.
*   `src/components`: Componentes de UI reutilizables.
*   `src/lib`: Lógica de negocio pura, utilidades, acceso a datos (sin JSX).
*   `src/hooks`: Custom hooks de React.
*   `src/types`: Definiciones de tipos compartidas.

## 5. Convenciones de Naming

*   **Componentes:** PascalCase (`LeadTable.tsx`).
*   **Funciones/Variables:** camelCase (`getLeads`, `isActive`).
*   **Archivos de Utilidad:** camelCase (`dateUtils.ts`).
*   **Carpetas:** kebab-case (`lead-management`).

---

**Nota para la IA:** Antes de escribir cualquier línea de código, verifica que cumpla con estas reglas. Si encuentras código existente que las viola, refactorízalo o márcalo como deuda técnica.
