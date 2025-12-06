'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface MobileContextType {
    isMobile: boolean;
    isTablet: boolean;
    isDesktop: boolean;
}

const MobileContext = createContext<MobileContextType>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
});

export const useMobile = () => useContext(MobileContext);

export function MobileProvider({ children }: { children: React.ReactNode }) {
    const [screenSize, setScreenSize] = useState<MobileContextType>({
        isMobile: false,
        isTablet: false,
        isDesktop: true,
    });

    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setScreenSize({
                isMobile: width < 768,      // < 768px = móvil
                isTablet: width >= 768 && width < 1024,  // 768-1024 = tablet
                isDesktop: width >= 1024,   // >= 1024 = desktop
            });
        };

        // Check inicial
        checkScreenSize();

        // Listener para cambios de tamaño
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    return (
        <MobileContext.Provider value={screenSize}>
            {children}
        </MobileContext.Provider>
    );
}
