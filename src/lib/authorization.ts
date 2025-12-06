import { NextRequest, NextResponse } from "next/server";
import { auth, hasMinRole } from "@/lib/auth";
import { UserRole } from "@/types";

// Tipo para el resultado de la autorización
export interface AuthResult {
    authorized: boolean;
    user?: {
        id: string;
        role: UserRole;
        organizationId?: string;
    };
    error?: string;
}

/**
 * Verifica si el usuario está autenticado
 */
export async function checkAuth(): Promise<AuthResult> {
    const session = await auth();

    if (!session?.user) {
        return {
            authorized: false,
            error: "No autorizado. Por favor inicia sesión.",
        };
    }

    return {
        authorized: true,
        user: {
            id: session.user.id,
            role: session.user.role,
            organizationId: session.user.organizationId,
        },
    };
}

/**
 * Verifica si el usuario tiene al menos cierto rol
 */
export async function checkRole(minRole: UserRole): Promise<AuthResult> {
    const authResult = await checkAuth();

    if (!authResult.authorized || !authResult.user) {
        return authResult;
    }

    if (!hasMinRole(authResult.user.role, minRole)) {
        return {
            authorized: false,
            error: `Acceso denegado. Se requiere rol ${minRole} o superior.`,
        };
    }

    return authResult;
}

/**
 * Verifica que el usuario pertenezca a una organización
 */
export async function checkOrganization(): Promise<AuthResult> {
    const authResult = await checkAuth();

    if (!authResult.authorized || !authResult.user) {
        return authResult;
    }

    // SUPER_ADMIN puede acceder a todo sin organización
    if (authResult.user.role === 'SUPER_ADMIN') {
        return authResult;
    }

    if (!authResult.user.organizationId) {
        return {
            authorized: false,
            error: "No estás asignado a ninguna organización.",
        };
    }

    return authResult;
}

/**
 * Wrapper para proteger API routes
 * Uso: 
 * export async function GET(req: NextRequest) {
 *     const { authorized, user, response } = await withAuth(req);
 *     if (!authorized) return response;
 *     // ... resto del código
 * }
 */
export async function withAuth(
    req: NextRequest,
    options?: {
        minRole?: UserRole;
        requireOrg?: boolean;
    }
): Promise<{
    authorized: boolean;
    user?: AuthResult["user"];
    response?: NextResponse;
}> {
    let result: AuthResult;

    if (options?.minRole) {
        result = await checkRole(options.minRole);
    } else if (options?.requireOrg) {
        result = await checkOrganization();
    } else {
        result = await checkAuth();
    }

    if (!result.authorized) {
        return {
            authorized: false,
            response: NextResponse.json(
                { error: result.error },
                { status: 401 }
            ),
        };
    }

    return {
        authorized: true,
        user: result.user,
    };
}

/**
 * Filtro de organización para queries de Prisma
 * Retorna el where clause apropiado según el rol del usuario
 */
export function getOrganizationFilter(user: AuthResult["user"]) {
    if (!user) return { organizationId: "INVALID" }; // Nunca matchea nada

    // SUPER_ADMIN ve todo
    if (user.role === 'SUPER_ADMIN') {
        return {}; // Sin filtro
    }

    // Otros roles solo ven su organización
    return {
        organizationId: user.organizationId || "INVALID",
    };
}

/**
 * Filtro de leads según rol y permisos
 */
export function getLeadFilter(user: AuthResult["user"]) {
    if (!user) return { id: "INVALID" };

    // SUPER_ADMIN ve todo
    if (user.role === 'SUPER_ADMIN') {
        return {};
    }

    const orgFilter = getOrganizationFilter(user);

    // AGENT solo ve sus leads asignados
    if (user.role === 'AGENT') {
        return {
            ...orgFilter,
            assignedToId: user.id,
        };
    }

    // MANAGER, DIRECTOR, ADMIN, OWNER ven todos los de su org
    return orgFilter;
}
