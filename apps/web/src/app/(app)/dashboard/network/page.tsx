'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function NetworkDashboardPage() {
    return (
        <>
            <Header title={`Network Dashboard`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Network View</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Network Operations Center</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for OLT statuses, outages, and port utilization metrics.</p>
                </div>
            </div>
        </>
    );
}
