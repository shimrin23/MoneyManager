import { useState } from 'react';
import { apiClient } from '../api/client.ts';
import { useNavigate, Link } from 'react-router-dom';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    console.log('Login component rendering');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Call Backend API
            const res = await apiClient.post('/auth/login', { email, password });
            
            // Save Token
            localStorage.setItem('token', res.data.token);
            
            // Redirect to Dashboard
            navigate('/dashboard');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Login Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2>Sign In</h2>
                <p className="text-muted">Welcome back to MoneyManager</p>

                {error && <div className="alert-error">⚠️ {error}</div>}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input 
                            id="email"
                            type="email" 
                            value={email}
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            placeholder="user@example.com"
                            disabled={loading}
                            autoComplete="email"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            id="password"
                            type="password" 
                            value={password}
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            placeholder="••••••"
                            disabled={loading}
                            autoComplete="current-password"
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="auth-footer">
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
        </div>
    );
};