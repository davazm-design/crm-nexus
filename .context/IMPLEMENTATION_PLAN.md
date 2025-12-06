# 🗺️ Plan de Implementación - TEEM CRM

> **Documento de Planificación Estratégica**
> 
> Este plan define las fases de trabajo necesarias para llevar el proyecto de su estado actual (5.9/10) a un estado de producción seguro (8+/10).

---

## 📊 Estado Inicial vs Objetivo

| Área | Actual | Objetivo | Δ Necesario |
|------|--------|----------|-------------|
| 🔒 Seguridad | 3/10 | 9/10 | +6 puntos |
| 🧪 Testing | 0/10 | 7/10 | +7 puntos |
| 🧩 Código | 7.5/10 | 8.5/10 | +1 punto |
| ⚡ Rendimiento | 6/10 | 7.5/10 | +1.5 puntos |
| 📚 Documentación | 5/10 | 8/10 | +3 puntos |
| **TOTAL** | **5.9/10** | **8.2/10** | **+2.3 puntos** |

---

## 🎯 Criterio de Priorización

Las fases están ordenadas considerando:

1. **Impacto en Seguridad** - Sin esto, no puede ir a producción
2. **Dependencias Técnicas** - Algunas cosas requieren otras primero
3. **Esfuerzo vs Beneficio** - Quick wins primero cuando sea posible
4. **Riesgo de Regresión** - Testing antes de refactorizaciones grandes

---

# 📋 FASES DE IMPLEMENTACIÓN

---

## 🔴 FASE 1: Fundamentos de Seguridad (Autenticación)
**Prioridad:** CRÍTICA | **Estimación:** 4-6 horas | **Bloquea:** Todo lo demás

### Objetivo
Implementar un sistema de autenticación que identifique quién está usando el CRM.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 1.1 | Instalar NextAuth.js | `npm install next-auth @auth/prisma-adapter` | 5 min |
| 1.2 | Configurar Prisma para Auth | Agregar modelos User, Account, Session | 30 min |
| 1.3 | Crear API route de auth | `/api/auth/[...nextauth]/route.ts` | 45 min |
| 1.4 | Configurar provider | GitHub y/o Google OAuth | 30 min |
| 1.5 | Crear página de login | `/login` con UI consistente | 45 min |
| 1.6 | Proteger rutas | Middleware que redirige a /login | 30 min |
| 1.7 | Mostrar usuario en UI | Avatar y nombre en Sidebar | 30 min |
| 1.8 | Testing manual | Verificar flujo completo | 30 min |

### Entregables
- [ ] Usuario puede hacer login con GitHub/Google
- [ ] Rutas protegidas (redirige a /login si no autenticado)
- [ ] Sesión persistente
- [ ] Logout funcional

### Archivos a Crear/Modificar
```
prisma/schema.prisma          ← Agregar modelos de auth
src/app/api/auth/[...nextauth]/route.ts  ← Nueva ruta
src/app/login/page.tsx        ← Nueva página
src/middleware.ts             ← Nuevo middleware
src/components/Sidebar.tsx    ← Mostrar usuario
src/lib/auth.ts               ← Helpers de autenticación
```

### Criterio de Éxito
✅ Puntuación de Seguridad: 3/10 → 6/10

---

## 🔴 FASE 2: Autorización (Roles y Permisos)
**Prioridad:** CRÍTICA | **Estimación:** 2-3 horas | **Requiere:** Fase 1

### Objetivo
Diferenciar permisos entre Admin y Ejecutivo.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 2.1 | Agregar enum Role | `ADMIN`, `EXECUTIVE` en Prisma schema | 15 min |
| 2.2 | Migración de BD | Aplicar cambios al schema | 15 min |
| 2.3 | Middleware de roles | Verificar permisos por ruta | 45 min |
| 2.4 | Restringir endpoints | POST/DELETE solo para roles permitidos | 30 min |
| 2.5 | UI condicional | Mostrar/ocultar botones según rol | 30 min |
| 2.6 | Testing manual | Verificar restricciones | 30 min |

### Permisos Propuestos
| Acción | Admin | Ejecutivo |
|--------|-------|-----------|
| Ver todos los leads | ✅ | ✅ |
| Crear lead | ✅ | ✅ |
| Editar lead | ✅ | ✅ (solo propios) |
| Eliminar lead | ✅ | ❌ |
| Ver métricas | ✅ | ❌ |
| Gestionar usuarios | ✅ | ❌ |

