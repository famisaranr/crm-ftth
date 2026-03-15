import Header from '@/components/Header';
import Link from 'next/link';

const logs = [
    { id: '1', timestamp: '2026-03-14 06:55:01', user: 'admin@fiberops.ph', action: 'LOGIN', resource: 'auth', detail: 'Successful login from 192.168.1.10', ip: '192.168.1.10' },
    { id: '2', timestamp: '2026-03-14 06:52:30', user: 'jose@fiberops.ph', action: 'CREATE', resource: 'subscribers', detail: 'Created subscriber Maria Santos', ip: '192.168.1.15' },
    { id: '3', timestamp: '2026-03-14 06:48:12', user: 'pedro@fiberops.ph', action: 'CREATE', resource: 'payments', detail: 'Payment PMT-001 posted ₱1,500', ip: '192.168.1.22' },
    { id: '4', timestamp: '2026-03-14 06:40:05', user: 'maria@fiberops.ph', action: 'UPDATE', resource: 'subscribers', detail: 'Status changed: ACTIVE → SUSPENDED_SOFT', ip: '192.168.1.18' },
    { id: '5', timestamp: '2026-03-14 06:35:00', user: 'admin@fiberops.ph', action: 'UPDATE', resource: 'settlements', detail: 'Settlement STL-001 approved', ip: '192.168.1.10' },
    { id: '6', timestamp: '2026-03-14 06:20:44', user: 'ana@fiberops.ph', action: 'UPDATE', resource: 'installations', detail: 'Installation INS-0341 marked COMPLETED', ip: '10.0.0.45' },
];

function ActionBadge({ action }: { action: string }) {
    const map: Record<string, string> = { CREATE: 'badge-active', UPDATE: 'badge-pending', DELETE: 'badge-overdue', LOGIN: 'badge-prospect' };
    return <span className={`badge ${map[action] || 'badge-pending'}`}>{action}</span>;
}

export default function AuditPage() {
    return (
        <>
            <Header title="Audit Logs" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> <Link href="/admin/users">Admin</Link> <span>›</span> Audit Logs</div>
            <div className="page-content fade-in">
                <div className="card">
                    <div className="table-toolbar">
                        <input className="search-input" placeholder="Search by user, action, or detail..." />
                        <div className="flex gap-2">
                            <select className="form-input form-select" style={{ width: '130px' }}>
                                <option value="">All Actions</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>LOGIN</option>
                            </select>
                            <button className="btn btn-secondary">📥 Export CSV</button>
                        </div>
                    </div>
                    <table className="data-table">
                        <thead><tr><th>Timestamp</th><th>User</th><th>Action</th><th>Resource</th><th>Detail</th><th>IP Address</th></tr></thead>
                        <tbody>
                            {logs.map((l) => (
                                <tr key={l.id}>
                                    <td className="monospace" style={{ fontSize: '11px' }}>{l.timestamp}</td>
                                    <td>{l.user}</td>
                                    <td><ActionBadge action={l.action} /></td>
                                    <td className="monospace">{l.resource}</td>
                                    <td>{l.detail}</td>
                                    <td className="monospace text-muted">{l.ip}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
