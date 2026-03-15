import Header from '@/components/Header';
import Link from 'next/link';

const settings = [
    { key: 'billing.auto_suspend_days', value: '30', category: 'Billing', description: 'Days overdue before auto soft-suspend' },
    { key: 'billing.hard_suspend_days', value: '60', category: 'Billing', description: 'Days overdue before hard-suspend' },
    { key: 'billing.due_date_offset', value: '15', category: 'Billing', description: 'Due date offset from billing cycle end (days)' },
    { key: 'system.session_timeout', value: '900', category: 'Security', description: 'Session timeout in seconds (15 min)' },
    { key: 'system.max_login_attempts', value: '5', category: 'Security', description: 'Failed login attempts before lockout' },
    { key: 'system.lockout_duration', value: '1800', category: 'Security', description: 'Account lockout duration in seconds (30 min)' },
    { key: 'settlement.default_deduction_pct', value: '0.10', category: 'Settlements', description: 'Default OpEx deduction percentage' },
];

export default function SettingsPage() {
    return (
        <>
            <Header title="System Settings" />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> <Link href="/admin/users">Admin</Link> <span>›</span> Settings</div>
            <div className="page-content fade-in">
                <div className="card">
                    <table className="data-table">
                        <thead><tr><th>Key</th><th>Category</th><th>Value</th><th>Description</th><th></th></tr></thead>
                        <tbody>
                            {settings.map((s) => (
                                <tr key={s.key}>
                                    <td className="monospace">{s.key}</td>
                                    <td><span className="badge badge-prospect">{s.category}</span></td>
                                    <td><input className="form-input" defaultValue={s.value} style={{ width: '100px', padding: '4px 8px' }} /></td>
                                    <td className="text-muted">{s.description}</td>
                                    <td><button className="btn btn-secondary btn-sm">Save</button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
