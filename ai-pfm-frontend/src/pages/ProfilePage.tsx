// Edit Profile Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
}

export const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile>({
        id: '',
        name: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        address: '',
        occupation: '',
        monthlyIncome: 0
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            setProfile(response.data.user);
        } catch (err) {
            setError('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setMessage('');

        try {
            await apiClient.put('/auth/profile', profile);
            setMessage('Profile updated successfully!');
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({
            ...prev,
            [name]: name === 'monthlyIncome' ? parseFloat(value) || 0 : value
        }));
    };

    const getInitials = (name: string) => {
        return name.split(' ').map(word => word.charAt(0)).join('').toUpperCase().substring(0, 2);
    };

    if (loading) {
        return <div className="page-loading">Loading profile...</div>;
    }

    return (
        <div className="profile-page">
            <div className="profile-header">
                <button className="back-button" onClick={() => navigate('/dashboard')}>
                    ← Back to Dashboard
                </button>
                <h1>Edit Profile</h1>
                <p>Manage your personal information and preferences</p>
            </div>

            <div className="profile-content">
                <div className="profile-avatar-section">
                    <div className="current-avatar">
                        <div className="avatar-large">
                            {getInitials(profile.name)}
                        </div>
                        <div className="avatar-info">
                            <h3>{profile.name}</h3>
                            <p>{profile.email}</p>
                        </div>
                    </div>
                    <button className="change-avatar-btn">
                        📷 Change Avatar
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="profile-form">
                    {message && <div className="alert-success">{message}</div>}
                    {error && <div className="alert-error">{error}</div>}

                    <div className="form-section">
                        <h3>Personal Information</h3>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={profile.name}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Email Address *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={profile.email}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="Enter your email"
                                />
                            </div>

                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={profile.phone || ''}
                                    onChange={handleInputChange}
                                    placeholder="+94 77 123 4567"
                                />
                            </div>

                            <div className="form-group">
                                <label>Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    value={profile.dateOfBirth || ''}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Additional Details</h3>
                        <div className="form-grid">
                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea
                                    name="address"
                                    value={profile.address || ''}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Enter your address"
                                />
                            </div>

                            <div className="form-group">
                                <label>Occupation</label>
                                <input
                                    type="text"
                                    name="occupation"
                                    value={profile.occupation || ''}
                                    onChange={handleInputChange}
                                    placeholder="Your job title"
                                />
                            </div>

                            <div className="form-group">
                                <label>Monthly Income (LKR)</label>
                                <input
                                    type="number"
                                    name="monthlyIncome"
                                    value={profile.monthlyIncome || ''}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    step="1000"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={() => navigate('/dashboard')}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={saving}
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};