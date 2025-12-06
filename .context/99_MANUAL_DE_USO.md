# 📘 Manual de Uso: Sistema de Contexto (.context)

Este manual explica cómo utilizar los archivos de esta carpeta para potenciar la inteligencia de la IA y mantener la coherencia del proyecto a largo plazo.

---

## 1. Resumen de Archivos

| Archivo | Propósito | ¿Quién lo actualiza? | Frecuencia de Uso |
| :--- | :--- | :--- | :--- |
| `SESSION_START.md` | Protocolo de inicio para "alinear" a la IA. | **Tú (Usuario)** (Rara vez cambia) | **Siempre** (Al inicio de cada chat) |
| `CURRENT_STATE.md` | Foto actual del proyecto (qué funciona, qué falta). | **IA** (Al final de cada sesión) | **Siempre** (Al inicio de cada chat) |
| `CODING_STANDARDS.md` | Las "Leyes" de código (TypeScript, Zod, etc.). | **Tú** (Solo si cambian las reglas) | **Frecuente** (Al pedir código nuevo) |
| `TECH_STACK.md` | Lista de herramientas permitidas. | **Tú** (Solo si añades librerías) | **Frecuente** (Al pedir nuevas features) |

---

## 2. Flujo de Trabajo (Workflow)

### 🟢 Al INICIAR una sesión (El "Onboarding")

**Objetivo:** Que la IA sepa dónde está y qué reglas seguir.

1.  Abre un nuevo chat.
2.  **Acción:** Copia y pega el contenido de `SESSION_START.md`.
3.  **Acción:** Dile a la IA: *"Lee también el archivo `.context/CURRENT_STATE.md` para saber en qué nos quedamos."*

> **Prompt Sugerido:**
> "Hola. Inicia el protocolo de sesión. Lee `.context/SESSION_START.md` y `.context/CURRENT_STATE.md`. Dame un resumen de dónde estamos antes de empezar."

### 🟡 Durante el DESARROLLO (Codificación)

**Objetivo:** Asegurar calidad y consistencia.

Cuando pidas una nueva funcionalidad (ej. "Crea el componente de Chat"):

1.  **Acción:** Recuérdale los estándares.

> **Prompt Sugerido:**
> "Vamos a crear el componente `ChatInterface`. Antes de generar el código, revisa `.context/CODING_STANDARDS.md` y `.context/TECH_STACK.md`. Asegúrate de usar Tailwind y TypeScript estricto."

### 🔴 Al FINALIZAR una sesión (El "Cierre")

**Objetivo:** Guardar el progreso para el "yo" del futuro.

1.  **Acción:** Pide a la IA que actualice el estado.

> **Prompt Sugerido:**
> "Hemos terminado por hoy. Por favor, actualiza el archivo `.context/CURRENT_STATE.md`.
> 1. Mueve lo que completamos a la sección 'Lo que Funciona'.
> 2. Agrega lo que quedó pendiente a 'En Progreso'.
> 3. Menciona los archivos clave que modificamos hoy."

---

## 3. Casos Especiales

### 🛠️ Cuando la IA "Alucina" o comete errores
Si la IA empieza a usar librerías raras (ej. Bootstrap) o escribe código sucio:

> **Prompt Correctivo:**
> "Detente. Estás violando las reglas del proyecto. Lee inmediatamente `.context/TECH_STACK.md` y `.context/CODING_STANDARDS.md` y corrige tu último código."

### 🚀 Cuando cambias de Fase (ej. Migración a Nube)
Si decides empezar la migración a Supabase:

1.  Pide a la IA que actualice `TECH_STACK.md` (cambiar "JSON Local" por "Supabase").
2.  Pide a la IA que actualice `CODING_STANDARDS.md` (agregar reglas sobre Prisma/SQL).

---

## 4. Filosofía

Este sistema convierte a la IA en un **empleado con memoria**. Tú eres el gerente; estos archivos son los manuales de procedimientos. Si los manuales están actualizados, el empleado funcionará perfecto. Si los manuales son viejos, el empleado cometerá errores.

**¡Mantén tu contexto limpio y tu código brillará!** ✨
