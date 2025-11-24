import { useState } from 'react';
import { apiClient } from '../api/client.ts';
import { useNavigate, Link } from 'react-router-dom';

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await apiClient.post('/auth/signup', { name, email, password });
            alert("Account created! Please log in.");
            navigate('/login');
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || "Signup Failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="card auth-card">
                <h2>Create Account</h2>
                <p className="text-muted">Start your financial journey today</p>

                {error && <div className="alert-error">⚠️ {error}</div>}

                <form onSubmit={handleSignup} className="auth-form">
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input 
                            id="name"
                            type="text" 
                            value={name}
                            onChange={e => setName(e.target.value)} 
                            required 
                            placeholder="John Doe"
                            disabled={loading}
                            autoComplete="name"
                        />
                    </div>

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
                            autoComplete="new-password"
                            minLength={6}
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating Account..." : "Sign Up"}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};