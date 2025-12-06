# 📍 Estado Actual del Proyecto (Current State)

> **Última Actualización:** 05 Diciembre 2025 - 22:59 CST
> **Fase:** UI Móvil Completada ✅ | Configuración Pendiente 🚧

---

## 🚀 Situación General
El CRM está **desplegado en producción** en Vercel con base de datos PostgreSQL en Supabase. La integración de WhatsApp con Twilio está **completamente funcional**. La **versión móvil** del CRM está optimizada con navegación por tabs, dashboard responsivo y chat móvil dedicado.

---

## ✅ Lo que Funciona (Done)

### 1. **Infraestructura en la Nube**
| Componente | Servicio | Estado |
|------------|----------|--------|
| Frontend + API | Vercel | ✅ Producción |
| Base de Datos | Supabase PostgreSQL | ✅ Conectada |
| ORM | Prisma | ✅ Configurado |
| URL | `crm-nexus-beta.vercel.app` | ✅ Activa |

### 2. **Gestión de Leads (CRUD Completo)**
*   API Routes: GET, POST, PATCH, DELETE en `/api/leads`
*   Validación con **Zod**
*   Persistencia en PostgreSQL via Prisma
*   Hook `useLeads` para frontend

### 3. **UI Avanzada - Desktop**
*   **Kanban Board:** Drag & drop optimizado con actualizaciones instantáneas
*   **Lead Table:** Filtros, paginación, acciones masivas
*   **Diseño:** Glassmorphism consistente y responsivo

### 4. **WhatsApp REAL con Twilio**
| Funcionalidad | Descripción |
|---------------|-------------|
| ✅ Envío de mensajes | CRM → WhatsApp del prospecto (via Twilio API) |
| ✅ Recepción de mensajes | WhatsApp del prospecto → CRM (via Webhook) |
| ✅ Historial persistente | Mensajes guardados en tabla `messages` de Supabase |
| ✅ Auto-formato MX | Números de 10 dígitos se convierten a `+521XXXXXXXXXX` |
| ✅ UI bidireccional | Chat en tiempo real con polling |
| ✅ Indicador de envío | Spinner durante envío, manejo de errores |
| ✅ Badge de no leídos | Bolita verde pulsante en leads con mensajes nuevos |
| ✅ Marcar como leído | Al abrir chat, se marcan mensajes como leídos |

### 5. **Click-to-Call (Llamadas)** 🆕
| Ubicación | Implementación |
|-----------|----------------|
| ✅ Editar Prospecto | Botón verde 📞 junto al campo teléfono |
| ✅ Pipeline (Kanban) | Teléfono clickeable con hover verde |
| ✅ WhatsApp Chat | Botón de llamada en header + teléfono clickeable |

### 6. **UI Móvil Completa** 🆕
| Componente | Descripción |
|------------|-------------|
| ✅ Bottom Tab Bar | Navegación fija inferior: Inicio, Pipeline, Chats, Más |
| ✅ Mobile Dashboard | KPIs clickeables, agenda, chats recientes |
| ✅ Mobile Chat | Lista de conversaciones + vista de chat individual con botón regresar |
| ✅ Mobile Menu | Página "Más" con acceso a todas las funciones |
| ✅ Hamburger Menu | Esquina superior derecha para acceder al sidebar |
| ✅ Safe Area | Soporte para notch/home indicator de iPhone |

---

## 🚧 En Progreso / Pendiente (To Do)

### Configuración (Sección Pendiente)
1.  **Gestión de Usuarios:**
    *   Sistema de login (NextAuth o Clerk)
    *   Roles: Admin, Ejecutivo
    *   Perfil de usuario editable

2.  **Configuración de Notificaciones:**
    *   Alertas push para nuevos mensajes
    *   Configuración de sonidos

3.  **Configuración de WhatsApp:**
    *   Gestión de plantillas de mensajes
    *   Configurar horarios de respuesta automática

4.  **Unidades de Negocio:**
    *   Multi-tenancy para diferentes unidades
    *   Cada unidad con su propio número de WhatsApp

### WhatsApp - Mejoras de UX
1.  **Botón de Emojis (😊):**
    *   Actualmente sin funcionalidad
    *   Implementar picker de emojis (ej: `emoji-mart`)
    
2.  **Botón de Clip (📎) - Sistema de Plantillas:**
    *   Al hacer clic, mostrar modal con plantillas guardadas
    *   Opción "Crear nueva plantilla"
    *   Plantillas guardadas en BD (nueva tabla `templates`)

3.  **Plantillas de WhatsApp (Twilio Templates):**
    *   Para iniciar conversaciones fuera de la ventana de 24hrs
    *   Requiere pre-aprobación de Twilio

### Calendario
*   Vista de citas pendientes
*   Integración con agenda móvil

---

## 📄 Archivos Clave Modificados Hoy (05-Dic-2025 Sesión Vespertina)

### Nuevos Archivos
| Archivo | Propósito |
|---------|-----------|
| `src/components/MobileProvider.tsx` | Context para detectar móvil/tablet/desktop |
| `src/components/BottomTabBar.tsx` | Navegación por tabs inferior para móvil |
| `src/components/MobileDashboard.tsx` | Dashboard optimizado para móvil con KPIs clickeables |
| `src/components/MobileChatInterface.tsx` | Chat de WhatsApp para móvil con botón regresar |
| `src/app/menu/page.tsx` | Página "Más opciones" para navegación móvil |
| `src/app/api/whatsapp/mark-read/route.ts` | API para marcar mensajes como leídos |

