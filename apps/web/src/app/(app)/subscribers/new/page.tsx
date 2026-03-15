'use client';
import Header from '@/components/Header';
import SubscriberForm from '@/components/SubscriberForm';

export default function NewSubscriberPage() {
    return (
        <>
            <Header title="New Subscriber" />
            <div className="breadcrumb">
                <a href="/dashboard">Dashboard</a> <span>›</span>
                <a href="/subscribers">Subscribers</a> <span>›</span>
                New
            </div>
            <div className="page-content fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card">
                    <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Create New Subscriber</h2>
                    <SubscriberForm />
                </div>
            </div>
        </>
    );
}
