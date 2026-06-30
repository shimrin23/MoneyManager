// Edit Profile Page
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { DatePicker } from '../components/DatePicker';
import { getLocalDateString } from '../utils/date';

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

const getFallbackProfile = (): UserProfile => {
    const role = localStorage.getItem('userRole') || 'customer';
    const name = role.charAt(0).toUpperCase() + role.slice(1) + ' User';

    return {
        id: 'demo',
        name,
        email: role + '@epiclanka.lk',
        phone: '',
        dateOfBirth: '',
        address: '',
        occupation: '',
        monthlyIncome: 0,
    };
};

export const ProfilePage = () => {
    const [profile, setProfile] = useState<UserProfile>(getFallbackProfile);
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
        } catch {
            console.warn('Using fallback profile data');
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

    const role = localStorage.getItem('userRole') || 'customer';

    return (
        <div className="profile-page">
            {/* Header: avatar → name / email / role → title */}
            <div className="profile-header profile-header-flex">
                <h1>Edit Profile</h1>
                <p>Manage your personal information and preferences</p>
                <div className="profile-avatar-stack">
                    <div className="profile-header-avatar">
                        {getInitials(profile.name)}
                    </div>
                    <button type="button" className="profile-avatar-camera-btn" aria-label="Change avatar">
                        📷
                    </button>
                </div>
                {/* User info pulled from profile / registration data */}
                <div className="profile-header-info">
                    <span className="profile-header-name">{profile.name}</span>
                    <span className="profile-header-email">{profile.email}</span>
                    <span className="profile-header-role-badge">
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                    </span>
                </div>
            </div>

            <div className="profile-content">
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
                                    <DatePicker
                                        label="Date of Birth"
                                        value={profile.dateOfBirth || ''}
                                        onChange={(date: string) => setProfile(prev => ({ ...prev, dateOfBirth: date }))}
                                        maxDate={getLocalDateString()}
                                        placeholder="Select your date of birth"
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
