# 📚 Glosario Técnico de Desarrollo de Software

> **Propósito:** Este documento es una referencia educativa para entender los conceptos fundamentales que cualquier desarrollador debe conocer para construir sistemas modernos (Apps, SaaS, APIs, etc.).

---

## 📑 Índice

1. [Fundamentos de Arquitectura](#-1-fundamentos-de-arquitectura)
2. [Frontend vs Backend (El Contrato)](#-2-frontend-vs-backend-el-contrato)
3. [Patrones de Diseño](#-3-patrones-de-diseño)
4. [Base de Datos](#-4-base-de-datos)
5. [APIs y Comunicación](#-5-apis-y-comunicación)
6. [Gestión de Código](#-6-gestión-de-código)
7. [Calidad y Testing](#-7-calidad-y-testing)
8. [DevOps y Deployment](#-8-devops-y-deployment)
9. [Seguridad](#-9-seguridad)
10. [Conceptos de Negocio](#-10-conceptos-de-negocio)

---

## 🏗️ 1. Fundamentos de Arquitectura

### **Arquitectura de Software**
La estructura organizacional de un sistema. Define cómo se dividen las partes, cómo se comunican, y cómo escala.

### **Monolito**
Aplicación donde todo el código vive junto en un solo proyecto. Fácil de empezar, difícil de escalar.
```
┌─────────────────────────────────────┐
│           APLICACIÓN                │
│  ┌────────┐ ┌────────┐ ┌────────┐  │
│  │  UI    │ │ Lógica │ │   BD   │  │
│  └────────┘ └────────┘ └────────┘  │
└─────────────────────────────────────┘
```

### **Microservicios**
Aplicación dividida en servicios pequeños e independientes. Cada uno hace UNA cosa bien.
```
┌──────────┐  ┌──────────┐  ┌──────────┐
│ Servicio │  │ Servicio │  │ Servicio │
│  Users   │  │  Orders  │  │ Payments │
└────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
              ┌────▼────┐
              │   API   │
              │ Gateway │
              └─────────┘
```

### **Serverless**
No manejas servidores. El proveedor (AWS, Vercel) ejecuta tu código bajo demanda.
- **Ventaja:** Pagas solo por uso
- **Desventaja:** Cold starts, límites de tiempo

### **Arquitectura de N-Capas (Layers)**
División lógica del código en capas con responsabilidades específicas:
```
┌─────────────────────────────┐
│     PRESENTACIÓN (UI)       │  ← Lo que ve el usuario
├─────────────────────────────┤
│     LÓGICA DE NEGOCIO       │  ← Las reglas del sistema
├─────────────────────────────┤
│     ACCESO A DATOS          │  ← Comunicación con BD
├─────────────────────────────┤
│     BASE DE DATOS           │  ← Donde se guarda todo
└─────────────────────────────┘
```

---

## 🤝 2. Frontend vs Backend (El Contrato)

### **Frontend (Cliente)**
Todo lo que corre en el navegador o dispositivo del usuario.
- **Responsabilidades:** Mostrar datos, capturar inputs, validación visual
- **Tecnologías:** React, Vue, Angular, HTML/CSS/JS
- **No debe:** Guardar secretos, tomar decisiones de seguridad

### **Backend (Servidor)**
Todo lo que corre en servidores que TÚ controlas.
- **Responsabilidades:** Autenticación, autorización, lógica de negocio, acceso a BD
- **Tecnologías:** Node.js, Python, Go, Java
- **Debe:** Nunca confiar en el cliente, validar TODO

### **El Contrato (API Contract)**
Acuerdo entre Frontend y Backend sobre cómo comunicarse:

```
CONTRATO: Crear un Lead
═══════════════════════════════════════════════════════

📤 REQUEST (Frontend → Backend)
─────────────────────────────────
Método: POST
URL:    /api/leads
Headers:
  Content-Type: application/json
  Authorization: Bearer <token>

Body:
{
  "name": string (requerido, min 1 char),
  "phone": string (requerido, 10 dígitos),
  "email": string (opcional, formato email),
  "source": "01" | "02" | "03" | ... | "07"
}

═══════════════════════════════════════════════════════

📥 RESPONSE (Backend → Frontend)
─────────────────────────────────
Status 201 (Created):
{
  "id": "uuid",
  "name": "...",
  "createdAt": "ISO date",
  ...
}

Status 400 (Validation Error):
{
  "error": "Validation Error",
  "details": { ... }
}

Status 401 (No autorizado):
{
  "error": "Token inválido o expirado"
}

Status 500 (Error del servidor):
{
  "error": "Internal Server Error"
}
```

### **Regla de Oro: Nunca Confíes en el Cliente**
```
❌ MAL (Frontend decide):
Frontend: "El usuario es admin, déjalo borrar todo"
Backend:  "OK, borro todo"

✅ BIEN (Backend verifica):
Frontend: "Borra este lead"
Backend:  "¿Quién eres? ¿Tienes permiso? Verifico en MI base de datos... OK, borrado"
```

---

## 🎨 3. Patrones de Diseño

### **MVC (Model-View-Controller)**
Separación clásica de responsabilidades:
- **Model:** Datos y lógica de negocio
- **View:** Lo que se muestra al usuario
- **Controller:** Intermediario que procesa requests

### **Repository Pattern**
Capa que abstrae el acceso a datos. La UI no sabe si usas SQL, MongoDB, o archivos.
```typescript
// La UI solo sabe esto:
interface LeadRepository {
  getAll(): Promise<Lead[]>;
  create(lead: Lead): Promise<Lead>;
  update(id: string, data: Partial<Lead>): Promise<Lead>;
  delete(id: string): Promise<void>;
}

// La implementación puede ser cualquier cosa:
class PrismaLeadRepository implements LeadRepository { ... }
class JSONFileLeadRepository implements LeadRepository { ... }
class MockLeadRepository implements LeadRepository { ... }
```

### **Singleton**
Clase que solo puede tener UNA instancia en toda la aplicación.
```typescript
// Ejemplo: Cliente de base de datos
const prisma = globalThis.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalThis.prisma = prisma;
```

### **Factory Pattern**
Función o clase que crea objetos sin exponer la lógica de creación.
```typescript
function createLead(data: Partial<Lead>): Lead {
  return {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'new',
    tags: [],
    history: [],
    ...data
  };
}
```

### **Observer Pattern**
Objetos "observan" cambios en otros objetos y reaccionan.
- **Ejemplo:** React useState - cuando el estado cambia, el componente se re-renderiza

### **Dependency Injection (DI)**
Los componentes reciben sus dependencias en lugar de crearlas.
```typescript
// ❌ MAL - Crea su propia dependencia
class UserService {
  private db = new Database(); // Acoplado
}

// ✅ BIEN - Recibe la dependencia
class UserService {
  constructor(private db: Database) {} // Desacoplado
}
```

---

## 💾 4. Base de Datos

### **SQL vs NoSQL**
| Aspecto | SQL (PostgreSQL, MySQL) | NoSQL (MongoDB, Firebase) |
|---------|------------------------|---------------------------|
| Estructura | Tablas con esquema fijo | Documentos flexibles |
| Relaciones | Excelente (JOINs) | Limitado (denormalización) |
| Escala | Vertical | Horizontal |
| Uso ideal | Datos estructurados | Datos variables |

### **ORM (Object-Relational Mapping)**
Librería que traduce código a queries SQL automáticamente.
```typescript
// Sin ORM:
const result = await db.query('SELECT * FROM leads WHERE status = $1', ['new']);

// Con ORM (Prisma):
const leads = await prisma.lead.findMany({ where: { status: 'new' } });
```

### **Migrations (Migraciones)**
Archivos que definen cambios en la estructura de la BD de forma versionada.
```
migrations/
├── 001_create_leads_table.sql
├── 002_add_email_column.sql
└── 003_create_messages_table.sql
```

### **Índices**
Estructuras que aceleran búsquedas (como el índice de un libro).
```sql
-- Sin índice: Escanea TODA la tabla
SELECT * FROM leads WHERE phone = '5551234567';

-- Con índice: Va directo al registro
CREATE INDEX idx_leads_phone ON leads(phone);
```

### **Transacciones**
Grupo de operaciones que se ejecutan TODAS o NINGUNA.
```typescript
await prisma.$transaction([
  prisma.lead.create({ data: leadData }),
  prisma.message.create({ data: messageData }),
]);
// Si alguna falla, ambas se revierten
```

### **ACID**
Propiedades que garantizan integridad:
- **Atomicity:** Todo o nada
- **Consistency:** Datos siempre válidos
- **Isolation:** Transacciones no se interfieren
- **Durability:** Cambios permanentes

---

## 🔌 5. APIs y Comunicación

### **REST (Representational State Transfer)**
Estilo arquitectónico para APIs basado en recursos y verbos HTTP.
```
GET    /api/leads      → Obtener todos
GET    /api/leads/123  → Obtener uno
POST   /api/leads      → Crear
PATCH  /api/leads/123  → Actualizar parcial
PUT    /api/leads/123  → Reemplazar completo
DELETE /api/leads/123  → Eliminar
```

### **GraphQL**
Lenguaje de consulta donde el cliente pide EXACTAMENTE lo que necesita.
```graphql
query {
  lead(id: "123") {
    name
    phone
    messages {
      content
      timestamp
    }
  }
}
```

### **WebSockets**
Conexión bidireccional persistente. Ideal para chat, notificaciones en tiempo real.
```
HTTP Normal:          WebSocket:
Cliente → Servidor    Cliente ↔ Servidor
(una vez)             (conexión abierta)
```

### **Webhooks**
El servidor TE llama cuando algo pasa (inverso a polling).
```
Tu App                    Twilio
   │                        │
   │  "Avísame si llega    │
   │   un mensaje"         │
   │ ──────────────────►   │
   │                        │
   │   (Llega un mensaje)  │
   │                        │
   │  POST /webhook         │
   │ ◄──────────────────   │
   │  { from, body, ... }  │
```

### **Polling vs Push**
```
POLLING (ineficiente):
Cliente: "¿Hay mensajes?" → No
Cliente: "¿Hay mensajes?" → No
Cliente: "¿Hay mensajes?" → ¡Sí!

PUSH (eficiente):
Servidor: (silencio...)
Servidor: "¡Llegó un mensaje!" → Cliente
```

---

## 📦 6. Gestión de Código

### **Deuda Técnica (Technical Debt)**
Código "rápido y sucio" que funciona hoy pero costará mantener mañana.

| Tipo | Ejemplo | Costo Futuro |
|------|---------|--------------|
| Intencional | "Lo hago así para entregar, luego refactorizo" | Conocido |
| Accidental | "No sabía que había mejor forma" | Desconocido |

**Metáfora:** Es como una tarjeta de crédito. Puedes gastar ahora, pero pagarás intereses después.

### **Refactorización**
Mejorar la estructura del código SIN cambiar su comportamiento.
```typescript
// Antes (debt):
const x = data.filter(d => d.s === 'new' || d.s === 'cleaned');

// Después (refactorizado):
const newStatuses = ['new', 'cleaned'];
const activeLeads = leads.filter(lead => newStatuses.includes(lead.status));
```

### **Code Review (Revisión de Código)**
Proceso donde otro desarrollador revisa tu código antes de integrarlo.
- **Propósito:** Detectar bugs, compartir conocimiento, mantener estándares

### **Semantic Versioning (SemVer)**
Sistema de versionado: `MAJOR.MINOR.PATCH`
```
1.0.0 → 1.0.1  (PATCH: bug fixes, compatible)
1.0.1 → 1.1.0  (MINOR: nuevas features, compatible)
1.1.0 → 2.0.0  (MAJOR: cambios que rompen compatibilidad)
```

### **Git Flow**
Estrategia de ramas para desarrollo:
```
main (producción)
  │
  ├── develop (integración)
  │     │
  │     ├── feature/nueva-funcionalidad
  │     ├── feature/otra-cosa
  │     │
  │     └── release/1.2.0
  │
  └── hotfix/bug-crítico
```

---

## 🧪 7. Calidad y Testing

### **Tipos de Tests**
```
                    ▲
                   /│\    E2E Tests (pocos)
                  / │ \   Usuario real navegando
                 /  │  \
                /───┼───\    Integration Tests (algunos)
               /    │    \   Varios módulos juntos
              /     │     \
             /──────┼──────\    Unit Tests (muchos)
            /       │       \   Funciones individuales
           ─────────┴─────────
```

### **Unit Test (Prueba Unitaria)**
Prueba una sola función/componente aislado.
```typescript
// Función
function formatPhone(phone: string): string {
  return `+521${phone}`;
}

// Test
test('formatPhone adds Mexican prefix', () => {
  expect(formatPhone('5551234567')).toBe('+5215551234567');
});
```

### **Integration Test (Prueba de Integración)**
Prueba varios componentes trabajando juntos.
```typescript
test('API creates lead and returns with ID', async () => {
  const response = await fetch('/api/leads', {
    method: 'POST',
    body: JSON.stringify({ name: 'Test', phone: '5551234567' })
  });
  const lead = await response.json();
  expect(lead.id).toBeDefined();
});
```

### **E2E Test (End-to-End)**
Prueba el flujo completo como lo haría un usuario.
```typescript
test('User can create and view lead', async ({ page }) => {
  await page.goto('/leads');
  await page.click('button:text("Nuevo")');
  await page.fill('input[name="name"]', 'Juan');
  await page.click('button:text("Guardar")');
  await expect(page.locator('text=Juan')).toBeVisible();
});
```

### **TDD (Test-Driven Development)**
Escribir el test ANTES del código:
1. 🔴 Escribir test que falla
2. 🟢 Escribir código mínimo para pasar
3. 🔵 Refactorizar

### **Code Coverage**
Porcentaje de código cubierto por tests.
- **80%+:** Excelente
- **60-80%:** Aceptable
- **<60%:** Preocupante

---

## 🚀 8. DevOps y Deployment

### **CI/CD (Continuous Integration / Continuous Deployment)**
Automatización del proceso de build, test y deploy.
```
Push código → Build automático → Tests automáticos → Deploy automático
```

### **Entornos**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   LOCAL     │ →  │   STAGING   │ →  │ PRODUCTION  │
│ (tu laptop) │    │  (pruebas)  │    │  (clientes) │
└─────────────┘    └─────────────┘    └─────────────┘
```

### **Variables de Entorno**
Configuración que cambia según el entorno.
```bash
# .env.local
DATABASE_URL=localhost:5432/dev_db
DEBUG=true

# .env.production
DATABASE_URL=supabase.com:6543/prod_db
DEBUG=false
```

### **Containers (Docker)**
Empaquetan tu app con todas sus dependencias.
```
Tu código + Node.js + Dependencias = Imagen Docker
│
└── Corre igual en cualquier servidor
```

### **Rollback**
Volver a una versión anterior si algo sale mal.
```
v1.0 → v1.1 (bug) → ROLLBACK → v1.0
```

---

## 🔐 9. Seguridad

### **Autenticación vs Autorización**
```
AUTENTICACIÓN: "¿Quién eres?"
─────────────────────────────
Usuario: "Soy Juan"
Sistema: "Demuéstralo (password, biométrico, etc.)"
Usuario: ******
Sistema: "OK, eres Juan"

AUTORIZACIÓN: "¿Qué puedes hacer?"
─────────────────────────────
Juan: "Quiero borrar todos los leads"
Sistema: "Tu rol es 'Vendedor', solo puedes ver tus leads"
Juan: 🚫 Acceso denegado
```

### **JWT (JSON Web Token)**
Token firmado que contiene información del usuario.
```
Header.Payload.Signature
│       │        │
│       │        └── Firma para verificar autenticidad
│       └── { userId: "123", role: "admin", exp: "..." }
└── { alg: "HS256", typ: "JWT" }
```

### **OWASP Top 10**
Las 10 vulnerabilidades más comunes:
1. **Injection** (SQL, NoSQL, comandos)
2. **Broken Authentication**
3. **Sensitive Data Exposure**
4. **XML External Entities (XXE)**
5. **Broken Access Control**
6. **Security Misconfiguration**
7. **Cross-Site Scripting (XSS)**
8. **Insecure Deserialization**
9. **Using Components with Known Vulnerabilities**
10. **Insufficient Logging & Monitoring**

### **CORS (Cross-Origin Resource Sharing)**
Control de qué dominios pueden llamar tu API.
```
tu-app.com → api.tu-app.com  ✅ Permitido (misma organización)
hacker.com → api.tu-app.com  ❌ Bloqueado por CORS
```

### **Rate Limiting**
Limitar cuántas requests puede hacer un cliente.
```
IP 192.168.1.1:
  - Request 1: ✅
  - Request 2: ✅
  - ...
  - Request 100: ✅
  - Request 101: ❌ "Too Many Requests" (429)
```

---

## 💼 10. Conceptos de Negocio

### **SaaS (Software as a Service)**
Software que se renta por suscripción en la nube.
- **Ejemplos:** Slack, Salesforce, este CRM
- **Modelo:** Pago mensual/anual, sin instalación

### **Multi-tenancy**
Un sistema sirve a múltiples clientes (tenants) con datos aislados.
```
┌─────────────────────────────────────┐
│            APLICACIÓN               │
├───────────┬───────────┬─────────────┤
│ Empresa A │ Empresa B │ Empresa C   │
│ (datos)   │ (datos)   │ (datos)     │
└───────────┴───────────┴─────────────┘
```

### **MVP (Minimum Viable Product)**
Versión mínima de un producto para validar una hipótesis.
- **Incluye:** Lo esencial para funcionar
- **No incluye:** Features "nice to have"

### **Time to Market**
Tiempo desde idea hasta producto lanzado. Menor es mejor.

### **Technical Debt vs Business Value**
Balance entre calidad de código y velocidad de entrega.
```
                  DEBT
                   ↑
  "Entregar        │        "Perfecto pero
   rápido pero     │         nunca sale"
   con bugs"       │
                   │
   ─────────────────────────── BUSINESS VALUE →
                   │
         Punto     │
         Óptimo ───●
```

### **Escalabilidad**
Capacidad del sistema de manejar más carga.
- **Vertical:** Más poder al mismo servidor (más RAM, CPU)
- **Horizontal:** Más servidores haciendo lo mismo

### **Alta Disponibilidad (High Availability)**
Sistema que casi nunca se cae.
- **99.9%:** ~8.7 horas de downtime/año
- **99.99%:** ~52 minutos/año
- **99.999%:** ~5 minutos/año

---

## 📖 Recursos Adicionales

### Libros Recomendados
- "Clean Code" - Robert C. Martin
- "The Pragmatic Programmer" - Hunt & Thomas
- "Designing Data-Intensive Applications" - Martin Kleppmann

### Sitios Web
- [MDN Web Docs](https://developer.mozilla.org/)
- [freeCodeCamp](https://www.freecodecamp.org/)
- [Roadmap.sh](https://roadmap.sh/)

---

**Última actualización:** 06 de Diciembre, 2025
