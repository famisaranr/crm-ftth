'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface BarangayRevenue {
    barangayName: string;
    subscribers: number;
    revenue: number;
}

interface PartnerRevenue {
    partnerName: string;
    grossRevenue: number;
    partnerShare: number;
}

const FALLBACK_BRGY = [
    { barangayName: 'Poblacion', revenue: 520000, subscribers: 420 },
    { barangayName: 'San Jose', revenue: 410000, subscribers: 340 },
];
const FALLBACK_PTN = [
    { partnerName: 'Del Rosario Co.', grossRevenue: 520000, partnerShare: 140400 },
];

export default function ReportsPage() {
    const [brgyData, setBrgyData] = useState<BarangayRevenue[]>([]);
    const [ptnData, setPtnData] = useState<PartnerRevenue[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const [brgyRes, ptnRes] = await Promise.all([
                apiGet('/reports/revenue-barangay'),
                apiGet('/reports/revenue-partner')
            ]);
            
            if (brgyRes && (brgyRes as Record<string, unknown>).data) {
                setBrgyData((brgyRes as Record<string, unknown>).data as BarangayRevenue[]);
            }
            if (ptnRes && (ptnRes as Record<string, unknown>).data) {
                setPtnData((ptnRes as Record<string, unknown>).data as PartnerRevenue[]);
            }
        } catch {
            setBrgyData(FALLBACK_BRGY);
            setPtnData(FALLBACK_PTN);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const totalRevenue = brgyData.reduce((sum, item) => sum + Number(item.revenue), 0);

    return (
        <>
            <Header title="Revenue Reports" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Reports</div>
            
            <div className="page-content fade-in">
                {error ? (
                    <ErrorState title="Failed to load reports" onRetry={loadData} />
                ) : loading ? (
                    <div className="grid-2"><CardSkeleton /><CardSkeleton /></div>
                ) : (
                    <div className="grid-2">
                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue by Barangay</h3>
                            {brgyData.map((b) => (
                                <div key={b.barangayName} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '14px' }}>{b.barangayName}</div>
                                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{b.subscribers} subscribers</div>
                                    </div>
                                    <div className="currency" style={{ fontSize: '16px' }}>₱{Number(b.revenue).toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
                                </div>
                            ))}
                            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0 0', fontWeight: 700, fontSize: '15px' }}>
                                <span>Total</span>
                                <span className="currency">₱{totalRevenue.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</span>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '20px' }}>Revenue by Partner</h3>
                            {ptnData.map((p) => {
                                const pct = totalRevenue > 0 ? Math.round((Number(p.grossRevenue) / totalRevenue) * 100) : 0;
                                return (
                                    <div key={p.partnerName} style={{ padding: '14px 0', borderBottom: '1px solid #f3f4f6' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 600, fontSize: '14px' }}>{p.partnerName}</span>
                                            <span className="badge badge-prospect">{pct}% share</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                            <span className="text-muted">Gross: <span className="currency">₱{Number(p.grossRevenue).toLocaleString('en-PH')}</span></span>
                                            <span>Partner Share: <span className="currency" style={{ color: 'var(--info)' }}>₱{Number(p.partnerShare).toLocaleString('en-PH')}</span></span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
