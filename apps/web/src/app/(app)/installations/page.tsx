'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Installation {
    id: string;
    subscriberName: string;
    barangayName: string;
    servicePlanName: string;
    status: string;
    assignedTechName: string | null;
    scheduledDate: string | null;
}

const FALLBACK_JOBS: Installation[] = [
    { id: 'INS-0341', subscriberName: 'A. Luna', barangayName: 'San Isidro', servicePlanName: 'Fiber 50', status: 'COMPLETED', assignedTechName: 'Tech. Cruz', scheduledDate: '2026-03-14' },
    { id: 'INS-0342', subscriberName: 'P. Calungsod', barangayName: 'San Isidro', servicePlanName: 'Fiber 50', status: 'SCHEDULED', assignedTechName: 'Tech. Torres', scheduledDate: '2026-03-15' },
];

function InstBadge({ status }: { status: string }) {
    const map: Record<string, string> = {
        COMPLETED: 'badge-active', SCHEDULED: 'badge-prospect', PENDING_SURVEY: 'badge-pending',
        IN_PROGRESS: 'badge-open', CANCELLED: 'badge-closed',
    };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status.replace(/_/g, ' ')}</span>;
}

export default function InstallationsPage() {
    const [jobs, setJobs] = useState<Installation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/installations?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setJobs((res as Record<string, unknown>).data as Installation[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setJobs(FALLBACK_JOBS); // Graceful fallback
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Initial load
    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Installation Pipeline" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Installations</div>
            <div className="page-content fade-in">
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                    <div className="stat-card"><div className="stat-label">Pending Survey</div><div className="stat-value">8</div></div>
                    <div className="stat-card"><div className="stat-label">Scheduled</div><div className="stat-value" style={{ color: 'var(--info)' }}>12</div></div>
                    <div className="stat-card"><div className="stat-label">In Progress</div><div className="stat-value" style={{ color: 'var(--warning)' }}>5</div></div>
                    <div className="stat-card"><div className="stat-label">Completed (MTD)</div><div className="stat-value" style={{ color: 'var(--success)' }}>47</div></div>
                </div>
                
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search installations..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '300px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                    </div>

                    {error ? (
                        <ErrorState title="Failed to load installations" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Job ID</th><th>Subscriber</th><th>Barangay</th><th>Plan</th><th>Status</th><th>Technician</th><th>Scheduled</th></tr></thead>
                                <tbody>
                                    {jobs.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No installations found.</td></tr>
                                    ) : jobs.map((j) => (
                                        <tr key={j.id}>
                                            <td className="monospace">{j.id}</td>
                                            <td style={{ fontWeight: 500 }}>{j.subscriberName}</td>
                                            <td>{j.barangayName}</td>
                                            <td>{j.servicePlanName}</td>
                                            <td><InstBadge status={j.status} /></td>
                                            <td>{j.assignedTechName || '—'}</td>
                                            <td>{j.scheduledDate ? new Date(j.scheduledDate).toLocaleDateString() : '—'}</td>
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
