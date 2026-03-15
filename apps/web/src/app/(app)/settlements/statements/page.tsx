'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function PartnerStatementsPage() {
    return (
        <>
            <Header title={`Partner Statements`} />
            <div className="breadcrumb"><Link href="/dashboard">Dashboard</Link> <span>›</span> Settlements <span>›</span> Statements</div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Partner Sub-Statements</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for generating specific statements per Revenue Share partner.</p>
                </div>
            </div>
        </>
    );
}
