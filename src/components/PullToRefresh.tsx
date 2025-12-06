'use client';

import { useState, useRef, useCallback, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';
import clsx from 'clsx';

interface PullToRefreshProps {
    children: ReactNode;
    onRefresh: () => Promise<void>;
    className?: string;
}

export function PullToRefresh({ children, onRefresh, className }: PullToRefreshProps) {
    const [isPulling, setIsPulling] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);

    const containerRef = useRef<HTMLDivElement>(null);
    const startY = useRef(0);
    const currentY = useRef(0);

    const THRESHOLD = 80; // Distancia mínima para activar refresh
    const MAX_PULL = 120; // Distancia máxima de pull

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Solo permitir pull si estamos en la parte superior
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            setIsPulling(true);
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling || isRefreshing) return;

        currentY.current = e.touches[0].clientY;
        const diff = currentY.current - startY.current;

        // Solo hacia abajo y si estamos en la parte superior
        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            // Aplicar resistencia al pull (se hace más difícil entre más jalas)
            const resistance = 0.5;
            const distance = Math.min(diff * resistance, MAX_PULL);
            setPullDistance(distance);

            // Prevenir scroll normal cuando estamos haciendo pull
            if (distance > 10) {
                e.preventDefault();
            }
        }
    }, [isPulling, isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling) return;

        if (pullDistance >= THRESHOLD && !isRefreshing) {
            // Activar refresh
            setIsRefreshing(true);
            setPullDistance(60); // Mantener visible mientras carga

            try {
                await onRefresh();
            } catch (error) {
                console.error('Error refreshing:', error);
            }

            setIsRefreshing(false);
        }

        // Reset
        setIsPulling(false);
        setPullDistance(0);
    }, [isPulling, pullDistance, isRefreshing, onRefresh]);

    const progress = Math.min(pullDistance / THRESHOLD, 1);
    const rotation = progress * 180;

    return (
        <div
            ref={containerRef}
            className={clsx("relative overflow-y-auto", className)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Indicador de Pull-to-Refresh */}
            <div
                className={clsx(
                    "absolute left-0 right-0 flex justify-center items-center transition-all duration-200 z-10",
                    pullDistance > 0 ? "opacity-100" : "opacity-0"
                )}
                style={{
                    top: -40 + pullDistance,
                    height: 40,
                }}
            >
                <div className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-full",
                    "bg-slate-800/90 backdrop-blur-sm border border-white/10",
                    isRefreshing && "animate-pulse"
                )}>
                    <RefreshCw
                        className={clsx(
                            "h-4 w-4 text-blue-400 transition-transform",
                            isRefreshing && "animate-spin"
                        )}
                        style={{
                            transform: isRefreshing ? undefined : `rotate(${rotation}deg)`
                        }}
                    />
                    <span className="text-xs text-slate-300">
                        {isRefreshing
                            ? 'Actualizando...'
                            : pullDistance >= THRESHOLD
                                ? 'Suelta para actualizar'
                                : 'Desliza para actualizar'
                        }
                    </span>
                </div>
            </div>

            {/* Contenido con transformación */}
            <div
                className="transition-transform duration-200"
                style={{
                    transform: pullDistance > 0 ? `translateY(${pullDistance}px)` : undefined
                }}
            >
                {children}
            </div>
        </div>
    );
}
