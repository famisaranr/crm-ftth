'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface MobileMenuContextType {
    isOpen: boolean;
    toggle: () => void;
    close: () => void;
}

const MobileMenuContext = createContext<MobileMenuContextType>({
    isOpen: false,
    toggle: () => {},
    close: () => {}
});

export function MobileMenuProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <MobileMenuContext.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen), close: () => setIsOpen(false) }}>
            {children}
            {/* Optional backdrop for mobile */}
            {isOpen && (
                <div 
                    className="mobile-backdrop" 
                    onClick={() => setIsOpen(false)}
                />
            )}
        </MobileMenuContext.Provider>
    );
}

export const useMobileMenu = () => useContext(MobileMenuContext);
