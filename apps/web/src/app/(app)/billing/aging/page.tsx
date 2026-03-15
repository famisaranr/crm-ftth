'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface AgingSummary {
    current: { count: number; total: string };
    days_30: { count: number; total: string };
    days_60: { count: number; total: string };
    days_90: { count: number; total: string };
    days_120_plus: { count: number; total: string };
    grand_total: string;
}

interface AgingInvoice {
    id: string;
    invoice_number: string;
    subscriber: { id: string; account_number: string; full_name: string };
    total_amount: string;
    amount_paid: string;
    outstanding: string;
    due_date: string;
    days_overdue: number;
    status: string;
}

const BUCKET_LABELS: { key: keyof Omit<AgingSummary, 'grand_total'>; label: string; color: string }[] = [
    { key: 'current', label: 'Current', color: '#10b981' },
    { key: 'days_30', label: '1-30 Days', color: '#f59e0b' },
    { key: 'days_60', label: '31-60 Days', color: '#f97316' },
    { key: 'days_90', label: '61-90 Days', color: '#ef4444' },
    { key: 'days_120_plus', label: '120+ Days', color: '#991b1b' },
];

export default function AgingReportPage() {
    const [summary, setSummary] = useState<AgingSummary | null>(null);
    const [invoices, setInvoices] = useState<AgingInvoice[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await apiGet('/billing/aging');
            if (res && typeof res === 'object') {
                const data = res as { summary: AgingSummary; invoices: AgingInvoice[] };
                setSummary(data.summary);
                setInvoices(data.invoices);
            } else {
                throw new Error('No data');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const fmt = (val: string) => `₱${Number(val).toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;

    return (
        <>
            <Header title="Aging Report" />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span>
                <Link href="/billing">Billing</Link> <span>›</span> Aging
            </div>

            <div className="page-content fade-in">
                {error ? (
                    <ErrorState title="Failed to load aging report" onRetry={loadData} />
                ) : loading ? (
                    <CardSkeleton />
                ) : (
                    <>
                        {/* Aging Buckets Summary */}
                        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(5, 1fr)', marginBottom: '24px' }}>
                            {summary && BUCKET_LABELS.map(b => (
                                <div key={b.key} className="stat-card">
                                    <div className="stat-label">{b.label}</div>
                                    <div className="stat-value" style={{ color: b.color, fontSize: '20px' }}>
                                        {fmt(summary[b.key].total)}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                                        {summary[b.key].count} invoice{summary[b.key].count !== 1 ? 's' : ''}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Grand Total */}
                        {summary && (
                            <div className="card" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontSize: '16px', fontWeight: 600 }}>Total Outstanding</span>
                                <span style={{ fontSize: '22px', fontWeight: 700, color: '#ef4444' }}>
                                    {fmt(summary.grand_total)}
                                </span>
                            </div>
                        )}

                        {/* Invoice Table */}
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', marginTop: 0 }}>
                                Outstanding Invoices ({invoices.length})
                            </h3>
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Invoice #</th>
                                            <th>Subscriber</th>
                                            <th style={{ textAlign: 'right' }}>Total</th>
                                            <th style={{ textAlign: 'right' }}>Paid</th>
                                            <th style={{ textAlign: 'right' }}>Outstanding</th>
                                            <th>Due Date</th>
                                            <th style={{ textAlign: 'right' }}>Days Overdue</th>
                                            <th>Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.length === 0 ? (
                                            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No outstanding invoices.</td></tr>
                                        ) : invoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td>
                                                    <Link href={`/billing/${inv.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontFamily: 'monospace', fontSize: '12px' }}>
                                                        {inv.invoice_number}
                                                    </Link>
                                                </td>
                                                <td>
                                                    <Link href={`/subscribers/${inv.subscriber.id}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>
                                                        {inv.subscriber.full_name}
                                                    </Link>
                                                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{inv.subscriber.account_number}</div>
                                                </td>
                                                <td style={{ textAlign: 'right' }}>{fmt(inv.total_amount)}</td>
                                                <td style={{ textAlign: 'right', color: '#10b981' }}>{fmt(inv.amount_paid)}</td>
                                                <td style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>{fmt(inv.outstanding)}</td>
                                                <td>{new Date(inv.due_date).toLocaleDateString()}</td>
                                                <td style={{
                                                    textAlign: 'right',
                                                    fontWeight: 600,
                                                    color: inv.days_overdue > 90 ? '#991b1b' : inv.days_overdue > 60 ? '#ef4444' : inv.days_overdue > 30 ? '#f97316' : inv.days_overdue > 0 ? '#f59e0b' : '#10b981',
                                                }}>
                                                    {inv.days_overdue > 0 ? `${inv.days_overdue}d` : 'Current'}
                                                </td>
                                                <td>
                                                    <span className={`badge ${inv.status === 'OVERDUE' ? 'badge-danger' : inv.status === 'PARTIALLY_PAID' ? 'badge-warning' : 'badge-info'}`}>
                                                        {inv.status.replace('_', ' ')}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
