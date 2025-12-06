import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Rutas públicas que no requieren autenticación
const publicRoutes = ["/login", "/api/auth"];

// Rutas de API que deben ser protegidas
const protectedApiRoutes = ["/api/leads", "/api/upload", "/api/whatsapp"];

export default auth((req) => {
    const { nextUrl, auth: session } = req;
    const isLoggedIn = !!session;
    const pathname = nextUrl.pathname;

    // Verificar si es una ruta pública
    const isPublicRoute = publicRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Verificar si es una ruta de API protegida
    const isProtectedApiRoute = protectedApiRoutes.some(route =>
        pathname.startsWith(route)
    );

    // Si es ruta pública, permitir acceso
    if (isPublicRoute) {
        // Si ya está logueado y va a /login, redirigir a home
        if (isLoggedIn && pathname === "/login") {
            return NextResponse.redirect(new URL("/", nextUrl));
        }
        return NextResponse.next();
    }

    // Si no está logueado
    if (!isLoggedIn) {
        // Si es API, retornar 401
        if (isProtectedApiRoute) {
            return NextResponse.json(
                { error: "No autorizado. Por favor inicia sesión." },
                { status: 401 }
            );
        }
        // Si es página, redirigir a login
        return NextResponse.redirect(new URL("/login", nextUrl));
    }

    // Usuario autenticado, permitir acceso
    return NextResponse.next();
});

// Configurar qué rutas debe procesar el middleware
export const config = {
    matcher: [
        // Excluir archivos estáticos y _next
        "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
    ],
};
