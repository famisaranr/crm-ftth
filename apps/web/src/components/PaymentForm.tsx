'use client';
import { useState } from 'react';
import Modal from './Modal';
import { useToast } from './Toast';
import { apiPost } from '@/lib/api';

interface PaymentFormProps {
    isOpen?: boolean;
    onClose?: () => void;
    onSuccess?: () => void;
}

export default function PaymentForm({ isOpen, onClose, onSuccess }: PaymentFormProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        subscriber: '', amount: '', method: 'CASH', reference: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                subscriberId: formData.subscriber, // Assuming the input holds the ID for simplicity now
                amountPaid: Number(formData.amount),
                paymentMethod: formData.method,
                referenceNumber: formData.reference || undefined,
            };
            
            const res = await apiPost('/billing/payments', payload);
            if (res) {
                toast('success', `Payment of ₱${formData.amount} posted successfully.`);
                if (onSuccess) onSuccess();
                if (onClose) onClose();
                setFormData({ subscriber: '', amount: '', method: 'CASH', reference: '' });
            }
        } catch (err) {
            toast('error', err instanceof Error ? err.message : 'Failed to post payment');
        } finally {
            setLoading(false);
        }
    };

    const formContent = (
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                    <label className="form-label">Subscriber ID</label>
                    <input required className="form-input" placeholder="Enter Subscriber ID..." value={formData.subscriber} onChange={(e) => setFormData({...formData, subscriber: e.target.value})} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="form-label">Amount (₱)</label>
                        <input type="number" required min="1" step="0.01" className="form-input" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
                    </div>
                    <div>
                        <label className="form-label">Payment Method</label>
                        <select className="form-select" value={formData.method} onChange={(e) => setFormData({...formData, method: e.target.value})}>
                            <option value="CASH">Cash</option>
                            <option value="GCASH">GCash</option>
                            <option value="BANK_TRANSFER">Bank Transfer</option>
                            <option value="CHEQUE">Cheque</option>
                        </select>
                    </div>
                </div>
                <div style={{ marginBottom: '24px' }}>
                    <label className="form-label">Reference Number <span className="text-muted">(Optional for Cash)</span></label>
                    <input className="form-input" value={formData.reference} onChange={(e) => setFormData({...formData, reference: e.target.value})} />
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                    {onClose && <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>}
                    {!onClose && <a href="/payments" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Cancel</a>}
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Posting...' : 'Post Payment'}
                    </button>
                </div>
            </form>
    );

    if (isOpen !== undefined) {
        return (
            <Modal isOpen={isOpen} onClose={onClose!} title="Post Payment" maxWidth="500px">
                {formContent}
            </Modal>
        );
    }
    return formContent;
}
