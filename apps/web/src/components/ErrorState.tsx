'use client';

export default function ErrorState({ 
    title = 'Something went wrong', 
    message = 'We couldn\'t load this data. Please try again.',
    onRetry 
}: { 
    title?: string; 
    message?: string; 
    onRetry?: () => void;
}) {
    return (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>{message}</p>
            {onRetry && (
                <button className="btn btn-primary" onClick={onRetry} style={{ margin: '0 auto' }}>
                    🔄 Try Again
                </button>
            )}
        </div>
    );
}

export function EmptyState({ 
    icon = '📭', 
    title = 'No data found', 
    message = 'There are no items to display.',
    actionLabel,
    onAction
}: { 
    icon?: string;
    title?: string; 
    message?: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>{title}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{message}</p>
            {actionLabel && onAction && (
                <button className="btn btn-primary" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
