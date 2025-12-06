import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@/types";

export const { handlers, signIn, signOut, auth } = NextAuth({
    // @ts-ignore - Versión beta de NextAuth tiene conflictos de tipos menores
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                // Obtener datos completos del usuario
                const dbUser = await prisma.user.findUnique({
                    where: { id: user.id },
                    include: {
                        organization: {
                            select: { id: true, name: true }
                        }
                    }
                });

                // Agregar datos a la sesión
                session.user.id = user.id;
                session.user.role = (dbUser?.role as UserRole) || "AGENT";
                session.user.organizationId = dbUser?.organizationId || undefined;
                session.user.organizationName = dbUser?.organization?.name || undefined;
            }
            return session;
        },
        async signIn({ user, account, profile }) {
            // Aquí podríamos agregar lógica para:
            // - Auto-asignar a una organización por dominio de email
            // - Crear organización automáticamente para nuevos usuarios
            // - Bloquear ciertos dominios
            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "database",
    },
    events: {
        async createUser({ user }) {
            // Cuando se crea un nuevo usuario:
            // Por ahora, lo dejamos como AGENT sin organización
            // El SUPER_ADMIN lo asignará después
            console.log(`🆕 Nuevo usuario creado: ${user.email}`);
        },
    },
});

// ============================================
// HELPERS DE AUTORIZACIÓN
// ============================================

// Orden jerárquico de roles
const ROLE_HIERARCHY: Record<UserRole, number> = {
    'AGENT': 1,
    'MANAGER': 2,
    'DIRECTOR': 3,
    'ADMIN': 4,
    'OWNER': 5,
    'SUPER_ADMIN': 6,
};

// Verificar si el usuario tiene al menos cierto rol
export function hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Obtener la sesión actual (para uso en server components)
export async function getCurrentUser() {
    const session = await auth();
    if (!session?.user) return null;

    return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
        organizationId: session.user.organizationId,
        organizationName: session.user.organizationName,
    };
}

// Verificar autorización
export async function requireAuth() {
    const user = await getCurrentUser();
    if (!user) {
        throw new Error("No autorizado");
    }
    return user;
}

// Verificar rol mínimo
export async function requireRole(minRole: UserRole) {
    const user = await requireAuth();
    if (!hasMinRole(user.role, minRole)) {
        throw new Error(`Se requiere rol ${minRole} o superior`);
    }
    return user;
}

// Verificar que pertenece a una organización
export async function requireOrganization() {
    const user = await requireAuth();
    if (!user.organizationId) {
        throw new Error("Usuario no asignado a ninguna organización");
    }
    return user;
}
