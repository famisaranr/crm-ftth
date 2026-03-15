'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { StatCardSkeleton, CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { apiGet } from '@/lib/api';

interface Stat {
    label: string;
    value: string;
    trend: string;
    up: boolean;
}

interface Activity {
    time: string;
    action: string;
    detail: string;
    icon: string;
}

interface Revenue {
    name: string;
    revenue: string;
    value: number;
}

const FALLBACK_STATS: Stat[] = [
    { label: 'Total Subscribers', value: '1,250', trend: '+5.2%', up: true },
    { label: 'Active Connections', value: '1,087', trend: '+3.1%', up: true },
    { label: 'Monthly Revenue', value: '₱1,630,500', trend: '+8.4%', up: true },
    { label: 'Open Tickets', value: '23', trend: '-12%', up: true },
    { label: 'Collection Rate', value: '94.2%', trend: '+1.8%', up: true },
    { label: 'Suspended', value: '42', trend: '+3', up: false },
];

const FALLBACK_ACTIVITY: Activity[] = [
    { time: '2 min ago', action: 'Payment posted', detail: '₱1,500 from POB-00234 (Cash)', icon: '💳' },
    { time: '8 min ago', action: 'New subscriber', detail: 'Maria Santos – Brgy. San Jose', icon: '👤' },
    { time: '15 min ago', action: 'Ticket resolved', detail: 'TKT-2026-0892 – No signal (Poblacion)', icon: '✅' },
    { time: '22 min ago', action: 'Installation complete', detail: 'INS-2026-0341 – A. Luna (San Isidro)', icon: '🔧' },
    { time: '1 hr ago', action: 'Settlement approved', detail: 'March 2026 – Del Rosario Co.', icon: '🤝' },
];

const FALLBACK_REVENUE: Revenue[] = [
    { name: 'Poblacion', revenue: '₱520,000', value: 520000 },
    { name: 'San Jose', revenue: '₱410,000', value: 410000 },
    { name: 'San Isidro', revenue: '₱380,000', value: 380000 },
    { name: 'Bagumbayan', revenue: '₱320,500', value: 320500 },
];

export default function DashboardPage() {
    const [stats, setStats] = useState<Stat[]>([]);
    const [activity, setActivity] = useState<Activity[]>([]);
    const [revenue, setRevenue] = useState<Revenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [dashRes] = await Promise.allSettled([
                apiGet('/dashboards/corporate'),
            ]);
            if (dashRes.status === 'fulfilled' && dashRes.value) {
                setStats((dashRes.value.stats as Stat[]) || FALLBACK_STATS);
                setActivity((dashRes.value.activity as Activity[]) || FALLBACK_ACTIVITY);
                setRevenue((dashRes.value.revenue as Revenue[]) || FALLBACK_REVENUE);
            } else {
                throw new Error('API request failed');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    if (error) return <><Header title="Corporate Dashboard" /><div className="page-content"><ErrorState onRetry={loadData} /></div></>;

    const maxRevenue = Math.max(...revenue.map(r => r.value || 0), 1);

    return (
        <>
            <Header title="Corporate Dashboard" />
            <div className="page-content fade-in">
                {loading ? <StatCardSkeleton count={6} /> : (
                    <div className="stats-grid">
                        {stats.map((s) => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value">{s.value}</div>
                                <div className={`stat-trend ${s.up ? 'up' : 'down'}`}>
                                    {s.trend.startsWith('-') ? '▼' : '▲'} {s.trend.replace('+', '').replace('-', '')}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="grid-2"><CardSkeleton /><CardSkeleton /></div>
                ) : (
                    <div className="grid-2">
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Activity</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {activity.map((a, i) => (
                                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 0', borderBottom: i < activity.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                                        <span style={{ fontSize: '20px' }}>{a.icon}</span>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, fontSize: '13px' }}>{a.action}</div>
                                            <div style={{ fontSize: '12px', color: '#6b7280' }}>{a.detail}</div>
                                        </div>
                                        <span style={{ fontSize: '11px', color: '#9ca3af', whiteSpace: 'nowrap' }}>{a.time}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Revenue by Barangay</h3>
                            {revenue.map((b) => (
                                <div key={b.name} style={{ marginBottom: '14px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                        <span style={{ fontSize: '13px', fontWeight: 500 }}>{b.name}</span>
                                        <span className="currency" style={{ fontSize: '13px' }}>{b.revenue || `₱${(b.value || 0).toLocaleString()}`}</span>
                                    </div>
                                    <div style={{ height: '8px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${((b.value || 0) / maxRevenue) * 100}%`, background: 'linear-gradient(90deg, var(--primary), var(--primary-light))', borderRadius: '4px', transition: 'width 0.5s ease' }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
