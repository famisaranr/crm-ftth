'use client';
import { useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import { apiPost } from '@/lib/api';

interface TicketFormProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function TicketForm({ isOpen, onClose, onSuccess }: TicketFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        subject: '', description: '', priority: 'LOW', category: 'TECHNICAL', subscriberId: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                title: formData.subject,
                description: formData.description,
                priority: formData.priority,
                issueCategory: formData.category,
                subscriberId: formData.subscriberId ? formData.subscriberId : undefined
            };
            
            const res = await apiPost('/tickets', payload);
            if (res) {
                toast('success', `Ticket created successfully.`);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
                setFormData({ subject: '', description: '', priority: 'LOW', category: 'TECHNICAL', subscriberId: '' });
            }
        } catch (err) {
            toast('error', err instanceof Error ? err.message : 'Failed to create ticket');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Subject</label>
                    <input required className="form-input" value={formData.subject} onChange={(e) => setFormData({...formData, subject: e.target.value})} />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Category</label>
                        <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                            <option value="TECHNICAL">Technical Issue</option>
                            <option value="BILLING">Billing Inquiry</option>
                            <option value="UPGRADE">Plan Upgrade</option>
                            <option value="RELOCATION">Relocation</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label">Priority</label>
                        <select className="form-select" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})}>
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                            <option value="CRITICAL">Critical</option>
                        </select>
                    </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Subscriber ID <span className="text-muted">(Optional)</span></label>
                    <input className="form-input" placeholder="e.g. sub-1234" value={formData.subscriberId} onChange={(e) => setFormData({...formData, subscriberId: e.target.value})} />
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label className="form-label">Description</label>
                    <textarea required className="form-input" rows={4} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    {onClose && <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>}
                    {!onClose && <a href="/tickets" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Cancel</a>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Saving...' : 'Create Ticket'}
                    </button>
                </div>
            </form>
    );

    if (isOpen !== undefined) {
        return (
            <Modal isOpen={isOpen} onClose={onClose!} title="Create Support Ticket" maxWidth="550px">
                {formContent}
            </Modal>
        );
    }
    return formContent;
}
