'use client';
import { useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import { MobileMenuProvider } from '@/components/MobileMenuContext';

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-light)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>🌐</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Loading FiberOps...</div>
                </div>
            </div>
        );
    }

    if (!user) return null; // AuthProvider will redirect to /login

    return (
        <MobileMenuProvider>
            <div className="app-layout">
                <Sidebar />
                <main className="main-content">{children}</main>
            </div>
        </MobileMenuProvider>
    );
}
