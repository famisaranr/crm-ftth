'use client';
import Header from '@/components/Header';
import TicketForm from '@/components/TicketForm';

export default function NewTicketPage() {
    return (
        <>
            <Header title="New Ticket" />
            <div className="breadcrumb">
                <a href="/dashboard">Dashboard</a> <span>›</span>
                <a href="/tickets">Tickets</a> <span>›</span>
                New
            </div>
            <div className="page-content fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="card">
                    <h2 style={{ fontSize: '18px', marginBottom: '24px', fontWeight: 600 }}>Create Support Ticket</h2>
                    <TicketForm />
                </div>
            </div>
        </>
    );
}
