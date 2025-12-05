# 🧠 Guía Maestra: Desarrollo de Software con IA Nivel Senior

> **Objetivo:** Transformar una idea abstracta en un producto SaaS profesional, escalable y seguro, utilizando Inteligencia Artificial como tu equipo de ingeniería, pero dirigiéndola con la mentalidad de un Arquitecto de Software Senior.

---

## 1. La Fase de Definición (El "Product Manager")

El error #1 es pedir código inmediatamente. Un Senior primero entiende el **QUÉ** y el **POR QUÉ**.

### 🎯 Prompt 1: Clarificación y Refinamiento de la Idea

Copia y pega este prompt para convertir tu idea vaga en una especificación técnica sólida.

> **Prompt:**
> "Actúa como un **Product Manager Senior y Arquitecto de Software** experto en SaaS. Tengo una idea para un software: **[DESCRIBE TU IDEA AQUÍ, EJ: Un CRM para escuelas]**.
>
> No escribas código todavía. Tu objetivo es ayudarme a definir el producto para que sea viable técnica y comercialmente.
>
> 1.  **Critica mi idea:** Encuentra 3 posibles fallos lógicos o técnicos.
> 2.  **Define el MVP (Producto Mínimo Viable):** ¿Cuáles son las 3-5 funcionalidades críticas que debemos construir primero?
> 3.  **Hazme 5 preguntas clave:** Preguntas sobre usuarios, datos o flujo que necesito responder antes de empezar.
> 4.  **Sugiere el Stack Tecnológico:** Recomienda las mejores tecnologías modernas (ej. Next.js, Supabase, etc.) justificando por qué."

---

## 2. La Fase de Planeación (El "Tech Lead")

Una vez que respondes las preguntas de la fase 1, necesitas un plano. Sin plano, construirás un "código espagueti".

### 🗺️ Prompt 2: El Plan Maestro de Ingeniería

> **Prompt:**
> "Basado en la definición que acabamos de acordar, actúa como un **Tech Lead Senior**. Crea un plan de ejecución técnica detallado para construir este MVP.
>
> El plan debe incluir:
> 1.  **Estructura de Directorios:** Un árbol de carpetas sugerido para el proyecto (ej. `src/components`, `src/lib`).
> 2.  **Modelo de Datos (Schema):** Define las entidades principales (ej. `Usuario`, `Lead`, `Pago`) y sus relaciones. Aunque usemos JSON al principio, diséñalo pensando en SQL.
> 3.  **Hoja de Ruta Paso a Paso:** Divide el desarrollo en fases lógicas (ej. Fase 1: Configuración, Fase 2: Auth, Fase 3: Core Feature).
> 4.  **Reglas del Proyecto:** Define convenciones (ej. 'Usaremos TypeScript estricto', 'Validación con Zod', 'Tailwind para estilos')."

---

## 3. La Fase de Construcción (El "Senior Developer")

Aquí es donde la IA escribe código. La clave es la **Iteración Modular**. No pidas "haz toda la app". Pide pieza por pieza.

### 🔨 Hoja de Ruta para Programar con IA

Sigue este ciclo infinito para cada funcionalidad:

1.  **Contexto:** "Vamos a trabajar en la **Fase 1: Autenticación** del plan que hiciste."
2.  **Especificación:** "Crea el componente `LoginForm.tsx`. Debe tener validación de email y contraseña."
3.  **Revisión:** (Tú o la IA revisan el código).
4.  **Integración:** "Ahora conecta este formulario con la base de datos."

**💡 Regla de Oro:** Si la IA se pierde o alucina, es porque el **Contexto** es demasiado grande. Pídele que haga un "Resumen de Estado" (Checkpoint) y empieza un chat nuevo con ese resumen.

---

## 4. El Método de Verificación (El "Auditor de Seguridad")

Este es el paso que separa a los amateurs de los pros. La IA comete errores, introduce bugs y brechas de seguridad. Debes obligarla a auditarse a sí misma.

### 🛡️ Prompt de Auditoría y Calidad (Ejecutar cada vez que termines una funcionalidad grande)

> **Prompt:**
> "Actúa como un **Auditor de Seguridad y Code Reviewer Senior**. Analiza el código que hemos escrito hasta ahora (específicamente los archivos: [LISTA DE ARCHIVOS]).
>
> Realiza una auditoría implacable buscando:
> 1.  **🔴 Vulnerabilidades de Seguridad:** Inyección SQL, XSS, datos expuestos, falta de validación.
> 2.  **🟠 Deuda Técnica:** Código duplicado, funciones muy largas, falta de tipado en TypeScript.
> 3.  **🟡 Buenas Prácticas:** ¿Estamos siguiendo los principios SOLID? ¿Es el código legible?
>
> Entrégame un reporte con una lista de problemas clasificados por severidad y, para los problemas CRÍTICOS, dame el código corregido."

---

## 5. Los Secretos del "Nivel Dios" (Lo que nadie te dice)

Para que tu proyecto sea realmente un SaaS vendible, añade estos pasos a tu flujo:

### 📄 Documentación Viva
No dejes la documentación para el final.
*   **Prompt:** "Actualiza el `README.md` con los cambios de hoy. Incluye instrucciones de instalación y explica la nueva arquitectura."
*   **Por qué:** Si vuelves al proyecto en 3 meses, agradecerás esto.

### 💾 Cimientos de Datos (The Repository Pattern)
Nunca dejes que tu UI hable directo con la base de datos.
*   **Estrategia:** Pide a la IA que cree una capa intermedia (`api/leads` o `hooks/useLeads`).
*   **Por qué:** Esto te permite cambiar de `JSON local` a `Supabase` en el futuro sin romper toda la app (como hicimos con `LeadRepository`).

### 🧪 Testing Automatizado
Pide a la IA que escriba tests.
*   **Prompt:** "Crea un test unitario para la función `calcularPrecio()`. Asegúrate de cubrir los casos borde (precios negativos, cero, nulos)."

### 🔄 Control de Versiones (Git)
La IA no puede hacer `Ctrl+Z` de hace 3 días. Tú sí.
*   **Hábito:** Cada vez que una funcionalidad funcione bien, haz commit.
*   **Prompt:** "Genera un mensaje de commit semántico para los cambios que acabamos de hacer."

---

## Resumen del Flujo de Trabajo

1.  **Definir** (Prompt de PM)
2.  **Planear** (Prompt de Arquitecto)
3.  **Construir** (Iteración Modular)
4.  **Auditar** (Prompt de Seguridad)
5.  **Documentar** (README y Logs)

Siguiendo este método, la IA deja de ser un "generador de código aleatorio" y se convierte en tu **Equipo de Ingeniería de Élite**.
