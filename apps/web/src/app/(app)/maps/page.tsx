'use client';
import Header from '@/components/Header';

export default function MapsPage() {
    return (
        <>
            <Header title="Network Topology Map" />
            <div className="page-content fade-in">
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Dashboard › Network Map</p>

                <div className="card" style={{ minHeight: '500px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🗺️</div>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>Network Map</h3>
                    <p style={{ fontSize: '14px', color: '#6b7280', maxWidth: '400px', textAlign: 'center', marginBottom: '24px' }}>
                        Interactive map visualization of network infrastructure, subscriber locations, and coverage areas is coming soon.
                    </p>
                    <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' }}>
                        {[
                            { color: '#ef4444', label: 'OLT Sites' },
                            { color: '#f59e0b', label: 'Splitter Points' },
                            { color: '#10b981', label: 'Active Subscribers' },
                            { color: '#3b82f6', label: 'Fiber Routes' },
                            { color: '#6b7280', label: 'NAP Boxes' },
                        ].map(item => (
                            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: item.color }} />
                                {item.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
