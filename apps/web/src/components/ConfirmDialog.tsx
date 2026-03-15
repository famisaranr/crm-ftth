'use client';
import Modal from './Modal';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    isDestructive?: boolean;
    isLoading?: boolean;
}

export default function ConfirmDialog({
    isOpen, onClose, title, message,
    confirmText = 'Confirm', cancelText = 'Cancel',
    onConfirm, isDestructive = false, isLoading = false
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="400px">
            <div style={{ marginBottom: '24px', color: '#374151', fontSize: '15px', lineHeight: '1.5' }}>
                {message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button 
                    className="btn btn-secondary" 
                    onClick={onClose} 
                    disabled={isLoading}
                >
                    {cancelText}
                </button>
                <button 
                    className={`btn ${isDestructive ? 'btn-danger' : 'btn-primary'}`} 
                    onClick={onConfirm}
                    disabled={isLoading}
                    style={isDestructive ? { backgroundColor: '#ef4444', color: 'white', border: 'none' } : {}}
                >
                    {isLoading ? 'Processing...' : confirmText}
                </button>
            </div>
        </Modal>
    );
}
