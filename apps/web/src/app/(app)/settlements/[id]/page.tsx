'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function SettlementDetailPage() {
    const params = useParams();
    const id = params.id as string;
    
    return (
        <>
            <Header title={`Settlement Detail`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/settlements">Settlements</Link> <span>›</span> 
                {id}
            </div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Settlement Overview: {id}</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for Settlement detailed breakdown. To be fully mapped to API.</p>
                </div>
            </div>
        </>
    );
}
