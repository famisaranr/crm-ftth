'use client';
import { useAuth } from '@/lib/auth';
import { useMobileMenu } from '@/components/MobileMenuContext';

export default function Header({ title }: { title: string }) {
    const { user, logout } = useAuth();
    const { toggle } = useMobileMenu();

    return (
        <header className="header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button className="mobile-menu-btn" onClick={toggle}>☰</button>
                <h1 className="header-title">{title}</h1>
            </div>
            <div className="header-actions">
                <div style={{ position: 'relative' }}>
                    <span style={{ fontSize: '20px', cursor: 'pointer' }}>🔔</span>
                    <span style={{ position: 'absolute', top: '-4px', right: '-6px', background: 'var(--danger)', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>3</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={logout}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>
                        {user?.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'CA'}
                    </div>
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600 }}>{user?.name || 'Corp Admin'}</div>
                        <div style={{ fontSize: '11px', color: '#6b7280' }}>{user?.email || 'admin@fiberops.ph'}</div>
                    </div>
                </div>
            </div>
        </header>
    );
}
