import { useState } from 'react';
import { apiClient } from '../api/client';
import '../styles/FinancialPages.css';

const banks = ['Demo Bank', 'Global Trust', 'Sunrise Credit', 'Blue River', 'Metro Capital'];

export const ConnectBankPage = () => {
    const [step, setStep] = useState(1);
    const [selectedBank, setSelectedBank] = useState('Demo Bank');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [connecting, setConnecting] = useState(false);
    const [progress, setProgress] = useState(0);
    const [summary, setSummary] = useState<{ imported: number; zombies: number } | null>(null);

    const next = () => setStep((s) => Math.min(s + 1, 4));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleConnect = async () => {
        setConnecting(true);
        setProgress(10);
        try {
            const accountId = selectedBank.replace(/\s+/g, '-').toUpperCase();
            const resp = await apiClient.post('/transactions/sync', { sourceAccounts: [accountId] });
            setProgress(100);
            const result = resp.data?.result;
            const imported = result?.accounts?.reduce((sum: number, a: any) => sum + (a.inserted ?? 0), 0) ?? 0;
            setSummary({ imported, zombies: 0 });
            setStep(4);
        } catch (err) {
            console.error('Bank connect failed', err);
            setProgress(0);
            alert('Bank connection failed. Please retry.');
        } finally {
            setConnecting(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🔗 Connect Bank Account</h1>
                <p className="page-subtitle">Securely link your bank to sync transactions and detect zombie subscriptions.</p>
            </div>

            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="stepper">
                    {[1, 2, 3, 4].map((s) => (
                        <div key={s} className={`step ${step >= s ? 'active' : ''}`}>
                            <div className="step-number">{s}</div>
                            <div className="step-label">
                                {s === 1 && 'Select bank'}
                                {s === 2 && 'Authenticate'}
                                {s === 3 && 'Confirm & Sync'}
                                {s === 4 && 'Summary'}
                            </div>
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="form-grid">
                        <label className="form-field">
                            <span>Bank</span>
                            <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)}>
                                {banks.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                ))}
                            </select>
                        </label>
                        <div className="actions">
                            <button className="primary" onClick={next}>Continue</button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-grid">
                        <label className="form-field">
                            <span>Username</span>
                            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="demo_user" />
                        </label>
                        <label className="form-field">
                            <span>Password</span>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" />
                        </label>
                        <div className="actions">
                            <button className="secondary" onClick={back}>Back</button>
                            <button className="primary" onClick={next} disabled={!username || !password}>Continue</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-grid">
                        <div>
                            <p><strong>Bank:</strong> {selectedBank}</p>
                            <p><strong>Data synced:</strong> last 90 days of transactions</p>
                            <p><strong>Privacy:</strong> Read-only, securely stored.</p>
                        </div>
                        <div className="actions">
                            <button className="secondary" onClick={back}>Back</button>
                            <button className="primary" onClick={handleConnect} disabled={connecting}>
                                {connecting ? 'Connecting…' : 'Connect & Sync'}
                            </button>
                        </div>
                        {connecting && (
                            <div className="progress" aria-label="Sync progress">
                                <div className="progress-bar" style={{ width: `${progress}%` }} />
                            </div>
                        )}
                    </div>
                )}

                {step === 4 && summary && (
                    <div className="form-grid">
                        <div>
                            <h3>Import Summary</h3>
                            <p>Imported transactions: {summary.imported}</p>
                            <p>Zombie subscriptions flagged: {summary.zombies}</p>
                        </div>
                        <div className="actions">
                            <button className="primary" onClick={() => setStep(1)}>Close</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConnectBankPage;