### Archivos Modificados
| Archivo | Cambios |
|---------|---------|
| `src/app/layout.tsx` | Integración de MobileProvider, BottomTabBar, meta tags PWA |
| `src/app/page.tsx` | Renderizado condicional de MobileDashboard |
| `src/app/whatsapp/page.tsx` | Renderizado condicional de MobileChatInterface |
| `src/components/Sidebar.tsx` | Hamburger movido a esquina superior derecha |
| `src/components/KanbanCard.tsx` | Click-to-call en teléfono, badge de mensajes nuevos |
| `src/components/AddLeadModal.tsx` | Botón de llamar junto al campo teléfono |
| `src/components/ChatInterface.tsx` | Botón de llamar en header, marcar como leído |
| `src/types/index.ts` | Agregado `hasUnreadMessages` a interface Lead |
| `src/app/globals.css` | Safe area para iPhone, ocultar scrollbars en móvil |
| `prisma/schema.prisma` | Campo `hasUnreadMessages` en modelo Lead |

---

## 🐛 Errores Encontrados y Soluciones (Sesión de Hoy)

### 5. Error: Leads no aparecían después del deploy
**Síntoma:** La tabla de leads y el Kanban estaban vacíos en producción, pero el lead existía en Supabase.

**Causa:** Error `prepared statement "s0" already exists` - conflicto entre Prisma y PgBouncer de Supabase.

**Solución:** Agregar `&pgbouncer=true` al `DATABASE_URL` en las variables de entorno de Vercel:
```
DATABASE_URL=postgresql://...@...supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

---

### 6. Dashboard móvil más ancho que la pantalla
**Síntoma:** Las tarjetas de KPIs no cabían en la pantalla del celular.

**Causa:** El grid usaba padding y tamaños que excedían el viewport.

**Solución:** Refactorizar `MobileDashboard.tsx` con:
- Grid 2x2 compacto con `gap-2` en lugar de `gap-3`
- Padding reducido `p-3` en lugar de `p-4`
- Tamaños de fuente más pequeños

---

### 7. Bottom Tab Bar se escondía al hacer scroll
**Síntoma:** La barra de navegación inferior desaparecía.

**Causa:** El contenedor padre tenía overflow que afectaba el fixed positioning.

**Solución:** Asegurar `fixed bottom-0 left-0 right-0 z-50` en BottomTabBar y usar `pb-[env(safe-area-inset-bottom)]` para el iPhone.

---

### 8. Sin botón de regresar en chat móvil
**Síntoma:** Al abrir una conversación en móvil, no había forma de volver a la lista.

**Causa:** Se estaba usando el mismo componente de desktop que no tiene navegación de retorno.

**Solución:** Crear `MobileChatInterface.tsx` con dos vistas:
- Vista de lista (cuando `selectedLead` es null)
- Vista de conversación (con botón ⬅️ para regresar)

---

### 9. Property 'hasUnreadMessages' does not exist on type 'Lead'
**Síntoma:** Error de TypeScript al compilar.

**Causa:** Se agregó el campo en Prisma pero no en la interface de TypeScript.

**Solución:** Agregar `hasUnreadMessages?: boolean` a la interface `Lead` en `src/types/index.ts`.

---

## 🔐 Variables de Entorno Requeridas

### En Vercel (Production)
```env
DATABASE_URL=postgresql://...@...supabase.com:6543/postgres?sslmode=require&pgbouncer=true
DIRECT_URL=postgresql://...@...supabase.com:5432/postgres
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### En Local (.env)
Mismas variables + cualquier override necesario para desarrollo.

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| CRM Producción | https://crm-nexus-beta.vercel.app |
| Supabase Dashboard | https://app.supabase.com |
| Twilio Console | https://console.twilio.com |
| Twilio WhatsApp Sandbox | Messaging → Try it out → Send a WhatsApp message |
| Webhook URL (configurar en Twilio) | `https://crm-nexus-beta.vercel.app/api/whatsapp/webhook` |

---

## 📊 Arquitectura del Sistema WhatsApp

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   CRM (Vercel)  │     │     Twilio      │     │  WhatsApp User  │
│                 │     │                 │     │                 │
│  ChatInterface  │────▶│  Messages API   │────▶│  📱 Celular     │
│        │        │     │                 │     │                 │
│        ▼        │     │                 │     │                 │
│  /api/whatsapp  │     │                 │     │                 │
│    /send        │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                       │
        │                       │
        │               ┌───────▼───────┐
        │               │   Webhook     │
        └───────────────│   POST        │
                        │ /api/whatsapp │
                        │   /webhook    │
                        └───────────────┘
```

---

## ⚠️ Deuda Técnica Conocida
*   La autenticación es inexistente (cualquiera puede acceder).
*   El polling de mensajes cada 5 segundos puede ser ineficiente a escala (considerar WebSockets o Server-Sent Events).
*   El Sandbox de Twilio requiere que el usuario envíe "join citizen-equipment" antes de poder recibir mensajes.
*   La versión móvil del Pipeline (Kanban) aún usa la versión desktop.
*   La sección de Configuración no tiene funcionalidad implementada.
