'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import { StatCardSkeleton } from '@/components/LoadingSkeleton';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { apiGet } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
    PAID: 'badge-success', OVERDUE: 'badge-danger', PARTIALLY_PAID: 'badge-warning',
    GENERATED: 'badge-info', VOID: 'badge-neutral',
};

const DEMO_STATS = [
    { label: 'Total Billed', value: '₱1.63M', color: '' },
    { label: 'Collected', value: '₱1.53M', color: 'var(--success)' },
    { label: 'Outstanding', value: '₱97.5K', color: 'var(--warning)' },
    { label: 'Overdue', value: '₱42.0K', color: 'var(--danger)' },
];



export default function BillingPage() {
    interface Invoice {
        id: string;
        invoiceNumber: string;
        subscriberName: string;
        amount: number;
        paid: number;
        dueDate: string;
        status: string;
    }

    const [stats, setStats] = useState(DEMO_STATS);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [generatingInvoices, setGeneratingInvoices] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [invRes, statRes] = await Promise.allSettled([
                apiGet('/billing/invoices'),
                apiGet('/billing/cycles')
            ]);
            
            if (invRes.status === 'fulfilled' && invRes.value && invRes.value.data) {
                setInvoices(invRes.value.data as Invoice[]);
            } else throw new Error('No invoice data');
            
            if (statRes.status === 'fulfilled' && statRes.value && statRes.value.stats) {
                setStats(statRes.value.stats as Array<{ label: string; value: string; color: string; }>);
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = invoices.filter(inv => {
        if (statusFilter !== 'all' && inv.status !== statusFilter) return false;
        if (search) {
            const q = search.toLowerCase();
            return inv.invoiceNumber?.toLowerCase().includes(q) || inv.subscriberName?.toLowerCase().includes(q);
        }
        return true;
    });

    const handleGenerate = async () => {
        setGeneratingInvoices(true);
        setTimeout(() => { setGeneratingInvoices(false); }, 2000);
    };

    return (
        <>
            <Header title="Billing & Invoices" />
            <div className="page-content fade-in">
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Dashboard › Billing</p>

                {error ? (
                    <ErrorState onRetry={loadData} />
                ) : loading ? <StatCardSkeleton count={4} /> : (
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                        {stats.map(s => (
                            <div key={s.label} className="stat-card">
                                <div className="stat-label">{s.label}</div>
                                <div className="stat-value" style={{ color: s.color || 'inherit' }}>{s.value}</div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="card" style={{ marginTop: '20px' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <div style={{ flex: 1, minWidth: '240px' }}>
                            <input className="form-input" placeholder="🔍 Search invoice number or subscriber..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <select className="form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="all">All Status</option>
                            <option value="PAID">Paid</option>
                            <option value="OVERDUE">Overdue</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                            <option value="GENERATED">Generated</option>
                        </select>
                        <button className="btn btn-primary" onClick={handleGenerate} disabled={generatingInvoices}>
                            {generatingInvoices ? '⏳ Generating...' : '⚡ Generate Invoices'}
                        </button>
                    </div>

                    {error ? null : loading ? <LoadingSkeleton rows={6} columns={6} /> : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Invoice #</th>
                                        <th>Subscriber</th>
                                        <th style={{ textAlign: 'right' }}>Amount</th>
                                        <th style={{ textAlign: 'right' }}>Paid</th>
                                        <th>Due Date</th>
                                        <th>Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.map((inv) => (
                                        <tr key={inv.id}>
                                            <td><code style={{ fontSize: '12px' }}>{inv.invoiceNumber}</code></td>
                                            <td>{inv.subscriberName}</td>
                                            <td style={{ textAlign: 'right' }} className="currency">₱{inv.amount?.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                            <td style={{ textAlign: 'right' }} className="currency">₱{(inv.paid || 0).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</td>
                                            <td>{inv.dueDate}</td>
                                            <td><span className={`badge ${STATUS_COLORS[inv.status] || 'badge-neutral'}`}>{inv.status?.replace('_', ' ')}</span></td>
                                            <td><button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '11px' }}>⋮</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                    <div style={{ padding: '12px 0', fontSize: '13px', color: '#6b7280' }}>
                        Showing 1-{filtered.length} of {invoices.length.toLocaleString()}
                    </div>
                </div>
            </div>
        </>
    );
}
