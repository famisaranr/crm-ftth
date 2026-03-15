'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    barangayScope?: string[];
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Hydrate from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('fiberops_token');
        const savedUser = localStorage.getItem('fiberops_user');
        
        if (savedToken && savedUser) {
            setToken(savedToken);
            try { 
                setUser(JSON.parse(savedUser)); 
            } catch { 
                localStorage.removeItem('fiberops_user');
                localStorage.removeItem('fiberops_token');
                setToken(null);
            }
        } else {
            localStorage.removeItem('fiberops_token');
            localStorage.removeItem('fiberops_user');
            setToken(null);
        }
        setIsLoading(false);
    }, []);

    // Redirect to login if not authenticated and not on whitelist
    useEffect(() => {
        const isPublicPath = pathname === '/login' || pathname.startsWith('/portal');
        if (!isLoading && (!token || !user) && !isPublicPath) {
            router.replace('/login');
        }
    }, [isLoading, token, user, pathname, router]);

    const login = useCallback(async (email: string, password: string) => {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Login failed');
        }

        const data = await res.json();
        const jwt = data.accessToken || data.token;
        const profile: User = data.user || {
            id: data.userId || 'unknown',
            email,
            name: data.name || email.split('@')[0],
            role: data.role || 'USER',
        };

        localStorage.setItem('fiberops_token', jwt);
        localStorage.setItem('fiberops_user', JSON.stringify(profile));
        setToken(jwt);
        setUser(profile);
        router.replace('/dashboard');
    }, [router]);

    const logout = useCallback(() => {
        localStorage.removeItem('fiberops_token');
        localStorage.removeItem('fiberops_user');
        setToken(null);
        setUser(null);
        router.replace('/login');
    }, [router]);

    return (
        <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}
