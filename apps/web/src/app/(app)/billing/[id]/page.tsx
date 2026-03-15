'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGet, apiPost } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface InvoiceDetail {
    id: string;
    invoiceNumber: string;
    subscriberName: string;
    subscriberId: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
    dueDate: string;
    subtotal: number;
    vat: number;
    totalAmount: number;
    balance: number;
    status: string;
    createdAt: string;
    lineItems: { id: string, description: string, quantity: number, unitPrice: number, amount: number }[];
    payments: { id: string, date: string, amount: number, method: string, reference: string | null }[];
}

export default function InvoiceDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const [showVoid, setShowVoid] = useState(false);
    const [voiding, setVoiding] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const res = await apiGet(`/billing/invoices/${id}`);
            if (res && typeof res === 'object' && 'data' in res) {
                setInvoice((res as Record<string, unknown>).data as InvoiceDetail);
            } else {
                // Fallback for demo
                setInvoice({
                    id, invoiceNumber: `INV-${id.substring(0,6).toUpperCase()}`,
                    subscriberName: 'Maria Clara', subscriberId: 'sub-xyz',
                    billingPeriodStart: '2026-03-01', billingPeriodEnd: '2026-03-31',
                    dueDate: '2026-04-15',
                    subtotal: 1339.29, vat: 160.71, totalAmount: 1500.00, balance: 1500.00,
                    status: 'UNPAID', createdAt: '2026-03-01T08:00:00Z',
                    lineItems: [
                        { id: 'li1', description: 'Fiber 1500 Monthly Subscription', quantity: 1, unitPrice: 1339.29, amount: 1339.29 }
                    ],
                    payments: []
                });
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleVoid = async () => {
        setVoiding(true);
        try {
            // Technically a PUT to update status, but keeping POST for consistency in simulation
            await apiPost(`/billing/invoices/${id}/void`, {});
            toast('success', `Invoice voided successfully.`);
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to void invoice');
        } finally {
            setVoiding(false);
            setShowVoid(false);
        }
    };

    if (error) return <><Header title="Invoice Detail" /><div className="page-content"><ErrorState title="Invoice missing" onRetry={loadData} /></div></>;
    if (loading || !invoice) return <><Header title="Invoice Detail" /><div className="page-content"><CardSkeleton /></div></>;

    return (
        <>
            <Header title={`Invoice: ${invoice.invoiceNumber}`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/billing">Billing</Link> <span>›</span> 
                {invoice.invoiceNumber}
            </div>

            <div className="page-content fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '24px' }}>
                    
                    {/* Invoice Document */}
                    <div className="card" style={{ padding: '40px' }}>
                        
                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e5e7eb', paddingBottom: '24px', marginBottom: '32px' }}>
                            <div>
                                <h1 style={{ fontSize: '28px', color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.02em', fontWeight: 700 }}>FiberOps PH</h1>
                                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                                    123 Fiber St, Brgy San Isidro<br/>
                                    Metro Manila, Philippines<br/>
                                    VAT Reg TIN: 123-456-789-000
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '24px', color: '#374151', margin: '0 0 8px 0', fontWeight: 500 }}>INVOICE</h2>
                                <p style={{ color: '#6b7280', margin: 0, fontSize: '14px', lineHeight: 1.5 }}>
                                    <strong>No:</strong> {invoice.invoiceNumber}<br/>
                                    <strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}<br/>
                                    <strong>Due:</strong> <span style={{ color: '#ef4444', fontWeight: 600 }}>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                                </p>
                            </div>
                        </div>

                        {/* Bill To */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
                            <div>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '8px' }}>Bill To</h3>
                                <p style={{ color: '#111827', margin: 0, fontSize: '16px', fontWeight: 500 }}>{invoice.subscriberName}</p>
                                <p style={{ color: '#6b7280', margin: '4px 0 0 0', fontSize: '14px' }}>
                                    Account: <Link href={`/subscribers/${invoice.subscriberId}`} style={{ color: 'var(--primary)', textDecoration: 'none' }}>{invoice.subscriberId}</Link>
                                </p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h3 style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#9ca3af', marginBottom: '8px' }}>Billing Period</h3>
                                <p style={{ color: '#111827', margin: 0, fontSize: '15px' }}>
                                    {new Date(invoice.billingPeriodStart).toLocaleDateString()} to {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'left', padding: '12px 0', color: '#6b7280', fontSize: '13px', fontWeight: 600 }}>Description</th>
                                    <th style={{ textAlign: 'center', padding: '12px 0', color: '#6b7280', fontSize: '13px', fontWeight: 600, width: '100px' }}>Qty</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', color: '#6b7280', fontSize: '13px', fontWeight: 600, width: '120px' }}>Unit Price</th>
                                    <th style={{ textAlign: 'right', padding: '12px 0', color: '#6b7280', fontSize: '13px', fontWeight: 600, width: '120px' }}>Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {invoice.lineItems.map(item => (
                                    <tr key={item.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '16px 0', color: '#111827', fontSize: '15px' }}>{item.description}</td>
                                        <td style={{ padding: '16px 0', color: '#4b5563', textAlign: 'center', fontSize: '15px' }}>{item.quantity}</td>
                                        <td style={{ padding: '16px 0', color: '#4b5563', textAlign: 'right', fontSize: '15px' }}>₱{item.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                        <td style={{ padding: '16px 0', color: '#111827', textAlign: 'right', fontSize: '15px', fontWeight: 500 }}>₱{item.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Totals */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <div style={{ width: '300px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563', fontSize: '15px' }}>
                                    <span>Subtotal</span>
                                    <span>₱{invoice.subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#4b5563', fontSize: '15px', borderBottom: '1px solid #e5e7eb' }}>
                                    <span>VAT (12%)</span>
                                    <span>₱{invoice.vat.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', color: '#111827', fontSize: '18px', fontWeight: 600 }}>
                                    <span>Total Due</span>
                                    <span>₱{invoice.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                                {invoice.balance < invoice.totalAmount && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', color: '#10b981', fontSize: '15px', fontWeight: 500 }}>
                                        <span>Amount Paid</span>
                                        <span>-₱{(invoice.totalAmount - invoice.balance).toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0 0', color: invoice.balance > 0 ? '#ef4444' : '#10b981', fontSize: '20px', fontWeight: 700, borderTop: '2px solid #e5e7eb', marginTop: '8px' }}>
                                    <span>Balance</span>
                                    <span>₱{invoice.balance.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* Sidebar Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>Invoice Status</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 0', borderBottom: '1px solid #e5e7eb', marginBottom: '16px' }}>
                                <span className={`badge ${invoice.status === 'PAID' ? 'badge-active' : invoice.status === 'VOID' ? 'badge-closed' : 'badge-danger'}`} style={{ fontSize: '16px', padding: '8px 16px' }}>
                                    {invoice.status}
                                </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {invoice.status === 'UNPAID' && (
                                    <>
                                        <button className="btn btn-primary w-full">Apply Payment</button>
                                        <button className="btn badge-danger w-full" style={{ border: 'none', color: 'white' }} onClick={() => setShowVoid(true)} disabled={voiding}>
                                            {voiding ? 'Voiding...' : 'Void Invoice'}
                                        </button>
                                    </>
                                )}
                                <button className="btn btn-secondary w-full">Download PDF</button>
                                <button className="btn btn-secondary w-full">Email to Subscriber</button>
                            </div>
                        </div>

                        {invoice.payments.length > 0 && (
                            <div className="card">
                                <h3 style={{ fontSize: '14px', marginBottom: '12px', marginTop: 0, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment History</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    {invoice.payments.map(p => (
                                        <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: '1px solid #ef4444' }}>
                                            <div>
                                                <div style={{ fontWeight: 500, color: '#111827', fontSize: '14px' }}>{p.method}</div>
                                                <div style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(p.date).toLocaleDateString()}</div>
                                            </div>
                                            <div style={{ fontWeight: 600, color: '#10b981', fontSize: '14px' }}>
                                                ₱{p.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog 
                isOpen={showVoid}
                onClose={() => setShowVoid(false)}
                title="Void Invoice"
                message={`Are you sure you want to completely void invoice ${invoice.invoiceNumber}? This action cannot be undone and will reverse any posted revenue.`}
                confirmText="Void Invoice"
                isDestructive={true}
                onConfirm={handleVoid}
            />
        </>
    );
}
