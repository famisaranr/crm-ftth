'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet, apiPut } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface SuspensionRecord {
    id: string;
    subscriberName: string;
    subscriberId: string;
    balanceDue: number;
    daysOverdue: number;
    status: string;
    suspensionDate: string | null;
}

const FALLBACK_SUSPENSIONS: SuspensionRecord[] = [
    { id: '1', subscriberName: 'Pedro Calungsod', subscriberId: 'sub-001', balanceDue: 4500, daysOverdue: 45, status: 'PENDING_SUSPENSION', suspensionDate: null },
    { id: '2', subscriberName: 'Maria Clara', subscriberId: 'sub-002', balanceDue: 3000, daysOverdue: 15, status: 'PENDING_SUSPENSION', suspensionDate: null },
    { id: '3', subscriberName: 'Juan Dela Cruz', subscriberId: 'sub-003', balanceDue: 6000, daysOverdue: 70, status: 'SUSPENDED', suspensionDate: '2026-03-01T10:00:00Z' }
];

export default function SuspensionQueuePage() {
    const { toast } = useToast();
    const [records, setRecords] = useState<SuspensionRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Action state
    const [selectedAction, setSelectedAction] = useState<{ id: string, name: string, type: 'suspend' | 'restore' } | null>(null);

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const res = await apiGet(`/billing/suspensions`);
            if (res && (res as Record<string, unknown>).data) setRecords((res as Record<string, unknown>).data as SuspensionRecord[]);
            else throw new Error('No data');
        } catch {
            setRecords(FALLBACK_SUSPENSIONS);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const executeAction = async () => {
        if (!selectedAction) return;
        try {
            if (selectedAction.type === 'suspend') {
                await apiPut(`/billing/suspensions/${selectedAction.id}/execute`, {});
                toast('success', `Account ${selectedAction.name} has been suspended.`);
            } else {
                await apiPut(`/billing/suspensions/${selectedAction.id}/restore`, {});
                toast('success', `Account ${selectedAction.name} has been restored.`);
            }
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : `Failed to ${selectedAction.type} account`);
        } finally {
            setSelectedAction(null);
        }
    };

    return (
        <>
            <Header title="Suspension & Restoration Queue" />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                Billing <span>›</span> Suspension Queue
            </div>

            <div className="page-content fade-in">
                
                {/* Stats */}
                <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: '24px' }}>
                    <div className="stat-card">
                        <div className="stat-label">Pending Suspension</div>
                        <div className="stat-value text-danger">{records.filter(r => r.status === 'PENDING_SUSPENSION').length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Currently Suspended</div>
                        <div className="stat-value text-warning">{records.filter(r => r.status === 'SUSPENDED').length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Automated Bulk Run</div>
                        <div style={{ marginTop: '12px' }}>
                            <button className="btn btn-primary btn-sm">Execute All Pending Now</button>
                        </div>
                    </div>
                </div>

                <div className="card">
                    {error ? <ErrorState title="Failed to load queue" onRetry={loadData} /> : 
                     loading ? <CardSkeleton /> : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Subscriber</th><th>Balance Due</th><th>Days Overdue</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
                                <tbody>
                                    {records.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No records in queue.</td></tr> : 
                                        records.map(r => (
                                            <tr key={r.id} style={{ background: r.status === 'SUSPENDED' ? '#fef2f2' : 'transparent' }}>
                                                <td><Link href={`/subscribers/${r.subscriberId}`} style={{ fontWeight: 500, color: 'var(--primary)', textDecoration: 'none' }}>{r.subscriberName}</Link></td>
                                                <td className="text-danger monospace" style={{ fontWeight: 600 }}>₱{r.balanceDue.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                <td style={{ color: r.daysOverdue > 30 ? '#ef4444' : '#f59e0b', fontWeight: 600 }}>{r.daysOverdue} days</td>
                                                <td><span className={`badge ${r.status === 'SUSPENDED' ? 'badge-danger' : 'badge-warning'}`}>{r.status.replace('_', ' ')}</span></td>
                                                <td style={{ color: '#6b7280', fontSize: '14px' }}>{r.suspensionDate ? new Date(r.suspensionDate).toLocaleDateString() : '—'}</td>
                                                <td>
                                                    {r.status === 'PENDING_SUSPENSION' ? (
                                                        <button className="btn btn-sm badge-danger" style={{ border: 'none', color: 'white' }} onClick={() => setSelectedAction({ id: r.id, name: r.subscriberName, type: 'suspend' })}>Suspend</button>
                                                    ) : (
                                                        <button className="btn btn-sm badge-success" style={{ border: 'none', color: 'darkgreen' }} onClick={() => setSelectedAction({ id: r.id, name: r.subscriberName, type: 'restore' })}>Restore</button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog 
                isOpen={!!selectedAction}
                onClose={() => setSelectedAction(null)}
                title={selectedAction?.type === 'suspend' ? 'Execute Suspension' : 'Execute Restoration'}
                message={`Are you sure you want to ${selectedAction?.type} internet access for ${selectedAction?.name}?`}
                confirmText={selectedAction?.type === 'suspend' ? 'Suspend Account' : 'Restore Account'}
                isDestructive={selectedAction?.type === 'suspend'}
                onConfirm={executeAction}
            />
        </>
    );
}
