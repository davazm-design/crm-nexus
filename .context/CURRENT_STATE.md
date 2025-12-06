# 📍 Estado Actual del Proyecto (Current State)

> **Última Actualización:** 05 Diciembre 2025 - 18:49 CST
> **Fase:** WhatsApp Integración REAL con Twilio ✅

---

## 🚀 Situación General
El CRM está **desplegado en producción** en Vercel con base de datos PostgreSQL en Supabase. La integración de WhatsApp con Twilio está **completamente funcional** - los ejecutivos pueden enviar y recibir mensajes reales de WhatsApp desde el CRM.

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

### 3. **UI Avanzada**
*   **Kanban Board:** Drag & drop optimizado con actualizaciones instantáneas
*   **Lead Table:** Filtros, paginación, acciones masivas
*   **Diseño:** Glassmorphism consistente y responsivo

### 4. **WhatsApp REAL con Twilio** 🆕
| Funcionalidad | Descripción |
|---------------|-------------|
| ✅ Envío de mensajes | CRM → WhatsApp del prospecto (via Twilio API) |
| ✅ Recepción de mensajes | WhatsApp del prospecto → CRM (via Webhook) |
| ✅ Historial persistente | Mensajes guardados en tabla `messages` de Supabase |
| ✅ Auto-formato MX | Números de 10 dígitos se convierten a `+521XXXXXXXXXX` |
| ✅ UI bidireccional | Chat en tiempo real con polling |
| ✅ Indicador de envío | Spinner durante envío, manejo de errores |

---

## 🚧 En Progreso / Pendiente (To Do)

### WhatsApp - Mejoras de UX
1.  **Botón de Emojis (😊):**
    *   Actualmente sin funcionalidad
    *   Implementar picker de emojis (ej: `emoji-mart`)
    
2.  **Botón de Clip (📎) - Sistema de Plantillas:**
    *   Al hacer clic, mostrar modal con plantillas guardadas
    *   Opción "Crear nueva plantilla" al final de la lista
    *   Plantillas se guardan en BD (nueva tabla `templates`)
    *   Al seleccionar una plantilla, se inserta en el textarea
    *   Útil para respuestas rápidas y mensajes frecuentes

3.  **Plantillas de WhatsApp (Twilio Templates):**
    *   Para iniciar conversaciones fuera de la ventana de 24hrs
    *   Requiere pre-aprobación de Twilio
    *   Usar `sendWhatsAppTemplate()` ya implementada en `twilio.ts`

### Llamadas de Voz
*   Integración de Twilio Voice (pendiente)
*   Click-to-call desde el CRM

### Autenticación
*   Sistema de login (NextAuth o Clerk)
*   Roles: Admin, Ejecutivo

---

## 📄 Archivos Clave Modificados Hoy (05-Dic-2025)

### Nuevos Archivos
| Archivo | Propósito |
|---------|-----------|
| `src/lib/twilio.ts` | Cliente Twilio, funciones `sendWhatsAppMessage()` y `sendWhatsAppTemplate()` |
| `src/app/api/whatsapp/send/route.ts` | API para enviar mensajes desde el CRM |
| `src/app/api/whatsapp/webhook/route.ts` | Webhook para recibir mensajes de Twilio |
| `src/app/api/leads/[id]/route.ts` | API GET/PATCH/DELETE para lead individual |
| `src/components/WhatsAppChat.tsx` | Componente de chat (standalone) |

### Archivos Modificados
| Archivo | Cambios |
|---------|---------|
| `src/components/ChatInterface.tsx` | Integración con API real de Twilio, polling, manejo de errores, indicadores visuales |
| `src/lib/db.ts` | Logging de debug, fix de detección de Prisma |
| `prisma/schema.prisma` | Configuración de `directUrl` para migraciones |
| `package.json` | Dependencia `twilio` agregada |
| `.env` | Variables de Twilio agregadas |

---

## 🐛 Errores Encontrados y Soluciones

### 1. Error: "prepared statement already exists"
**Síntoma:** La API de leads devolvía error 500 intermitentemente.

**Causa:** Conflicto entre Prisma prepared statements y Supabase connection pooler (PgBouncer).

**Solución:** Agregar `&pgbouncer=true` al `DATABASE_URL` en Vercel:
```
postgresql://...@...supabase.com:6543/postgres?sslmode=require&pgbouncer=true
```

---

### 2. Error: "P1001: Can't reach database"
**Síntoma:** El deploy fallaba durante `prisma db push`.

**Causa:** El `DATABASE_URL` usaba el puerto incorrecto para serverless.

**Solución:** 
- `DATABASE_URL` → Puerto **6543** (Transaction Pooler) con `?pgbouncer=true`
- `DIRECT_URL` → Puerto **5432** (Direct Connection) para migraciones DDL

---

### 3. WhatsApp no enviaba mensajes
**Síntoma:** El mensaje se guardaba en el CRM pero no llegaba al WhatsApp.

**Causa:** El número de teléfono no tenía el código de país.

**Solución:** Implementar `formatPhoneForWhatsApp()` en `twilio.ts` que auto-detecta números de 10 dígitos y agrega `+521` automáticamente.

---

### 4. Lead "desaparecía" después de cada deploy
**Síntoma:** Los leads no se mostraban en la UI después de un nuevo deploy.

**Causa:** Era el error #1 (prepared statements) que causaba error 500 en la API.

**Solución:** Mismo fix de `pgbouncer=true`.

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
