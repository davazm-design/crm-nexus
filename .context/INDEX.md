# 📚 Índice de Documentación del Proyecto

> **TEEM CRM** - Sistema de Gestión de Leads Educativos
> 
> Este directorio contiene toda la documentación de contexto del proyecto.

---

## 🎯 Propósito de este Directorio

La carpeta `.context/` sirve como **fuente de verdad** para:
1. **Desarrolladores nuevos** que se integran al proyecto
2. **IAs de programación** que retoman sesiones de trabajo
3. **Documentación viva** que evoluciona con el proyecto

---

## 📖 Orden de Lectura

### Para Desarrolladores Nuevos (Onboarding)
Leer en este orden para entender el proyecto completo:

| # | Archivo | Propósito | Tiempo |
|---|---------|-----------|--------|
| 1 | [01_GLOSSARY_TECH.md](01_GLOSSARY_TECH.md) | Conceptos fundamentales de desarrollo | 15-20 min |
| 2 | [02_TECH_STACK.md](02_TECH_STACK.md) | Tecnologías y herramientas del proyecto | 5 min |
| 3 | [03_CODING_STANDARDS.md](03_CODING_STANDARDS.md) | Reglas y estándares de código | 5 min |
| 4 | [04_CURRENT_STATE.md](04_CURRENT_STATE.md) | Estado actual y features implementadas | 10 min |
| 5 | [05_AUDIT_HOLISTIC.md](05_AUDIT_HOLISTIC.md) | Auditoría de calidad e issues pendientes | 10 min |

### Para IAs de Programación (Inicio de Sesión)
Leer en este orden al comenzar cada sesión:

| # | Archivo | Propósito |
|---|---------|-----------|
| 1 | [00_SESSION_START.md](00_SESSION_START.md) | Protocolo de inicialización obligatorio |
| 2 | [04_CURRENT_STATE.md](04_CURRENT_STATE.md) | Entender dónde nos quedamos |
| 3 | [05_AUDIT_HOLISTIC.md](05_AUDIT_HOLISTIC.md) | Ver issues críticos y deuda técnica |
| 4 | [03_CODING_STANDARDS.md](03_CODING_STANDARDS.md) | Recordar las reglas del proyecto |

### Documentación de Referencia
Consultar cuando sea necesario:

| Archivo | Propósito |
|---------|-----------|
| [99_MANUAL_DE_USO.md](99_MANUAL_DE_USO.md) | Manual para usuarios finales (no técnico) |

---

## 📁 Estructura de Archivos

```
.context/
│
├── 00_SESSION_START.md       🚦 Protocolo de inicio de sesión (IA)
│   └── Instrucciones para que la IA retome el trabajo
│
├── 01_GLOSSARY_TECH.md       📚 Glosario técnico educativo
│   └── Conceptos: Backend, Frontend, APIs, Testing, Seguridad...
│
├── 02_TECH_STACK.md          🛠️ Stack tecnológico
│   └── Next.js, React, TypeScript, Tailwind, Prisma, Twilio...
│
├── 03_CODING_STANDARDS.md    📏 Estándares de código
│   └── Reglas de TypeScript, validación Zod, estructura de archivos
│
├── 04_CURRENT_STATE.md       📍 Estado actual del proyecto
│   └── Features implementadas, errores resueltos, URLs
│
├── 05_AUDIT_HOLISTIC.md      📊 Auditoría holística
│   └── Scorecard de calidad, issues críticos, métricas
│
├── 99_MANUAL_DE_USO.md       📖 Manual de usuario
│   └── Guía para usuarios finales del CRM
│
└── INDEX.md                  📚 Este archivo (índice)
```

---

## ✅ Checklist al Actualizar Documentación

Antes de hacer commit, verifica:

- [ ] ¿Se actualizó `04_CURRENT_STATE.md` con las nuevas features?
- [ ] ¿Se documentaron nuevos errores/soluciones?
- [ ] ¿Cambió la puntuación de alguna área en `05_AUDIT_HOLISTIC.md`?
- [ ] ¿Se agregaron nuevos términos al `01_GLOSSARY_TECH.md`?
- [ ] ¿Cambió el stack? Actualizar `02_TECH_STACK.md`

---

## 🔄 Historial de Cambios

| Fecha | Cambio |
|-------|--------|
| 06-Dic-2025 | Creación del sistema de documentación con prefijos numéricos |
| 06-Dic-2025 | Agregado AUDIT_HOLISTIC.md y GLOSSARY_TECH.md |

---

**Última actualización:** 06 de Diciembre, 2025
