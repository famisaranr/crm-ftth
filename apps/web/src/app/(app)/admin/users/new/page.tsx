'use client';
import Header from '@/components/Header';
import Link from 'next/link';

export default function NewUserPage() {
    return (
        <>
            <Header title={`Create New User`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/admin/users">Users</Link> <span>›</span> 
                New
            </div>
            <div className="page-content fade-in">
                <div className="card">
                    <h2>Admin User Form</h2>
                    <p className="text-muted text-sm mt-2">Placeholder for creating or inviting an admin user onto the platform.</p>
                </div>
            </div>
        </>
    );
}
