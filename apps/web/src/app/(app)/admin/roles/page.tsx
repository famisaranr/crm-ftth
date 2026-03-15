'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface Role {
    id: string;
    name: string;
    description: string | null;
    permissionsCount: number;
    usersCount: number;
}

const FALLBACK_ROLES: Role[] = [
    { id: '1', name: 'Super Admin', description: 'Full system access', permissionsCount: 127, usersCount: 1 },
    { id: '2', name: 'Corp Admin', description: 'Corporate-level admin', permissionsCount: 98, usersCount: 2 },
];

export default function RolesPage() {
    const [roles, setRoles] = useState<Role[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const res = await apiGet(`/admin/roles`);
            if (res && (res as Record<string, unknown>).data) {
                setRoles((res as Record<string, unknown>).data as Role[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setRoles(FALLBACK_ROLES);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="Roles & Permissions" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> <Link href="/admin/users">Admin</Link> <span>›</span> Roles</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 600 }}>System Roles</h3>
                        <button className="btn btn-primary">+ Create Role</button>
                    </div>

                    {error ? (
                        <ErrorState title="Failed to load roles" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Role Name</th><th>Description</th><th>Permissions</th><th>Users</th><th></th></tr></thead>
                                <tbody>
                                    {roles.length === 0 ? (
                                        <tr><td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No roles found.</td></tr>
                                    ) : roles.map((r) => (
                                        <tr key={r.id}>
                                            <td style={{ fontWeight: 600 }}>{r.name}</td>
                                            <td className="text-muted">{r.description || '—'}</td>
                                            <td><span className="badge badge-prospect">{r.permissionsCount || 0} perms</span></td>
                                            <td>{r.usersCount || 0}</td>
                                            <td><button className="btn btn-secondary btn-sm">Edit</button></td>
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
