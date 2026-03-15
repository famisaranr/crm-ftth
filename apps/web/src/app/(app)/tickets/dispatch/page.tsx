'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function DispatchBoardPage() {
    return (
        <>
            <Header title={`Dispatch Board`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Tickets <span>›</span> Dispatch</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Tech Dispatch Board</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for viewing technician locations, schedules, and active truck rolls.</p>
                </div>
            </div>
        </>
    );
}
