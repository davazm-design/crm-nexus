# ☁️ Plan de Migración a la Nube: Nexus CRM

Este documento detalla la estrategia técnica para migrar **Nexus CRM** de un entorno local (basado en archivos JSON) a una arquitectura **SaaS Cloud-Native** escalable, segura y robusta.

---

## 🎯 Arquitectura Objetivo (The Modern Stack)

Para garantizar escalabilidad, rendimiento y facilidad de mantenimiento, migraremos a la siguiente infraestructura:

| Componente | Tecnología Actual (Local) | Tecnología Objetivo (Cloud) | Justificación |
| :--- | :--- | :--- | :--- |
| **Hosting / Compute** | Localhost | **Vercel** | Infraestructura serverless nativa para Next.js, despliegues automáticos (CI/CD) y CDN global. |
| **Base de Datos** | Archivo `db.json` | **Supabase (PostgreSQL)** | Base de datos relacional robusta, escalable y gestionada. Incluye backups reales y seguridad RLS. |
| **Acceso a Datos** | `fs/promises` (Nativo) | **Prisma ORM** | Type-safety total, migraciones de esquema automatizadas y mejor experiencia de desarrollo. |
| **Autenticación** | Ninguna / Local | **Clerk** o **Supabase Auth** | Gestión segura de usuarios, roles (Admin/Vendedor), 2FA y sesiones. |
| **Almacenamiento** | Disco Local | **Supabase Storage** (S3) | Para guardar archivos importados (Excel) o evidencias de leads de forma persistente. |

---

## 🚀 Fases de Migración

### Fase 1: Preparación de la Base de Datos (PostgreSQL + Prisma)

El primer paso es dejar de usar `db.json` y conectar la app a una base de datos real.

1.  **Configurar Proyecto en Supabase**:
    *   Crear organización y proyecto.
    *   Obtener `DATABASE_URL`.
2.  **Instalar Prisma ORM**:
    *   `npm install prisma --save-dev`
    *   `npm install @prisma/client`
    *   Inicializar: `npx prisma init`
3.  **Definir Esquema (`schema.prisma`)**:
    *   Traducir nuestros tipos de TypeScript (`Lead`, `Message`) a modelos de Prisma.
    *   Ejemplo:
        ```prisma
        model Lead {
          id            String   @id @default(uuid())
          name          String
          email         String   @unique
          status        String   // Usar enums si es posible
          source        String
          businessUnit  String
          createdAt     DateTime @default(now())
          // ... resto de campos
        }
        ```
4.  **Script de Migración de Datos**:
    *   Crear un script (`scripts/migrate-json-to-sql.ts`) que lea `db.json` e inserte cada registro en PostgreSQL usando Prisma.

### Fase 2: Refactorización del Backend (`src/lib/db.ts`)

Gracias a nuestra arquitectura modular, solo necesitamos cambiar la implementación de las funciones en `src/lib/db.ts`. El resto de la app (Frontend, Hooks) **no se enterará del cambio**.

1.  **Reemplazar `fs` con `prisma`**:
    *   `getLeads()` pasará de leer un archivo a `prisma.lead.findMany()`.
    *   `addLead()` pasará a `prisma.lead.create()`.
2.  **Eliminar lógica de "Atomicidad Manual"**:
    *   La base de datos maneja la concurrencia. Podemos borrar el código de backups manuales y reintentos de escritura en `db.ts`.

### Fase 3: Implementación de Autenticación

Un SaaS necesita usuarios y seguridad.

1.  **Instalar Proveedor de Auth** (Recomendado: **Clerk** por su facilidad con Next.js).
2.  **Proteger Rutas**:
    *   Crear `middleware.ts` para bloquear acceso a `/leads` y `/api/*` a usuarios no logueados.
3.  **Asociar Datos a Usuarios/Tenants**:
    *   Añadir campo `tenantId` o `organizationId` al modelo `Lead` en Prisma.
    *   Asegurar que un usuario solo vea los leads de su unidad de negocio (si aplica).

### Fase 4: Despliegue a Producción (Vercel)

1.  **Conectar Repositorio**: Vincular GitHub con Vercel.
2.  **Variables de Entorno**: Configurar `DATABASE_URL`, claves de API de Auth, etc., en el panel de Vercel.
3.  **Build & Deploy**: Vercel detectará Next.js y construirá la aplicación automáticamente.

---

## 🛡️ Consideraciones de Seguridad

*   **Row Level Security (RLS)**: Si usamos Supabase directo desde el cliente (opcional), configurar RLS para que nadie pueda descargar toda la base de datos.
*   **Validación**: Mantener y reforzar nuestros esquemas `Zod`. Son nuestra primera línea de defensa.
*   **Backups**: Activar PITR (Point-in-Time Recovery) en Supabase para poder "rebobinar" la base de datos a cualquier segundo del pasado.

---

## 💰 Estimación de Costos (Nivel Inicial)

| Servicio | Plan | Costo Estimado |
| :--- | :--- | :--- |
| **Vercel** | Hobby | **Gratis** (hasta ciertos límites generosos) |
| **Supabase** | Free Tier | **Gratis** (hasta 500MB de BD, suficiente para miles de leads) |
| **Clerk** | Free Tier | **Gratis** (hasta 10,000 usuarios activos mensuales) |
| **Total** | | **$0 / mes** (para comenzar) |

---

## 📝 Checklist de Pre-Migración

- [ ] El código actual está estable y sin bugs críticos.
- [ ] `src/lib/db.ts` es el ÚNICO punto de acceso a los datos (confirmado).
- [ ] Los tipos de datos (`Lead`, `Status`) están bien definidos y estables.
- [ ] Tenemos un backup final de `db.json` antes de empezar.
