'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface ServicePlan {
    id: string;
    name: string;
    speedMbps: number;
    monthlyPrice: number;
    description: string;
    isActive: boolean;
}

const FALLBACK_PLANS: ServicePlan[] = [
    { id: '1', name: 'Fiber 1500', speedMbps: 50, monthlyPrice: 1500, description: 'Basic household plan', isActive: true },
    { id: '2', name: 'Fiber 2000', speedMbps: 100, monthlyPrice: 2000, description: 'Family streaming plan', isActive: true },
    { id: '3', name: 'Fiber 3000', speedMbps: 200, monthlyPrice: 3000, description: 'Gamer/WFM plan', isActive: true },
    { id: '4', name: 'Legacy DSL', speedMbps: 10, monthlyPrice: 999, description: 'Legacy copper plan', isActive: false }
];

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<ServicePlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/admin/plans?${params}`);
            if (res && (res as Record<string, unknown>).data) setPlans((res as Record<string, unknown>).data as ServicePlan[]);
            else throw new Error('No data');
        } catch {
            setPlans(FALLBACK_PLANS);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Subscription Plans" />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                Admin <span>›</span> Plans
            </div>

            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search plans..." 
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '300px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>+ Add Plan</button>
                    </div>

                    {error ? <ErrorState title="Failed to load plans" onRetry={loadData} /> : 
                     loading ? <CardSkeleton /> : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Plan Name</th><th>Speed</th><th>Monthly Fee</th><th>Description</th><th>Status</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {plans.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No plans found.</td></tr> : 
                                        plans.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 600 }}>{p.name}</td>
                                                <td>{p.speedMbps} Mbps</td>
                                                <td style={{ fontWeight: 500, color: '#10b981' }}>₱{p.monthlyPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                <td style={{ color: '#6b7280' }}>{p.description}</td>
                                                <td><span className={`badge ${p.isActive ? 'badge-active' : 'badge-closed'}`}>{p.isActive ? 'ACTIVE' : 'INACTIVE'}</span></td>
                                                <td><button className="btn btn-sm btn-secondary">Edit</button></td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
