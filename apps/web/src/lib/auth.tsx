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

// Map API role names (human-readable) → sidebar role keys (SCREAMING_SNAKE_CASE)
const ROLE_MAP: Record<string, string> = {
    'Super Admin':          'SUPER_ADMIN',
    'Corporate Admin':      'SYSTEM_ADMIN',
    'Operations Manager':   'MANAGER_NOC',
    'Barangay Manager':     'MANAGER_CX',
    'JV Partner Viewer':    'PARTNER_ADMIN',
    'Finance Officer':      'MANAGER_FINANCE',
    'Collection Officer':   'AGENT_BILLING',
    'Network Engineer':     'AGENT_TECH',
    'Field Technician':     'FIELD_TECH',
    'Customer Service':     'AGENT_CX',
    'Auditor':              'SYSTEM_ADMIN',
    'Read-only Executive':  'PARTNER_ADMIN',
};
function normalizeRole(role: string): string {
    return ROLE_MAP[role] || role.toUpperCase().replace(/\s+/g, '_');
}

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

        const raw = await res.json();

        if (!res.ok) {
            throw new Error(raw?.error?.message || raw?.message || 'Login failed');
        }

        // API wraps response in { success, data: { ... } }
        const payload = raw.data || raw;
        const jwt = payload.access_token || payload.accessToken || payload.token;
        if (!jwt) throw new Error('No token received from server');

        const apiUser = payload.user || {};
        const profile: User = {
            id: apiUser.id || 'unknown',
            email: apiUser.email || email,
            name: apiUser.full_name || apiUser.name || email.split('@')[0],
            role: normalizeRole(apiUser.roles?.[0] || apiUser.role || 'USER'),
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
