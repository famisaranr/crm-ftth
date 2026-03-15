'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { EmptyState } from '@/components/ErrorState';
import { apiGet } from '@/lib/api';

interface Subscriber {
    id: string;
    accountNumber: string;
    firstName: string;
    lastName: string;
    barangay: { name: string };
    plan: { name: string };
    status: string;
    accountBalance: number;
}

const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'badge-success', PROSPECT: 'badge-info', SURVEYED: 'badge-info',
    SUSPENDED_SOFT: 'badge-warning', SUSPENDED_HARD: 'badge-danger',
    DISCONNECTED: 'badge-danger', CHURNED: 'badge-neutral',
};



export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [search, setSearch] = useState('');
    const [barangay, setBarangay] = useState('all');
    const [status, setStatus] = useState('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const pageSize = 20;

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams({ page: String(page), limit: String(pageSize) });
            if (search) params.set('search', search);
            if (barangay !== 'all') params.set('barangay', barangay);
            if (status !== 'all') params.set('status', status);
            const res = await apiGet(`/subscribers?${params}`);
            if (res && res.data) {
                setSubscribers(res.data as Subscriber[]);
                setTotal((res.total as number) || (res.data as Subscriber[]).length);
            } else {
                throw new Error('No data');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [page, search, barangay, status]);

    useEffect(() => { loadData(); }, [loadData]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => { setPage(1); loadData(); }, 300);
        return () => clearTimeout(timer);
    }, [search, loadData]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return (
        <>
            <Header title="Subscribers" />
            <div className="page-content fade-in">
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Dashboard › Subscribers</p>

                <div className="card" style={{ marginBottom: '0' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <input className="form-input" placeholder="🔍 Search by account, name, or phone..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="form-select" value={barangay} onChange={e => { setBarangay(e.target.value); setPage(1); }}>
                            <option value="all">All Barangays</option>
                            <option value="Poblacion">Poblacion</option>
                            <option value="San Jose">San Jose</option>
                            <option value="San Isidro">San Isidro</option>
                            <option value="Bagumbayan">Bagumbayan</option>
                        </select>
                        <select className="form-select" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
                            <option value="all">All Status</option>
                            <option value="ACTIVE">Active</option>
                            <option value="PROSPECT">Prospect</option>
                            <option value="SUSPENDED_SOFT">Suspended (Soft)</option>
                            <option value="DISCONNECTED">Disconnected</option>
                        </select>
                        <Link href="/subscribers/new" className="btn btn-primary">+ New Subscriber</Link>
                    </div>

                    {loading ? <LoadingSkeleton rows={8} columns={6} /> : error ? (
                        <ErrorState onRetry={loadData} />
                    ) : subscribers.length === 0 ? (
                        <EmptyState icon="👥" title="No subscribers found" message="Try adjusting your search or filters." />
                    ) : (
                        <>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Account</th>
                                            <th>Name</th>
                                            <th>Barangay</th>
                                            <th>Plan</th>
                                            <th>Status</th>
                                            <th style={{ textAlign: 'right' }}>Balance</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {subscribers.map((s) => (
                                            <tr key={s.id || s.accountNumber} style={{ cursor: 'pointer' }} onClick={() => window.location.href = `/subscribers/${s.id}`}>
                                                <td><code style={{ fontSize: '12px' }}>{s.accountNumber}</code></td>
                                                <td style={{ fontWeight: 500 }}>{s.firstName} {s.lastName}</td>
                                                <td>{s.barangay?.name}</td>
                                                <td>{s.plan?.name}</td>
                                                <td><span className={`badge ${STATUS_COLORS[s.status] || 'badge-neutral'}`}>{s.status?.replace('_', ' ')}</span></td>
                                                <td style={{ textAlign: 'right' }} className="currency">₱{(s.accountBalance || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                                <td><Link href={`/subscribers/${s.id}`} className="btn btn-outline" onClick={(e) => Object.assign(e, { suppressHydrationWarning: true })} style={{ padding: '4px 12px', fontSize: '12px' }}>View</Link></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', fontSize: '13px', color: '#6b7280' }}>
                                <span>Showing {(page-1)*pageSize+1}-{Math.min(page*pageSize, total)} of {total.toLocaleString()}</span>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)} style={{ padding: '4px 10px', fontSize: '12px' }}>← Prev</button>
                                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
                                        <button key={p} className={`btn ${p === page ? 'btn-primary' : 'btn-outline'}`} onClick={() => setPage(p)} style={{ padding: '4px 10px', fontSize: '12px', minWidth: '32px' }}>{p}</button>
                                    ))}
                                    {totalPages > 5 && <span style={{ padding: '4px 6px' }}>...</span>}
                                    {totalPages > 5 && <button className="btn btn-outline" onClick={() => setPage(totalPages)} style={{ padding: '4px 10px', fontSize: '12px' }}>{totalPages}</button>}
                                    <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} style={{ padding: '4px 10px', fontSize: '12px' }}>Next →</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
