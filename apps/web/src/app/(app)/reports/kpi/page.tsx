'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function KPIExplorerPage() {
    return (
        <>
            <Header title={`KPI Explorer`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Reports <span>›</span> KPI View</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Key Performance Indicators (KPIs)</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for overall health metrics like ARPU, Churn Rate, and MTTR.</p>
                </div>
            </div>
        </>
    );
}
