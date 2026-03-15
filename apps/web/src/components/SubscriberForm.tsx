'use client';
import { useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import { apiPost } from '@/lib/api';

interface SubscriberFormProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function SubscriberForm({ isOpen, onClose, onSuccess }: SubscriberFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', address: '', plan: 'Plan 1500', 
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                addressDetails: formData.address,
                // Assign a default plan ID based on selection, or handle properly in a real setup
                planId: formData.plan === 'Plan 1500' ? 'plan-1' : formData.plan === 'Plan 2500' ? 'plan-2' : 'plan-3',
                // Assuming default location for now as required by schema
                latitude: 14.5995,
                longitude: 120.9842,
            };
            
            const res = await apiPost('/subscribers', payload);
            if (res) {
                toast('success', `Subscriber ${formData.firstName} ${formData.lastName} created!`);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
                setFormData({ firstName: '', lastName: '', email: '', phone: '', address: '', plan: 'Plan 1500' });
            }
        } catch (err) {
            toast('error', err instanceof Error ? err.message : 'Failed to create subscriber');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
            <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">First Name</label>
                        <input required className="form-input" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div>
                        <label className="form-label">Last Name</label>
                        <input required className="form-input" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Email</label>
                        <input type="email" required className="form-input" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div>
                        <label className="form-label">Phone</label>
                        <input required className="form-input" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                </div>
                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Installation Address</label>
                    <textarea required className="form-input" rows={3} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}></textarea>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <label className="form-label">Subscription Plan</label>
                    <select className="form-select" value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})}>
                        <option>Plan 1500</option>
                        <option>Plan 2500</option>
                        <option>Plan 3500</option>
                    </select>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    {onClose && <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>}
                    {!onClose && <a href="/subscribers" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Cancel</a>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Submitting...' : 'Create Application'}
                    </button>
                </div>
            </form>
    );

    if (isOpen !== undefined) {
        return (
            <Modal isOpen={isOpen} onClose={onClose!} title="New Subscriber Application" maxWidth="600px">
                {formContent}
            </Modal>
        );
    }
    return formContent;
}
