'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function FinanceDashboardPage() {
    return (
        <>
            <Header title={`Finance Dashboard`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Financial View</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Financial Performance</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for high-level revenue, collections, and AR metrics.</p>
                </div>
            </div>
        </>
    );
}
