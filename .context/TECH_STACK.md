# 🛠️ Stack Tecnológico (TEEM CRM)

Este documento describe las tecnologías, librerías y herramientas aprobadas para el proyecto. No introducir nuevas dependencias sin justificación crítica.

---

## 1. Core Framework

*   **Frontend & API:** [Next.js 15](https://nextjs.org/) (App Router)
*   **Lenguaje:** [TypeScript 5](https://www.typescriptlang.org/)
*   **Runtime:** Node.js (LTS)

## 2. Interfaz de Usuario (UI)

*   **Motor de Estilos:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **Iconografía:** [Lucide React](https://lucide.dev/) (Iconos SVG ligeros y consistentes)
*   **Utilidades de Clase:** `clsx` (para lógica condicional de clases)
*   **Drag & Drop:** `@dnd-kit/core` (para el Kanban Board)

## 3. Gestión de Datos (Estado Actual - Local)

*   **Base de Datos:** Archivo JSON local (`data/db.json`).
*   **Acceso a Datos:** Módulo nativo `fs/promises` con capa de seguridad custom (`src/lib/db.ts`).
*   **Validación:** [Zod](https://zod.dev/) (Esquemas estrictos en `src/lib/validations.ts`).
*   **Importación:** `xlsx` (Para leer archivos Excel en el CRP).

## 4. Gestión de Datos (Estado Futuro - Cloud SaaS)

*   **Hosting:** Vercel.
*   **Base de Datos:** Supabase (PostgreSQL).
*   **ORM:** Prisma (Esquema preliminar en `prisma/schema.prisma`).
*   **Autenticación:** Clerk o Supabase Auth.

## 5. Utilidades Clave

*   **Fechas:** `date-fns` (Manejo de fechas y localización en español).
*   **IDs:** `crypto.randomUUID()` (Nativo de la plataforma Web/Node).

---

**Nota para la IA:** Al sugerir soluciones, prioriza siempre las herramientas listadas aquí. Por ejemplo, si necesitas manipular fechas, usa `date-fns`, no instales `moment.js`. Si necesitas estilos, usa Tailwind, no CSS modules ni Styled Components.
