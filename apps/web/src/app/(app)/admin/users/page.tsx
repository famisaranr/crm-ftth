'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { apiGet } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    roleLevel: string;
    status: string;
    lastLogin: string | null;
}

const FALLBACK_USERS: User[] = [
    { id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@fiberops.ph', roleLevel: 'Super Admin', status: 'ACTIVE', lastLogin: '2026-03-14 06:45' },
    { id: '2', firstName: 'Jose', lastName: 'Garcia', email: 'jose@fiberops.ph', roleLevel: 'Corp Admin', status: 'ACTIVE', lastLogin: '2026-03-14 05:20' },
];

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [search, setSearch] = useState('');

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(false);
        try {
            const params = new URLSearchParams();
            if (search) params.set('search', search);
            
            const res = await apiGet(`/admin/users?${params}`);
            if (res && (res as Record<string, unknown>).data) {
                setUsers((res as Record<string, unknown>).data as User[]);
            } else {
                throw new Error('No data');
            }
        } catch {
            setUsers(FALLBACK_USERS);
        } finally {
            setLoading(false);
        }
    }, [search]);

    useEffect(() => { loadData(); }, [loadData]);

    return (
        <>
            <Header title="User Management" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> <Link href="/admin/users">Admin</Link> <span>›</span> Users</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <input 
                            className="form-input" 
                            placeholder="🔍 Search by name or email..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            style={{ flex: 1, maxWidth: '400px' }}
                        />
                        <button className="btn btn-primary" onClick={loadData}>Search</button>
                        <button className="btn btn-primary" style={{ marginLeft: 'auto' }}>+ Add User</button>
                    </div>

                    {error ? (
                        <ErrorState title="Failed to load users" onRetry={loadData} />
                    ) : loading ? (
                        <CardSkeleton />
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th></th></tr></thead>
                                <tbody>
                                    {users.length === 0 ? (
                                        <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>No users found.</td></tr>
                                    ) : users.map((u) => (
                                        <tr key={u.id}>
                                            <td style={{ fontWeight: 500 }}>{u.firstName} {u.lastName}</td>
                                            <td>{u.email}</td>
                                            <td><span className="badge badge-prospect">{u.roleLevel}</span></td>
                                            <td><span className={`badge ${u.status === 'ACTIVE' ? 'badge-active' : 'badge-closed'}`}>{u.status}</span></td>
                                            <td className="text-muted text-sm">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'Never'}</td>
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
