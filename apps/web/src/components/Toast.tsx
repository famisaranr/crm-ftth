'use client';
import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from 'react';

interface Toast {
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
}

interface ToastContextType {
    toast: (type: Toast['type'], message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((type: Toast['type'], message: string) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, type, message }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    return (
        <ToastContext.Provider value={{ toast: addToast }}>
            {children}
            <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {toasts.map(t => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

const icons: Record<string, string> = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
const colors: Record<string, string> = {
    success: '#10b981', error: '#ef4444', info: '#3b82f6', warning: '#f59e0b'
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const [visible, setVisible] = useState(false);
    useEffect(() => { requestAnimationFrame(() => setVisible(true)); }, []);

    return (
        <div
            onClick={onDismiss}
            style={{
                background: '#fff',
                borderLeft: `4px solid ${colors[toast.type]}`,
                borderRadius: '8px',
                padding: '12px 16px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                minWidth: '300px',
                cursor: 'pointer',
                transform: visible ? 'translateX(0)' : 'translateX(100%)',
                opacity: visible ? 1 : 0,
                transition: 'all 0.3s ease',
            }}
        >
            <span style={{ fontSize: '18px' }}>{icons[toast.type]}</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#1f2937' }}>{toast.message}</span>
        </div>
    );
}
