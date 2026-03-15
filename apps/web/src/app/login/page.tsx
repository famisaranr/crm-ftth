'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth';

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
        } catch (err: unknown) {
            setError((err as Error).message || 'Invalid credentials. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <form className="login-card" onSubmit={handleSubmit}>
                <div className="login-logo">🌐</div>
                <h1 className="login-title">FiberOps PH</h1>
                <p className="login-subtitle">FTTH Barangay Multi-JV CRM Platform</p>

                {error && (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                        id="email"
                        className="form-input"
                        type="email"
                        placeholder="admin@fiberops.ph"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                    />
                </div>
                <div className="form-group">
                    <label className="form-label">Password</label>
                    <input
                        id="password"
                        className="form-input"
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                <button id="login-submit" className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%', marginTop: '8px', opacity: loading ? 0.7 : 1 }}>
                    {loading ? '⏳ Signing in...' : '🔐 Sign In'}
                </button>
                <p style={{ fontSize: '12px', color: '#9ca3af', textAlign: 'center', marginTop: '16px' }}>
                    Forgot password? Contact your system administrator.
                </p>
            </form>
        </div>
    );
}
