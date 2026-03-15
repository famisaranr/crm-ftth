export default function LoadingSkeleton({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) {
    return (
        <div className="card" style={{ overflow: 'hidden' }}>
            <div className="table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {Array.from({ length: columns }).map((_, i) => (
                                <th key={i}><div className="skeleton" style={{ width: `${60 + Math.random() * 40}%`, height: '14px' }} /></th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }).map((_, r) => (
                            <tr key={r}>
                                {Array.from({ length: columns }).map((_, c) => (
                                    <td key={c}><div className="skeleton" style={{ width: `${50 + Math.random() * 50}%`, height: '14px' }} /></td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export function StatCardSkeleton({ count = 4 }: { count?: number }) {
    return (
        <div className="stats-grid">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="stat-card">
                    <div className="skeleton" style={{ width: '60%', height: '12px', marginBottom: '12px' }} />
                    <div className="skeleton" style={{ width: '40%', height: '28px', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ width: '30%', height: '12px' }} />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="card">
            <div className="skeleton" style={{ width: '40%', height: '18px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '12px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '90%', height: '12px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '75%', height: '12px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '85%', height: '12px' }} />
        </div>
    );
}