### Entregables
- [ ] Campo `role` en tabla User
- [ ] Middleware de autorización
- [ ] Botones de eliminar ocultos para Ejecutivos
- [ ] Dashboard de métricas solo para Admins

### Criterio de Éxito
✅ Puntuación de Seguridad: 6/10 → 8/10

---

## 🟠 FASE 3: Testing Básico
**Prioridad:** ALTA | **Estimación:** 4-6 horas | **Requiere:** Fase 1 y 2

### Objetivo
Crear una base de tests que permita refactorizar con confianza.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 3.1 | Setup Jest + Testing Library | Configuración inicial | 30 min |
| 3.2 | Tests de API: GET /leads | Verificar respuesta correcta | 30 min |
| 3.3 | Tests de API: POST /leads | Verificar creación y validación | 45 min |
| 3.4 | Tests de API: PATCH /leads | Verificar actualización | 30 min |
| 3.5 | Tests de API: DELETE /leads | Verificar eliminación | 30 min |
| 3.6 | Tests del hook useLeads | Mock de fetch, verificar estado | 45 min |
| 3.7 | Test de componente: AddLeadModal | Renderiza correctamente | 30 min |
| 3.8 | Configurar CI | GitHub Actions para correr tests | 30 min |

### Entregables
- [ ] Jest + Testing Library configurados
- [ ] 5+ tests de API
- [ ] 2+ tests de hooks
- [ ] 1+ test de componente
- [ ] CI corriendo tests en cada push

### Archivos a Crear
```
jest.config.js
src/__tests__/api/leads.test.ts
src/__tests__/hooks/useLeads.test.ts
src/__tests__/components/AddLeadModal.test.tsx
.github/workflows/test.yml
```

### Criterio de Éxito
✅ Puntuación de Testing: 0/10 → 5/10

---

## 🟡 FASE 4: Refactorización de Código (LeadTable)
**Prioridad:** MEDIA | **Estimación:** 2-3 horas | **Requiere:** Fase 3

### Objetivo
Dividir LeadTable.tsx (900 líneas) en componentes manejables.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 4.1 | Crear hook useLeadTable | Extraer toda la lógica de estado | 45 min |
| 4.2 | Crear LeadTableFilters.tsx | Componente de filtros | 30 min |
| 4.3 | Crear LeadTableHeader.tsx | Header con acciones | 30 min |
| 4.4 | Crear LeadTableRow.tsx | Fila individual de lead | 30 min |
| 4.5 | Crear LeadTableBulkActions.tsx | Acciones masivas | 30 min |
| 4.6 | Refactorizar LeadTable.tsx | Usar nuevos componentes | 30 min |
| 4.7 | Correr tests | Verificar que no hay regresiones | 15 min |

### Estructura Propuesta
```
src/components/leads/
├── LeadTable.tsx              ← Orquestador (≈200 líneas)
├── LeadTableFilters.tsx       ← Filtros (≈100 líneas)
├── LeadTableHeader.tsx        ← Header (≈80 líneas)
├── LeadTableRow.tsx           ← Fila (≈150 líneas)
├── LeadTableBulkActions.tsx   ← Acciones (≈100 líneas)
└── useLeadTable.ts            ← Hook (≈200 líneas)
```

### Criterio de Éxito
✅ Puntuación de Código: 7.5/10 → 8.5/10
✅ LeadTable.tsx: 900 → ≈200 líneas

---

## 🟡 FASE 5: Unificación de Hooks
**Prioridad:** MEDIA | **Estimación:** 1-2 horas | **Requiere:** Fase 4

### Objetivo
Todos los componentes deben usar `useLeads()` en lugar de implementar su propio fetch.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 5.1 | Auditar componentes | Identificar todos los que hacen fetch | 15 min |
| 5.2 | Refactorizar MobileKanban | Usar useLeads | 20 min |
| 5.3 | Refactorizar CalendarView | Usar useLeads | 20 min |
| 5.4 | Refactorizar MobileCalendar | Usar useLeads | 20 min |
| 5.5 | Refactorizar page.tsx (Dashboard) | Usar useLeads | 20 min |
| 5.6 | Verificar Pull-to-Refresh | Asegurar compatibilidad | 15 min |

