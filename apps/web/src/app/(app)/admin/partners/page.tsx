'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Partner {
    id: string;
    name: string;
    contactPerson: string;
    email: string;
    phone: string;
    status: string;
    revenueSharePercentage: number;
}

const FALLBACK_PARTNERS: Partner[] = [
    { id: '1', name: 'Barangay San Isidro LGU', contactPerson: 'Kapitan Dela Cruz', email: 'sanisidro@example.com', phone: '0917-000-0001', status: 'ACTIVE', revenueSharePercentage: 20 },
    { id: '2', name: 'Poblacion CommTech', contactPerson: 'Maria Santos', email: 'commtech@example.com', phone: '0917-000-0002', status: 'ACTIVE', revenueSharePercentage: 15 }
];

export default function AdminPartnersPage() {
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/admin/partners?${params}`);
            if (res && (res as Record<string, unknown>).data) setPartners((res as Record<string, unknown>).data as Partner[]);
            else throw new Error('No data');
        } catch {
            setPartners(FALLBACK_PARTNERS);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Joint Venture Partners" />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                Admin <span>›</span> Partners
            </div>

            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search partners..." 
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '300px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>+ Add Partner</button>
                    </div>

                    {error ? <ErrorState title="Failed to load partners" onRetry={loadData} /> : 
                     loading ? <CardSkeleton /> : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Partner Name</th><th>Contact Person</th><th>Email</th><th>Phone</th><th>Status</th><th>Rev Share</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {partners.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No partners found.</td></tr> : 
                                        partners.map(p => (
                                            <tr key={p.id}>
                                                <td style={{ fontWeight: 500 }}>{p.name}</td>
                                                <td>{p.contactPerson}</td>
                                                <td>{p.email}</td>
                                                <td className="monospace">{p.phone}</td>
                                                <td><span className={`badge ${p.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`}>{p.status}</span></td>
                                                <td style={{ fontWeight: 600 }}>{p.revenueSharePercentage}%</td>
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
