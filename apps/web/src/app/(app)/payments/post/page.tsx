'use client';
import Header from '@/components/Header';
import PaymentForm from '@/components/PaymentForm';

export default function NewPaymentPage() {
    return (
        <>
            <Header title="Post Payment" />
            <div className="breadcrumb">
                <a href="/dashboard">Dashboard</a> <span>›</span>
                <a href="/payments">Payments</a> <span>›</span>
                Post
            </div>
            <div className="page-content fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card">
                    <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Post Payment</h2>
                    <PaymentForm />
                </div>
            </div>
        </>
    );
}
