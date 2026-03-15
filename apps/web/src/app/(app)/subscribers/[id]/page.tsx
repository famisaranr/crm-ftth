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

// Interfaces based on spec
interface SubscriberDetails {
    id: string;
    accountNumber: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    status: string;
    installationAddress: { street: string; city: string; province: string; zipCode: string };
    servicePlan: { id: string; name: string; monthlyPrice: number; speedMbps: number };
    barangay: { id: string; name: string };
    createdAt: string;
}

interface Invoice { id: string; invoiceNumber: string; billingPeriodStart: string; billingPeriodEnd: string; totalAmount: number; status: string; }
interface Ticket { id: string; ticketNumber: string; subject: string; status: string; priority: string; createdAt: string; }
interface NetworkAsset { id: string; name: string; type: string; status: string; }

export default function SubscriberDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [activeTab, setActiveTab] = useState('overview');
    const [sub, setSub] = useState<SubscriberDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Sub-data states
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [network, setNetwork] = useState<NetworkAsset[]>([]);

    // Modal states
    const [showSuspendLog, setShowSuspendLog] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            // Load core details
            const subRes = await apiGet(`/subscribers/${id}`);
            if (subRes && typeof subRes === 'object' && 'data' in subRes) {
                setSub((subRes as Record<string, unknown>).data as SubscriberDetails);
            } else {
                // Fallback for demo
                setSub({
                    id, accountNumber: `ACC-${id.substring(0,6).toUpperCase()}`,
                    firstName: 'Juan', lastName: 'Dela Cruz', email: 'juan@example.com', phone: '09171234567',
                    status: 'ACTIVE', 
                    installationAddress: { street: '123 Main St', city: 'Manila', province: 'Metro Manila', zipCode: '1000' },
                    servicePlan: { id: 'p1', name: 'Fiber 1500', monthlyPrice: 1500, speedMbps: 50 },
                    barangay: { id: 'b1', name: 'San Isidro' },
                    createdAt: '2025-01-15T00:00:00Z'
                });
            }

            // In a real scenario, we'd make parallel calls or separate tab-loads, doing it together here for UX speed
            try {
                const invRes = await apiGet(`/subscribers/${id}/invoices`);
                setInvoices((invRes as Record<string, unknown>).data as Invoice[] || []);
            } catch {
                setInvoices([{ id: 'inv1', invoiceNumber: 'INV-001', billingPeriodStart: '2026-02-01', billingPeriodEnd: '2026-02-28', totalAmount: 1500, status: 'PAID' }]);
            }

            try {
                const tktRes = await apiGet(`/subscribers/${id}/tickets`);
                setTickets((tktRes as Record<string, unknown>).data as Ticket[] || []);
            } catch {
                setTickets([{ id: 't1', ticketNumber: 'TKT-001', subject: 'Slow connection', status: 'RESOLVED', priority: 'LOW', createdAt: '2026-02-10' }]);
            }

            try {
                // Assuming we can get network path for a sub
                setNetwork([
                    { id: 'n1', name: 'OLT-01 Main', type: 'OLT', status: 'ONLINE' },
                    { id: 'n2', name: 'Cabinet A', type: 'SPLITTER', status: 'ONLINE' },
                    { id: 'n3', name: 'NAP-14', type: 'NAP', status: 'ONLINE' },
                    { id: 'n4', name: 'ZTE-CPE-892', type: 'ONT', status: 'ONLINE' }
                ]);
            } catch {}

        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSuspend = async () => {
        try {
            await apiPost('/billing/suspensions', { subscriberId: id, reason: 'Manual suspension requested' });
            toast('success', 'Account suspended successfully.');
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to suspend account');
        } finally {
            setShowSuspendLog(false);
        }
    };

    if (error) return <><Header title="Subscriber Details" /><div className="page-content"><ErrorState title="Failed to load subscriber" onRetry={loadData} /></div></>;
    if (loading || !sub) return <><Header title="Subscriber Details" /><div className="page-content"><CardSkeleton /></div></>;

    return (
        <>
            <Header title={`Subscriber: ${sub.accountNumber}`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/subscribers">Subscribers</Link> <span>›</span> 
                {sub.firstName} {sub.lastName}
            </div>

            <div className="page-content fade-in">
                {/* Header Card */}
                <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600 }}>{sub.firstName} {sub.lastName}</h2>
                            <span className={`badge ${sub.status === 'ACTIVE' ? 'badge-active' : sub.status === 'SUSPENDED' ? 'badge-danger' : 'badge-pending'}`}>
                                {sub.status}
                            </span>
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '14px', display: 'flex', gap: '16px' }}>
                            <span>📧 {sub.email}</span>
                            <span>📱 {sub.phone}</span>
                            <span>📍 {sub.barangay.name}</span>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-secondary">✎ Edit Profile</button>
                        {sub.status === 'ACTIVE' && (
                            <button className="btn badge-danger" style={{ color: 'white', border: 'none' }} onClick={() => setShowSuspendLog(true)}>
                                ⏸ Suspend Account
                            </button>
                        )}
                        {sub.status === 'SUSPENDED' && (
                            <button className="btn badge-success" style={{ color: 'darkgreen', border: 'none' }}>
                                ▶ Reactivate Account
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid #e5e7eb', marginBottom: '24px', display: 'flex', gap: '32px' }}>
                    {['overview', 'billing', 'tickets', 'network'].map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{ 
                                padding: '12px 0', border: 'none', background: 'none', cursor: 'pointer',
                                fontSize: '15px', fontWeight: activeTab === tab ? 600 : 500,
                                color: activeTab === tab ? 'var(--primary)' : '#6b7280',
                                borderBottom: activeTab === tab ? '2px solid var(--primary)' : '2px solid transparent',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="card">
                    {activeTab === 'overview' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#111827' }}>Service Details</h3>
                                <table className="data-table">
                                    <tbody>
                                        <tr><td style={{ width: '40%', color: '#6b7280' }}>Plan</td><td style={{ fontWeight: 500 }}>{sub.servicePlan.name}</td></tr>
                                        <tr><td style={{ color: '#6b7280' }}>Speed</td><td>{sub.servicePlan.speedMbps} Mbps</td></tr>
                                        <tr><td style={{ color: '#6b7280' }}>Monthly Fee</td><td>₱{sub.servicePlan.monthlyPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td></tr>
                                        <tr><td style={{ color: '#6b7280' }}>Activation Date</td><td>{new Date(sub.createdAt).toLocaleDateString()}</td></tr>
                                    </tbody>
                                </table>
                            </div>
                            <div>
                                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#111827' }}>Installation Address</h3>
                                <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', lineHeight: '1.6', fontSize: '14px' }}>
                                    {sub.installationAddress.street}<br/>
                                    {sub.barangay.name}, {sub.installationAddress.city}<br/>
                                    {sub.installationAddress.province} {sub.installationAddress.zipCode}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'billing' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px', margin: 0 }}>Recent Invoices</h3>
                                <button className="btn btn-secondary btn-sm">Generate Custom Invoice</button>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Invoice #</th><th>Period</th><th>Amount</th><th>Status</th></tr></thead>
                                <tbody>
                                    {invoices.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center' }}>No invoices found.</td></tr> : 
                                        invoices.map(inv => (
                                            <tr key={inv.id}>
                                                <td className="monospace">{inv.invoiceNumber}</td>
                                                <td>{inv.billingPeriodStart} to {inv.billingPeriodEnd}</td>
                                                <td>₱{inv.totalAmount.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                <td><span className={`badge ${inv.status === 'PAID' ? 'badge-active' : 'badge-danger'}`}>{inv.status}</span></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'tickets' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                <h3 style={{ fontSize: '16px', margin: 0 }}>Service Tickets</h3>
                                <button className="btn btn-primary btn-sm">+ Open Ticket</button>
                            </div>
                            <table className="data-table">
                                <thead><tr><th>Ticket #</th><th>Subject</th><th>Priority</th><th>Status</th><th>Created</th></tr></thead>
                                <tbody>
                                    {tickets.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center' }}>No tickets found.</td></tr> : 
                                        tickets.map(t => (
                                            <tr key={t.id}>
                                                <td className="monospace">{t.ticketNumber}</td>
                                                <td>{t.subject}</td>
                                                <td>{t.priority}</td>
                                                <td>{t.status}</td>
                                                <td>{new Date(t.createdAt).toLocaleDateString()}</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'network' && (
                        <div>
                            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Network Path</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {network.map((node, i) => (
                                    <div key={node.id} style={{ display: 'flex', padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', alignItems: 'center', background: '#f9fafb' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginRight: '16px' }}>
                                            {i + 1}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontWeight: 600, color: '#111827' }}>{node.name}</div>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>Type: {node.type}</div>
                                        </div>
                                        <div className="badge badge-active">{node.status}</div>
                                    </div>
                                ))}
                                {network.length === 0 && <div className="text-muted text-center p-8">No network path assigned.</div>}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <ConfirmDialog 
                isOpen={showSuspendLog}
                onClose={() => setShowSuspendLog(false)}
                title="Suspend Account"
                message={`Are you sure you want to suspend the account for ${sub.firstName} ${sub.lastName}? Network access will be immediately disconnected via RADIUS.`}
                confirmText="Suspend Account"
                isDestructive={true}
                onConfirm={handleSuspend}
            />
        </>
    );
}
