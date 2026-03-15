'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function TopologyExplorerPage() {
    return (
        <>
            <Header title={`Topology Explorer`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Network <span>›</span> Topology</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Network Topology</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for visual representation of OLTs, NAPs, and node hierarchies.</p>
                </div>
            </div>
        </>
    );
}
