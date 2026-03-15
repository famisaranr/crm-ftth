'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/Toast';

interface TicketDetail {
    id: string;
    ticketNumber: string;
    subscriberName: string;
    subscriberId: string | null;
    subject: string;
    description: string;
    priority: string;
    status: string;
    assigneeName: string | null;
    createdAt: string;
    comments: { id: string, author: string, text: string, createdAt: string }[];
}

export default function TicketDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [ticket, setTicket] = useState<TicketDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    const [assigning, setAssigning] = useState(false);
    const [resolving, setResolving] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const res = await apiGet(`/tickets/${id}`);
            if (res && typeof res === 'object' && 'data' in res) {
                setTicket((res as Record<string, unknown>).data as TicketDetail);
            } else {
                // Fallback for demo
                setTicket({
                    id, ticketNumber: `TKT-${id.substring(0,4).toUpperCase()}`,
                    subscriberName: 'Maria Clara', subscriberId: 'sub-xyz',
                    subject: 'LOS Red Light on Modem',
                    description: 'Subscriber reported that the modem has a blinking red light on the LOS indicator since yesterday night. No internet connection.',
                    priority: 'P1_CRITICAL', status: 'OPEN',
                    assigneeName: null, createdAt: new Date().toISOString(),
                    comments: [
                        { id: 'c1', author: 'System', text: 'Ticket auto-created from SMS report.', createdAt: new Date(Date.now() - 86400000).toISOString() }
                    ]
                });
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAssign = async () => {
        setAssigning(true);
        try {
            await apiPut(`/tickets/${id}/assign`, { assigneeId: 'tech-1' });
            toast('success', 'Ticket assigned to you.');
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to assign ticket');
        } finally {
            setAssigning(false);
        }
    };

    const handleResolve = async () => {
        setResolving(true);
        try {
            await apiPut(`/tickets/${id}/status`, { status: 'RESOLVED' });
            toast('success', `Ticket resolved successfully.`);
            setShowResolveConfirm(false);
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to resolve ticket');
        } finally {
            setResolving(false);
        }
    };

    if (error) return <><Header title="Ticket Detail" /><div className="page-content"><ErrorState title="Ticket missing" onRetry={loadData} /></div></>;
    if (loading || !ticket) return <><Header title="Ticket Detail" /><div className="page-content"><CardSkeleton /></div></>;

    return (
        <>
            <Header title={`Ticket: ${ticket.ticketNumber}`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/tickets">Tickets</Link> <span>›</span> 
                {ticket.ticketNumber}
            </div>

            <div className="page-content fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Main Detail Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                <div>
                                    <h2 style={{ fontSize: '20px', margin: '0 0 8px 0', color: '#111827' }}>{ticket.subject}</h2>
                                    <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                        Reported by: {ticket.subscriberId ? <Link href={`/subscribers/${ticket.subscriberId}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>{ticket.subscriberName}</Link> : ticket.subscriberName} <br/>
                                        Opened: {new Date(ticket.createdAt).toLocaleString()}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <span className={`badge ${ticket.priority.includes('CRITICAL') ? 'badge-danger' : 'badge-warning'}`}>{ticket.priority}</span>
                                    <span className={`badge ${ticket.status === 'RESOLVED' || ticket.status === 'CLOSED' ? 'badge-resolved' : 'badge-open'}`}>{ticket.status}</span>
                                </div>
                            </div>
                            
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                                <h3 style={{ fontSize: '16px', marginBottom: '16px', color: '#374151' }}>Description</h3>
                                <p style={{ color: '#4b5563', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                                    {ticket.description}
                                </p>
                            </div>
                        </div>

                        {/* Thread/Comments */}
                        <div className="card">
                            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Activity Thread</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {ticket.comments.map(c => (
                                    <div key={c.id} style={{ display: 'flex', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 }}>
                                            {c.author.charAt(0)}
                                        </div>
                                        <div style={{ background: '#f9fafb', padding: '12px 16px', borderRadius: '0 8px 8px 8px', flex: 1, border: '1px solid #e5e7eb' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px' }}>
                                                <span style={{ fontWeight: 600, color: '#374151' }}>{c.author}</span>
                                                <span style={{ color: '#9ca3af' }}>{new Date(c.createdAt).toLocaleString()}</span>
                                            </div>
                                            <div style={{ color: '#4b5563', fontSize: '14px', lineHeight: 1.5 }}>
                                                {c.text}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {ticket.status !== 'CLOSED' && ticket.status !== 'RESOLVED' && (
                                <div style={{ marginTop: '24px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                                    <textarea className="form-input" rows={3} placeholder="Type a reply or internal note..." style={{ marginBottom: '12px' }}></textarea>
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                                        <button className="btn btn-primary btn-sm">Post Reply</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>Ticket Actions</h3>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {ticket.assigneeName ? (
                                    <div style={{ padding: '12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '14px', color: '#374151' }}>
                                        Assigned to: <strong>{ticket.assigneeName}</strong>
                                    </div>
                                ) : (
                                    <button className="btn btn-secondary w-full" onClick={handleAssign} disabled={assigning || ticket.status === 'CLOSED'}>
                                        {assigning ? 'Assigning...' : 'Take Assignment'}
                                    </button>
                                )}
                                
                                {ticket.status !== 'RESOLVED' && ticket.status !== 'CLOSED' && (
                                    <button className="btn btn-primary w-full" onClick={() => setShowResolveConfirm(true)} disabled={resolving || !ticket.assigneeName}>
                                        {resolving ? 'Resolving...' : 'Resolve Ticket'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {ticket.subscriberId && (
                            <div className="card">
                                <h3 style={{ fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>Subscriber Info</h3>
                                <div style={{ fontSize: '14px', color: '#4b5563', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <div><strong>Name:</strong> {ticket.subscriberName}</div>
                                    <div><strong>Status:</strong> <span className="text-success">Active</span></div>
                                    <Link href={`/subscribers/${ticket.subscriberId}`} style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500, marginTop: '8px', display: 'inline-block' }}>
                                        View Full Profile →
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ConfirmDialog 
                isOpen={showResolveConfirm}
                onClose={() => setShowResolveConfirm(false)}
                title="Resolve Ticket"
                message={`Are you sure you want to resolve ticket ${ticket.ticketNumber}? This will mark the issue as completed.`}
                confirmText="Resolve Issue"
                onConfirm={handleResolve}
            />
        </>
    );
}
