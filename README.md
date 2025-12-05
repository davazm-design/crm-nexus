# 🚀 Nexus CRM - Sistema de Gestión de Leads Educativos

> CRM especializado para instituciones educativas con múltiples unidades de negocio, enfocado en la gestión eficiente de prospectos desde Facebook Lead Ads hasta la inscripción.

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38bdf8)
![Status](https://img.shields.io/badge/Status-SaaS_Ready-green)

---

## 📋 Tabla de Contenidos

- [Descripción del Proyecto](#-descripción-del-proyecto)
- [Arquitectura & SaaS Readiness](#-arquitectura--saas-readiness)
- [Tecnologías](#-tecnologías)
- [Características Implementadas](#-características-implementadas)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación y Configuración](#-instalación-y-configuración)
- [Uso](#-uso)
- [Roadmap](#-roadmap)
- [Mejores Prácticas](#-mejores-prácticas)

---

## 🎯 Descripción del Proyecto

**Nexus CRM** es un sistema de gestión de relaciones con clientes (CRM) diseñado específicamente para instituciones educativas que manejan múltiples unidades de negocio. El sistema permite gestionar prospectos desde su captura inicial hasta su conversión en estudiantes inscritos.

### Unidades de Negocio Soportadas

- 🟦 **Beeplay** - Maternal
- 🟨 **Nuevo Beeplay** - Maternal y Kinder
- 🟩 **Liceo Los Cabos** - Kinder hasta Preparatoria
- 🟣 **Liceo Universitario** - Universidad

### Objetivos del Proyecto

1. **Centralizar** la gestión de leads de todas las unidades educativas
2. **Automatizar** el proceso de importación desde Facebook Lead Ads
3. **Optimizar** el seguimiento de prospectos con priorización inteligente
4. **Facilitar** la comunicación vía WhatsApp con números específicos por unidad
5. **Visualizar** el pipeline de conversión en tiempo real

---

## 🏗️ Arquitectura & SaaS Readiness

Este proyecto ha sido auditado y refactorizado para ser **SaaS Ready**. La arquitectura desacopla la lógica de negocio de la interfaz, permitiendo una migración fluida a la nube.

### Principios de Diseño
- **Seguridad Primero**: Validación estricta de datos con `Zod` en el backend para prevenir inyecciones y corrupción.
- **Tolerancia a Fallos**: Sistema de persistencia local con **backups automáticos** y recuperación ante corrupción de datos.
- **Estado Centralizado**: Uso de Custom Hooks (`useLeads`) para la gestión de estado, facilitando la transición a bases de datos remotas sin tocar la UI.
- **Tipado Estricto**: Definiciones de TypeScript alineadas con catálogos de negocio reales.

### Stack Tecnológico

```
Frontend:
├── Next.js 15 (App Router & Turbopack)
├── React 18
├── TypeScript 5
└── Tailwind CSS 4

Backend (Simulado/Local):
├── Next.js API Routes
├── Zod (Validación de esquemas)
├── File-based Database (JSON con atomicidad simulada)
└── XLSX para importación de Excel

Librerías Clave:
├── lucide-react (iconos)
├── date-fns (manejo de fechas)
├── clsx (clases condicionales)
├── @dnd-kit (drag & drop profesional)
```

### Arquitectura de Datos

```typescript
Lead {
  id: string
  name: string
  phone: string
  email: string
  source: SourceCode (01-07)
  businessUnit?: 'beeplay' | 'nuevo_beeplay' | 'liceo_los_cabos' | 'liceo_universitario'
  priority?: 'hot' | 'warm' | 'cold'
  interestCycle?: 'Enero 2025' | ... | 'Septiembre 2027'
  status: LeadStatus
  createdAt: string
  scheduledAt?: string
  tags: string[]
  observations: string
  history: Message[]
}
```

---

## ✅ Características Implementadas

### Fase 1: Fundamentos & Seguridad ✅

- [x] **Gestión de Leads (CRUD)**
  - Creación, lectura, actualización y eliminación.
  - Validación de datos robusta (Zod).
  - Manejo de errores y feedback visual.
- [x] **Dashboard Principal**
  - Estadísticas en tiempo real.
  - Embudo de ventas visual.

### Fase 2: Visualización & Flujo ✅

- [x] **Kanban Board Interactivo**
  - Drag & drop fluido con `@dnd-kit`.
  - Actualización optimista de estado.
  - Edición rápida desde la tarjeta.
- [x] **Tabla de Leads Avanzada**
  - Filtros dinámicos (conectados a catálogos).
  - Búsqueda en tiempo real.
  - Paginación y ordenamiento.
  - Acciones masivas (Eliminar, Exportar, Archivar, Cambiar Prioridad).

### Fase 3: Importación y Limpieza (CRP) ✅

- [x] **Centro de Recepción de Prospectos**
  - Importación desde Excel/CSV.
  - Detección inteligente de columnas.
  - Normalización automática de datos.
  - **Limpieza Masiva**: Script para eliminar basura y duplicados.

### Fase 4: Configuración de Negocio ✅

- [x] **Catálogos Centralizados**
  - Fuentes de prospectos (01-07).
  - Unidades de negocio con identidad visual propia.
  - Ciclos de interés (2025-2027).

---

## 📁 Estructura del Proyecto

```
nascent-kuiper/
├── src/
│   ├── app/                      # App Router de Next.js
│   │   ├── api/                  # API Routes (Backend)
│   │   │   ├── leads/            # Endpoints seguros con Zod
│   │   │   └── upload/           # Importación de archivos
│   │   ├── crp/                  # Centro de Recepción de Prospectos
│   │   ├── leads/                # Página principal de leads
│   │   ├── kanban/               # Tablero Kanban
│   │   └── ...
│   ├── components/               # Componentes React (UI pura)
│   │   ├── AddLeadModal.tsx      # Modal inteligente
│   │   ├── KanbanBoard.tsx       # Tablero D&D
│   │   ├── LeadTable.tsx         # Tabla avanzada
│   │   └── ...
│   ├── hooks/                    # Lógica de negocio (Hooks)
│   │   └── useLeads.ts           # Gestión centralizada de leads
│   ├── lib/                      # Utilidades y Core
│   │   ├── db.ts                 # Capa de datos (con seguridad)
│   │   ├── validations.ts        # Esquemas Zod
│   │   ├── businessUnits.ts      # Catálogo de unidades
│   │   └── sources.ts            # Catálogo de fuentes
│   └── types/                    # Definiciones TypeScript
├── data/
│   ├── db.json                   # Base de datos principal
│   └── db.backup.json            # Backup automático de seguridad
├── scripts/                      # Scripts de mantenimiento
└── ...
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Instalación

```bash
# 1. Clonar el repositorio
git clone <repository-url>
cd nascent-kuiper

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev

# 4. Abrir en navegador
# http://localhost:3000
```

---

## 📖 Uso

### Gestión Diaria

1. **Crear Lead**: Botón "Nuevo Lead" en la tabla o Kanban. El formulario valida automáticamente los campos.
2. **Mover Leads**: En el Kanban, arrastra las tarjetas para cambiar su estado (ej. de "Nuevo" a "Contactado").
3. **Filtrar**: Usa los filtros avanzados en la tabla para ver solo leads de "Beeplay" o con prioridad "Hot".

### Importación Masiva (CRP)

1. Ir a **CRP**.
2. Arrastrar archivo Excel.
3. El sistema normaliza y valida.
4. Confirmar importación.

---

## 🗺️ Roadmap hacia SaaS

### Fase 5: Integración WhatsApp 🔄 (Siguiente)

- [ ] Integración con WhatsApp Business API.
- [ ] Chat en tiempo real dentro del CRM.
- [ ] Templates de mensajes por unidad.

### Fase 6: Base de Datos Cloud ☁️ (Planificado)

- [ ] Migración de `db.json` a PostgreSQL (Supabase/Neon).
- [ ] Implementación de Prisma ORM.
- [ ] Autenticación con NextAuth (Roles y Permisos).

### Fase 7: Automatización 🤖 (Futuro)

- [ ] Webhooks para recibir leads de Facebook en tiempo real.
- [ ] Asignación automática de leads (Round Robin).

---

## 🎨 Mejores Prácticas Aplicadas

### Código & Seguridad
- ✅ **Validación Zod**: Nada entra a la BD sin ser validado.
- ✅ **Atomicidad Simulada**: Lectura/Escritura segura para evitar condiciones de carrera en local.
- ✅ **Separación de Responsabilidades**: UI Components vs. Custom Hooks vs. API Routes.

### UI/UX
- ✅ **Optimistic UI**: La interfaz responde instantáneamente mientras el servidor procesa.
- ✅ **Feedback Visual**: Toasts y alertas para todas las acciones.
- ✅ **Diseño Premium**: Glassmorphism y paleta de colores consistente.

---

**Desarrollado con ❤️ para instituciones educativas de excelencia**

*Última actualización: Diciembre 2025*
