const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface ApiOptions {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
}

let accessToken: string | null = null;

export function setToken(token: string | null) {
    accessToken = token;
    if (token) localStorage.setItem('fiberops_token', token);
    else localStorage.removeItem('fiberops_token');
}

export function getToken(): string | null {
    if (accessToken) return accessToken;
    if (typeof window !== 'undefined') {
        accessToken = localStorage.getItem('fiberops_token');
    }
    return accessToken;
}

export async function api<T = unknown>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const token = getToken();
    const res = await fetch(`${API_URL}${endpoint}`, {
        method: options.method || 'GET',
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (res.status === 401) {
        setToken(null);
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Unauthorized');
    }

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'API Error');
    return data as T;
}

export const apiGet = <T = Record<string, unknown>>(url: string) => api<T>(url);
export const apiPost = <T = Record<string, unknown>>(url: string, body: unknown) => api<T>(url, { method: 'POST', body });
export const apiPut = <T = Record<string, unknown>>(url: string, body: unknown) => api<T>(url, { method: 'PUT', body });
export const apiPatch = <T = Record<string, unknown>>(url: string, body: unknown) => api<T>(url, { method: 'PATCH', body });
export const apiDelete = <T = Record<string, unknown>>(url: string) => api<T>(url, { method: 'DELETE' });
