'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Settlement {
    id: string;
    partnerName: string;
    barangayName: string;
    periodStr: string;
    grossRevenue: number;
    netRevenue: number;
    partnerShare: number;
    status: string;
}


function SettlementBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        CALCULATED: 'badge-pending', UNDER_REVIEW: 'badge-open', APPROVED: 'badge-active',
        DISBURSED: 'badge-active', LOCKED: 'badge-closed', DRAFTED: 'badge-prospect',
    };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.replace('_', ' ')}</span>;
}

export default function SettlementsPage() {
    const [settlements, setSettlements] = useState<Settlement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (status) params.set('status', status);
            
            const res = await apiGet(`/settlements?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setSettlements((res as Record<string, unknown>).data as Settlement[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [search, status]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => { loadData(); }, 300);
        return () => clearTimeout(timer);
    }, [search, status, loadData]);

    return (
        <>
            <Header title="Settlements & Revenue Sharing" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Settlements</div>
            <div className="page-content fade-in">
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card"><div className="stat-label">Total Revenue (MTD)</div><div className="stat-value">₱1.31M</div></div>
                    <div className="stat-card"><div className="stat-label">Partner Distributions</div><div className="stat-value" style={{ color: 'var(--info)' }}>₱353.7K</div></div>
                    <div className="stat-card"><div className="stat-label">Operator Retained</div><div className="stat-value" style={{ color: 'var(--success)' }}>₱825.3K</div></div>
                </div>
                
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search partner or barangay..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <div className="flex gap-2">
                            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '150px' }}>
                                <option value="">All Status</option>
                                <option value="CALCULATED">CALCULATED</option>
                                <option value="UNDER_REVIEW">UNDER_REVIEW</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="LOCKED">LOCKED</option>
                            </select>
                            <button className="btn btn-primary">+ New Settlement</button>
                        </div>
                    </div>
                    
                    {error ? (
                        <ErrorState title="Failed to load settlements" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr>
                                    <th>Partner</th><th>Barangay</th><th>Period</th><th style={{ textAlign: 'right' }}>Gross Revenue</th><th style={{ textAlign: 'right' }}>Net Revenue</th><th style={{ textAlign: 'right' }}>Partner Share</th><th>Status</th><th></th>
                                </tr></thead>
                                <tbody>
                                    {settlements.length === 0 ? (
                                        <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No settlements found.</td></tr>
                                    ) : settlements.map((s) => (
                                        <tr key={s.id}>
                                            <td style={{ fontWeight: 500 }}>{s.partnerName}</td>
                                            <td>{s.barangayName}</td>
                                            <td>{s.periodStr}</td>
                                            <td className="currency text-right">₱{Number(s.grossRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                            <td className="currency text-right">₱{Number(s.netRevenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                            <td className="currency text-right" style={{ color: 'var(--info)', fontWeight: 600 }}>₱{Number(s.partnerShare).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                            <td><SettlementBadge status={s.status} /></td>
                                            <td>
                                                {s.status === 'CALCULATED' && <button className="btn btn-primary btn-sm">Submit</button>}
                                                {s.status === 'UNDER_REVIEW' && <button className="btn btn-primary btn-sm">Approve</button>}
                                                {s.status === 'APPROVED' && <button className="btn btn-outline btn-sm">Disburse</button>}
                                                {s.status === 'LOCKED' && <span style={{ fontSize: '14px' }}>🔒</span>}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
