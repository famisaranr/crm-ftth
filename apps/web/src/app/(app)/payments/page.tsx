'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Payment {
    id: string;
    paymentNumber: string;
    subscriberName: string;
    amountPaid: number;
    paymentMethod: string;
    referenceNumber: string | null;
    paymentDate: string;
    postedByName: string | null;
}



export default function PaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/billing/payments?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setPayments((res as Record<string, unknown>).data as Payment[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => { loadData(); }, 300);
        return () => clearTimeout(timer);
    }, [search, loadData]);

    return (
        <>
            <Header title="Payments" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Payments</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search by subscriber or receipt..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '400px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                        <Link href="/payments/post" className="btn btn-primary" style={{ marginLeft: 'auto' }}>💳 Post Payment</Link>
                    </div>

                    {error ? (
                        <ErrorState title="Failed to load payments" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Payment ID</th><th>Subscriber</th><th style={{ textAlign: 'right' }}>Amount</th><th>Method</th><th>Receipt #</th><th>Date</th><th>Posted By</th></tr></thead>
                                <tbody>
                                    {payments.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No payments found.</td></tr>
                                    ) : payments.map((p) => (
                                        <tr key={p.id}>
                                            <td className="monospace">{p.paymentNumber}</td>
                                            <td style={{ fontWeight: 500 }}>{p.subscriberName}</td>
                                            <td className="currency text-right" style={{ color: 'var(--success)', fontWeight: 600 }}>
                                                ₱{Number(p.amountPaid).toLocaleString('en-PH', { minimumFractionDigits: 2 })}
                                            </td>
                                            <td><span className="badge badge-prospect">{p.paymentMethod}</span></td>
                                            <td className="monospace text-muted">{p.referenceNumber || '—'}</td>
                                            <td>{p.paymentDate ? new Date(p.paymentDate).toLocaleDateString() : '—'}</td>
                                            <td>{p.postedByName || '—'}</td>
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
