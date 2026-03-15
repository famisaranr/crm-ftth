'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { apiGet, apiPut } from '@/lib/api';
import { CardSkeleton } from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';
import { useToast } from '@/components/Toast';

interface InstallationDetail {
    id: string;
    subscriberName: string;
    subscriberContact: string;
    installationAddress: string;
    status: string;
    assignedTechName: string | null;
    scheduledDate: string | null;
    notes: string;
}

export default function InstallationDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { toast } = useToast();

    const [job, setJob] = useState<InstallationDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    
    // Mutability states
    const [assigning, setAssigning] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    const loadData = useCallback(async () => {
        setLoading(true); setError(false);
        try {
            const res = await apiGet(`/installations/${id}`);
            if (res && typeof res === 'object' && 'data' in res) {
                setJob((res as Record<string, unknown>).data as InstallationDetail);
                setNewStatus(((res as Record<string, unknown>).data as InstallationDetail).status);
            } else {
                // Fallback for demo
                setJob({
                    id, subscriberName: 'Pedro Calungsod', subscriberContact: '0917-123-4567',
                    installationAddress: '123 Fiber St, Brgy San Isidro', status: 'PENDING_SURVEY',
                    assignedTechName: null, scheduledDate: '2026-03-20', notes: 'Urgent connection needed'
                });
                setNewStatus('PENDING_SURVEY');
            }
        } catch {
            setError(true);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAssignTech = async () => {
        setAssigning(true);
        try {
            await apiPut(`/installations/${id}/assign`, { technicianId: 'tech-1' });
            toast('success', 'Technician assigned successfully.');
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to assign technician');
        } finally {
            setAssigning(false);
        }
    };

    const handleStatusUpdate = async (status: string) => {
        try {
            await apiPut(`/installations/${id}/status`, { status });
            toast('success', `Status updated to ${status}`);
            loadData();
        } catch (e) {
            toast('error', e instanceof Error ? e.message : 'Failed to update status');
        }
    };

    if (error) return <><Header title="Installation Detail" /><div className="page-content"><ErrorState title="Job missing" onRetry={loadData} /></div></>;
    if (loading || !job) return <><Header title="Installation Detail" /><div className="page-content"><CardSkeleton /></div></>;

    return (
        <>
            <Header title={`Job Order: ${job.id}`} />
            <div className="breadcrumb">
                <Link href="/dashboard">Dashboard</Link> <span>›</span> 
                <Link href="/installations">Installations</Link> <span>›</span> 
                {job.id}
            </div>

            <div className="page-content fade-in">
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                    {/* Main Detail Area */}
                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                            <div>
                                <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>{job.subscriberName}</h2>
                                <div style={{ color: '#6b7280', fontSize: '14px' }}>
                                    📱 {job.subscriberContact} <br/>
                                    📍 {job.installationAddress}
                                </div>
                            </div>
                            <span className={`badge ${job.status === 'COMPLETED' ? 'badge-active' : 'badge-pending'}`} style={{ fontSize: '14px', padding: '6px 12px' }}>
                                {job.status.replace('_', ' ')}
                            </span>
                        </div>

                        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
                            <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Workflow Progress</h3>
                            
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <select className="form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ width: '200px' }}>
                                    <option value="PENDING_SURVEY">PENDING_SURVEY</option>
                                    <option value="SCHEDULED">SCHEDULED</option>
                                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                                    <option value="COMPLETED">COMPLETED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                                <button className="btn btn-primary" onClick={() => handleStatusUpdate(newStatus)} disabled={newStatus === job.status}>
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Area */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                        <div className="card">
                            <h3 style={{ fontSize: '16px', marginBottom: '16px', marginTop: 0 }}>Assignment</h3>
                            {job.assignedTechName ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👷</div>
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{job.assignedTechName}</div>
                                        <div style={{ color: '#6b7280', fontSize: '12px' }}>Lead Technician</div>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px' }}>No technician assigned.</p>
                                    <button className="btn btn-secondary w-full" onClick={handleAssignTech} disabled={assigning}>
                                        {assigning ? 'Assigning...' : 'Assign Technician'}
                                    </button>
                                </div>
                            )}

                            <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
                                <div style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Scheduled Date</div>
                                <div style={{ fontWeight: 500 }}>{job.scheduledDate ? new Date(job.scheduledDate).toLocaleDateString() : 'Unscheduled'}</div>
                            </div>
                        </div>

                        <div className="card">
                            <h3 style={{ fontSize: '16px', margin: '0 0 16px 0' }}>Job Notes</h3>
                            <p style={{ color: '#374151', fontSize: '14px', lineHeight: 1.5, margin: 0 }}>
                                {job.notes || 'No specific notes provided.'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
