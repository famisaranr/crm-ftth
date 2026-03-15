'use client';
import { useParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function EditRolePage() {
    const params = useParams();
    const id = params.id as string;
    
    return (
        <>
            <Header title={`Edit Role`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/admin/roles">Roles</Link> <span>›</span> 
                {id}
            </div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Role Configuration: {id}</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for Role detailed edit view. Configure permissions here.</p>
                </div>
            </div>
        </>
    );
}
