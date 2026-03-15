'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function NetworkAssetDetailPage() {
    const params = useParams();
    const id = params.id as string;
    
    return (
        <>
            <Header title={`Network Asset Detail`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/network">Network</Link> <span>›</span> 
                {id}
            </div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Asset Details: {id}</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for Network Asset Detail View. To be fully wired in future iterations.</p>
                </div>
            </div>
        </>
    );
}
