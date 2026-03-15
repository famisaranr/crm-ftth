'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Barangay {
    id: string;
    code: string;
    name: string;
    city: string;
    province: string;
    isActive: boolean;
    coverageAreaStatus: string;
}

const FALLBACK_BRGYS: Barangay[] = [
    { id: '1', code: 'BRGY-001', name: 'San Isidro', city: 'Makati', province: 'Metro Manila', isActive: true, coverageAreaStatus: 'ACTIVE' },
    { id: '2', code: 'BRGY-002', name: 'Poblacion', city: 'Makati', province: 'Metro Manila', isActive: true, coverageAreaStatus: 'PLANNED' }
];

export default function AdminBarangaysPage() {
    const [brgys, setBrgys] = useState<Barangay[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/admin/barangays?${params}`);
            if (res && (res as Record<string, unknown>).data) setBrgys((res as Record<string, unknown>).data as Barangay[]);
            else throw new Error('No data');
        } catch {
            setBrgys(FALLBACK_BRGYS);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Barangays & Coverage Areas" />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                Admin <span>›</span> Barangays
            </div>

            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search barangays..." 
                            value={search} onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '300px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                        <button className="btn btn-secondary" style={{ marginLeft: 'auto' }}>+ Add Barangay</button>
                    </div>

                    {error ? <ErrorState title="Failed to load barangays" onRetry={loadData} /> : 
                     loading ? <CardSkeleton /> : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Code</th><th>Name</th><th>City/Municipality</th><th>Province</th><th>Coverage Status</th><th>Active</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {brgys.length === 0 ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px' }}>No barangays found.</td></tr> : 
                                        brgys.map(b => (
                                            <tr key={b.id}>
                                                <td className="monospace">{b.code}</td>
                                                <td style={{ fontWeight: 500 }}>{b.name}</td>
                                                <td>{b.city}</td>
                                                <td>{b.province}</td>
                                                <td><span className={`badge ${b.coverageAreaStatus === 'ACTIVE' ? 'badge-active' : 'badge-prospect'}`}>{b.coverageAreaStatus}</span></td>
                                                <td>{b.isActive ? '✅' : '❌'}</td>
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
