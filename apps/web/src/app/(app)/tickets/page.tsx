'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Ticket {
    id: string;
    ticketNumber: string;
    subscriberName: string;
    subject: string;
    priority: string;
    status: string;
    assigneeName: string | null;
    createdAt: string;
}



function PriorityBadge({ priority }: { priority: string }) {
    const map: Record<string, { cls: string; label: string }> = {
        P1_CRITICAL: { cls: 'badge-danger', label: 'P1' },
        P2_HIGH: { cls: 'badge-warning', label: 'P2' },
        P3_MEDIUM: { cls: 'badge-pending', label: 'P3' },
        P4_LOW: { cls: 'badge-prospect', label: 'P4' },
    };
    const p = map[priority] || { cls: 'badge-pending', label: priority };
    return <span className={`badge ${p.cls}`}>{p.label}</span>;
}

function StatusBadge({ status }: { status: string }) {
    const map: Record<string, string> = { OPEN: 'badge-open', ASSIGNED: 'badge-pending', RESOLVED: 'badge-resolved', CLOSED: 'badge-closed' };
    return <span className={`badge ${map[status] || 'badge-pending'}`}>{status}</span>;
}

export default function TicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('');
    const [status, setStatus] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (priority) params.set('priority', priority);
            if (status) params.set('status', status);
            
            const res = await apiGet(`/tickets?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setTickets((res as Record<string, unknown>).data as Ticket[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [search, priority, status]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => { loadData(); }, 300);
        return () => clearTimeout(timer);
    }, [search, priority, status, loadData]);

    return (
        <>
            <Header title="Service Tickets" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Tickets</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search ticket ID, subscriber..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <div className="flex gap-2">
                            <select className="form-select" value={priority} onChange={(e) => setPriority(e.target.value)} style={{ width: '130px' }}>
                                <option value="">All Priority</option><option value="P1_CRITICAL">P1_CRITICAL</option><option value="P2_HIGH">P2_HIGH</option><option value="P3_MEDIUM">P3_MEDIUM</option><option value="P4_LOW">P4_LOW</option>
                            </select>
                            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)} style={{ width: '130px' }}>
                                <option value="">All Status</option><option value="OPEN">OPEN</option><option value="ASSIGNED">ASSIGNED</option><option value="RESOLVED">RESOLVED</option><option value="CLOSED">CLOSED</option>
                            </select>
                            <button className="btn btn-primary">+ New Ticket</button>
                        </div>
                    </div>
                    
                    {error ? (
                        <ErrorState title="Failed to load tickets" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Ticket ID</th><th>Subscriber</th><th>Subject</th><th>Priority</th><th>Status</th><th>Assignee</th><th>Created</th></tr></thead>
                                <tbody>
                                    {tickets.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No tickets found.</td></tr>
                                    ) : tickets.map((t) => (
                                        <tr key={t.id}>
                                            <td className="monospace">{t.ticketNumber}</td>
                                            <td>{t.subscriberName}</td>
                                            <td style={{ fontWeight: 500 }}>{t.subject}</td>
                                            <td><PriorityBadge priority={t.priority} /></td>
                                            <td><StatusBadge status={t.status} /></td>
                                            <td>{t.assigneeName || '—'}</td>
                                            <td>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
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