### Archivos a Modificar
- `src/components/MobileKanban.tsx`
- `src/components/CalendarView.tsx`
- `src/components/MobileCalendar.tsx`
- `src/app/page.tsx`

### Criterio de Éxito
✅ 0 componentes con fetch duplicado

---

## 🟡 FASE 6: Optimización de Base de Datos
**Prioridad:** MEDIA | **Estimación:** 30-45 min | **Requiere:** Fase 1

### Objetivo
Agregar índices para mejorar rendimiento de queries.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 6.1 | Agregar índices en Prisma | phone, status, createdAt, businessUnit | 15 min |
| 6.2 | Generar migración | `prisma migrate dev` | 10 min |
| 6.3 | Aplicar en producción | `prisma migrate deploy` | 10 min |

### Índices a Agregar
```prisma
model Lead {
  // ... campos existentes
  
  @@index([phone])
  @@index([status])
  @@index([createdAt(sort: Desc)])
  @@index([businessUnit, status])
}
```

### Criterio de Éxito
✅ Puntuación de BD: 8/10 → 9/10

---

## 🟢 FASE 7: Actualización de Documentación
**Prioridad:** BAJA | **Estimación:** 1 hora | **Requiere:** Todas las anteriores

### Objetivo
Asegurar que toda la documentación refleja el estado actual.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 7.1 | Actualizar README.md | Cambiar Nexus → TEEM, actualizar features | 30 min |
| 7.2 | Agregar setup de auth | Documentar variables de entorno | 15 min |
| 7.3 | Actualizar CURRENT_STATE | Reflejar cambios de esta fase | 15 min |
| 7.4 | Actualizar AUDIT_HOLISTIC | Nuevas puntuaciones | 10 min |

### Criterio de Éxito
✅ Puntuación de Documentación: 5/10 → 8/10

---

## 🟢 FASE 8: Mejoras de Rendimiento (Opcional)
**Prioridad:** BAJA | **Estimación:** 3-4 horas | **Requiere:** Fase 5

### Objetivo
Reemplazar polling por solución más eficiente.

### Tareas

| # | Tarea | Descripción | Estimación |
|---|-------|-------------|------------|
| 8.1 | Evaluar opciones | WebSockets vs SSE vs Pusher | 30 min |
| 8.2 | Implementar SSE | Server-Sent Events para WhatsApp | 2 horas |
| 8.3 | Actualizar ChatInterface | Suscribirse a eventos | 1 hora |

### Criterio de Éxito
✅ Puntuación de Rendimiento: 6/10 → 7.5/10

---

# 📅 CRONOGRAMA SUGERIDO

| Fase | Nombre | Duración | Dependencias |
|------|--------|----------|--------------|
| **1** | Autenticación | 4-6 hrs | Ninguna |
| **2** | Autorización | 2-3 hrs | Fase 1 |
| **3** | Testing | 4-6 hrs | Fase 1, 2 |
| **4** | Refactorización | 2-3 hrs | Fase 3 |
| **5** | Unificación de Hooks | 1-2 hrs | Fase 4 |
| **6** | Índices BD | 30-45 min | Fase 1 |
| **7** | Documentación | 1 hr | Todas |
| **8** | Rendimiento | 3-4 hrs | Fase 5 |

**Total estimado:** 18-27 horas de trabajo

---

# 🎯 HITOS (Milestones)

| Hito | Descripción | Fases Requeridas | Puntuación |
|------|-------------|------------------|------------|
| **M1: Seguro** | CRM puede ir a producción con clientes reales | 1, 2 | 7.2/10 |
| **M2: Testeable** | Se puede refactorizar sin miedo | 1, 2, 3 | 7.5/10 |
| **M3: Limpio** | Código mantenible a largo plazo | 1-5 | 8.0/10 |
| **M4: Completo** | Proyecto de calidad profesional | 1-7 | 8.2/10 |
| **M5: Óptimo** | Rendimiento y experiencia premium | 1-8 | 8.5/10 |

---

# 🚀 RECOMENDACIÓN DE INICIO

**Comenzar por: FASE 1 (Autenticación)**

**Razones:**
1. Es el bloqueador más crítico para producción
2. Todas las demás fases dependen de ella
3. Tiene el mayor impacto en la puntuación de seguridad (+3 puntos)
4. Es técnicamente independiente (no rompe nada existente)

**¿Listo para iniciar la Fase 1?**

---

**Última actualización:** 06 de Diciembre, 2025 - 15:22 CST
