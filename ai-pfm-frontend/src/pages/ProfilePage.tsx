import { fromLkr, toLkr, currencyCode } from '../utils/appFormat';
// Edit Profile Page
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { DatePicker } from '../components/DatePicker';
import { getLocalDateString } from '../utils/date';
import { useAdminLang } from '../i18n/adminText';
import { USER_T } from '../i18n/userPagesText';
import { notify } from '../utils/systemMessages';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    dateOfBirth?: string;
    address?: string;
    occupation?: string;
    monthlyIncome?: number;
    avatar?: string;
}

// Shrinks the chosen image to a 256px square JPEG so it stays small enough to save with the profile
const resizeImage = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            const size = 256;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                reject(new Error('Canvas not supported'));
                return;
            }
            // Centre-crop to a square, then scale down
            const side = Math.min(img.width, img.height);
            const sx = (img.width - side) / 2;
            const sy = (img.height - side) / 2;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);
            ctx.drawImage(img, sx, sy, side, side, 0, 0, size, size);
            URL.revokeObjectURL(url);
            let quality = 0.85;
            let dataUrl = canvas.toDataURL('image/jpeg', quality);
            while (dataUrl.length > 85_000 && quality > 0.4) {
                quality -= 0.15;
                dataUrl = canvas.toDataURL('image/jpeg', quality);
            }
            resolve(dataUrl);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Could not read the image'));
        };
        img.src = url;
    });

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
    const t = USER_T[useAdminLang()];
    const [profile, setProfile] = useState<UserProfile>(getFallbackProfile);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    // Saves the photo straight away (separately from the Save Changes button)
    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        e.target.value = ''; // allow choosing the same file again
        if (!file) return;
        if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
            notify.error('Please choose a PNG, JPEG or WebP image.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            notify.error('The photo is too large. Please choose an image under 10 MB.');
            return;
        }
        setUploadingAvatar(true);
        try {
            const avatar = await resizeImage(file);
            const response = await apiClient.put('/auth/profile/avatar', { avatar });
            setProfile(prev => ({ ...prev, avatar: response.data?.avatar ?? avatar }));
            notify.success(response.data?.message || 'Profile photo updated');
            window.dispatchEvent(new Event('profile-updated'));
        } catch (err: any) {
            notify.error(err.response?.data?.error || 'Could not upload the photo. Please try again.');
        } finally {
            setUploadingAvatar(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await apiClient.get('/auth/profile');
            // Income is stored in LKR; the form shows it in the chosen currency
            setProfile({ ...response.data.user, monthlyIncome: fromLkr(response.data.user.monthlyIncome ?? 0) });
        } catch {
            console.warn('Using fallback profile data');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        try {
            // The photo is saved on its own endpoint, so it is left out here
            const { avatar: _avatar, ...details } = profile;
            await apiClient.put('/auth/profile', { ...details, monthlyIncome: toLkr(profile.monthlyIncome || 0) });
            notify.success(t.profUpdated);
        } catch (err: any) {
            notify.error(err.response?.data?.error || t.profUpdateFailed);
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
        <div className="profile-page pf-page">
            {/* Header card: avatar on the left, name / email / role beside it */}
            <div className="profile-header pf-head-card">
                <div className="profile-avatar-stack">
                    <div className={`profile-header-avatar ${profile.avatar ? 'pf-has-photo' : ''}`}>
                        {profile.avatar
                            ? <img src={profile.avatar} alt={profile.name} className="pf-avatar-img" />
                            : getInitials(profile.name)}
                    </div>
                    <button
                        type="button"
                        className="profile-avatar-camera-btn pf-camera-btn"
                        aria-label={t.profChangeAvatar}
                        title={t.profChangeAvatar}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                    >
                        {uploadingAvatar ? (
                            <span className="pf-camera-spin" aria-hidden="true" />
                        ) : (
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                <circle cx="12" cy="13" r="4" />
                            </svg>
                        )}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleAvatarChange}
                        hidden
                    />
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
                    <form onSubmit={handleSubmit} className="profile-form pf-form">

                        <div className="form-section">
                            <h3>{t.profPersonal}</h3>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>{t.profFullName}</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={profile.name}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t.profPlaceName}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t.profEmail}</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleInputChange}
                                        required
                                        placeholder={t.profPlaceEmail}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t.profPhone}</label>
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
                                        label={t.profDob}
                                        value={profile.dateOfBirth || ''}
                                        onChange={(date: string) => setProfile(prev => ({ ...prev, dateOfBirth: date }))}
                                        maxDate={getLocalDateString()}
                                        placeholder={t.profPlaceDob}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h3>{t.profAdditional}</h3>
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>{t.profAddress}</label>
                                    <textarea
                                        name="address"
                                        value={profile.address || ''}
                                        onChange={handleInputChange}
                                        rows={3}
                                        placeholder={t.profPlaceAddress}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t.profOccupation}</label>
                                    <input
                                        type="text"
                                        name="occupation"
                                        value={profile.occupation || ''}
                                        onChange={handleInputChange}
                                        placeholder={t.profPlaceOcc}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>{t.profIncome} ({currencyCode()})</label>
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
                                {t.profCancel}
                            </button>
                            <button
                                type="submit"
                                className="btn-primary"
                                disabled={saving}
                            >
                                {saving ? t.profSaving : t.profSave}
                            </button>
                        </div>
                    </form>
            </div>
        </div>
    );
};
