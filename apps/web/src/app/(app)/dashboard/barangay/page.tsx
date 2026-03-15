'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function BarangayDashboardPage() {
    return (
        <>
            <Header title={`Barangay Dashboard`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Barangay View</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Barangay Level Analytics</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for filtering metrics by specific Barangay jurisdictions.</p>
                </div>
            </div>
        </>
    );
}
