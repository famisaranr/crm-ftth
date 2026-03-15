'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface NetworkAsset {
    id: string;
    assetNumber: string;
    type: string;
    name: string;
    location: string | null;
    capacityPorts: number;
    usedPorts: number;
    status: string;
}

const FALLBACK_ASSETS: NetworkAsset[] = [
    { id: '1', assetNumber: 'OLT-QC-N01', type: 'OLT', name: 'Quezon City OLT #1', location: 'NOC Building', capacityPorts: 16, usedPorts: 12, status: 'ACTIVE' },
    { id: '2', assetNumber: 'SPL-POB-01', type: 'SPLITTER', name: 'Poblacion Splitter 1:8', location: 'Pole #45, Purok 3', capacityPorts: 8, usedPorts: 7, status: 'ACTIVE' },
];

export default function NetworkPage() {
    const [assets, setAssets] = useState<NetworkAsset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Filters
    const [search, setSearch] = useState('');
    const [type, setType] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            if (type) params.set('type', type);
            
            const res = await apiGet(`/network/assets?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setAssets((res as Record<string, unknown>).data as NetworkAsset[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setAssets(FALLBACK_ASSETS);
        } finally {
            setLoading(false);
        }
    }, [search, type]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Network Assets" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Network</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search asset ID or name..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, minWidth: '200px' }}
                        />
                        <div className="flex gap-2">
                            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '130px' }}>
                                <option value="">All Types</option>
                                <option value="OLT">OLT</option>
                                <option value="SPLITTER">SPLITTER</option>
                                <option value="ONT">ONT</option>
                                <option value="NAP_BOX">NAP_BOX</option>
                            </select>
                            <button className="btn btn-primary">+ Add Asset</button>
                        </div>
                    </div>
                    
                    {error ? (
                        <ErrorState title="Failed to load network assets" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Asset ID</th><th>Type</th><th>Name</th><th>Location</th><th>Ports</th><th>Utilization</th><th>Status</th></tr></thead>
                                <tbody>
                                    {assets.length === 0 ? (
                                        <tr><td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No assets found.</td></tr>
                                    ) : assets.map((a) => {
                                        const utilizationPercent = a.capacityPorts ? Math.round((a.usedPorts / a.capacityPorts) * 100) : 0;
                                        return (
                                            <tr key={a.id}>
                                                <td className="monospace">{a.assetNumber}</td>
                                                <td><span className="badge badge-prospect">{a.type}</span></td>
                                                <td style={{ fontWeight: 500 }}>{a.name}</td>
                                                <td className="text-muted">{a.location || '—'}</td>
                                                <td>{a.capacityPorts}</td>
                                                <td>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <div style={{ width: '60px', height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                                                            <div style={{ height: '100%', width: `${utilizationPercent}%`, background: utilizationPercent > 80 ? 'var(--danger)' : utilizationPercent > 60 ? 'var(--warning)' : 'var(--success)', borderRadius: '3px' }} />
                                                        </div>
                                                        <span className="text-sm">{utilizationPercent}%</span>
                                                    </div>
                                                </td>
                                                <td><span className={`badge ${a.status === 'ACTIVE' ? 'badge-active' : 'badge-pending'}`}>{a.status}</span></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
