// Premium User Profile Dropdown — MoneyManager
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';
import { IconUser, IconSettings, IconBell, IconHelpCircle, IconLogOut, IconSun, IconMoon } from './Icons';

interface User {
    id: string;
    name: string;
    email: string;
}

interface UserHeaderProps {
    theme: 'dark' | 'light';
    onToggleTheme: () => void;
}

export const UserHeader = ({ theme, onToggleTheme }: UserHeaderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('lang') || 'en');
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserProfile();

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        const handleLangSync = (e: Event) => {
            const ce = e as CustomEvent<string>;
            if (ce.detail) setCurrentLang(ce.detail);
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('lang-changed', handleLangSync);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('lang-changed', handleLangSync);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const response = await apiClient.get('/auth/profile');
            setUser(response.data.user);
        } catch {
            const role = localStorage.getItem('userRole') || 'user';
            setUser({ id: 'demo', name: role.charAt(0).toUpperCase() + role.slice(1) + ' User', email: '' });
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        setUser(null);
        window.dispatchEvent(new Event('auth-changed'));
        navigate('/login');
    };

    const switchLang = (l: string) => {
        localStorage.setItem('lang', l);
        localStorage.setItem('pfm_language', l);
        setCurrentLang(l);
        window.dispatchEvent(new CustomEvent('lang-changed', { detail: l }));
    };

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const goto = (path: string) => { setShowDropdown(false); navigate(path); };

    if (!user) return null;

    const avatarGradient = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';

    return (
        <div className="user-header" ref={dropdownRef}>
            {/* Trigger */}
            <button
                type="button"
                className="user-profile-button"
                onClick={() => setShowDropdown(v => !v)}
                aria-haspopup="true"
                aria-expanded={showDropdown}
                aria-label="Open user menu"
            >
                <div className="user-avatar" style={{ background: avatarGradient }}>
                    {getInitials(user.name)}
                </div>
                <div className="user-info-compact">
                    <span className="user-name-compact">{user.name.split(' ')[0]}</span>
                    <span className="status-indicator" aria-hidden="true">●</span>
                </div>
                <div className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`} aria-hidden="true">▼</div>
            </button>

            {/* Dropdown */}
            {showDropdown && (
                <div className="user-dropdown-menu" role="menu" aria-label="User menu">
                    {/* Profile header */}
                    <div className="user-dropdown-header">
                        <div className="user-avatar-large" style={{ background: avatarGradient }}>
                            {getInitials(user.name)}
                        </div>
                        <div className="user-details-full">
                            <div className="user-name-full">{user.name}</div>
                            {user.email && <div className="user-email">{user.email}</div>}
                            <div className="user-status">
                                <span aria-hidden="true">●</span> Online
                            </div>
                        </div>
                    </div>

                    <div className="dropdown-divider" />

                    <div className="dropdown-menu-items">
                        {/* Account group */}
                        <div className="menu-section">
                            <div className="menu-section-title">Account</div>

                            <div className="dropdown-item" role="menuitem" onClick={() => goto('/profile')}>
                                <span className="item-icon" aria-hidden="true"><IconUser size={16} /></span>
                                <span className="item-text">Edit Profile</span>
                            </div>

                            <div className="dropdown-item" role="menuitem" onClick={() => goto('/settings')}>
                                <span className="item-icon" aria-hidden="true"><IconSettings size={16} /></span>
                                <span className="item-text">Settings</span>
                            </div>

                            <div className="dropdown-item" role="menuitem" onClick={() => goto('/notifications')}>
                                <span className="item-icon" aria-hidden="true"><IconBell size={16} /></span>
                                <span className="item-text">Notifications</span>
                            </div>

                            {/* Theme toggle */}
                            <div className="dropdown-item" role="menuitem" onClick={onToggleTheme}>
                                <span className="item-icon theme-mode-icon" aria-hidden="true">
                                    {theme === 'dark' ? (
                                        <svg className="theme-mode-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                                            <path d="M15.8 8.2a5.6 5.6 0 1 0 0 7.6 4.2 4.2 0 1 1 0-7.6Z" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    ) : (
                                        <svg className="theme-mode-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                                            <circle cx="12" cy="12" r="2.6" strokeWidth="1.8" />
                                            <path d="M12 6.2v1.8M12 16v1.8M6.2 12H8M16 12h1.8M8 8l1.3 1.3M14.7 14.7L16 16M8 16l1.3-1.3M14.7 9.3L16 8" strokeWidth="1.8" strokeLinecap="round" />
                                        </svg>
                                    )}
                                </span>
                                <span className="item-text">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', background: 'var(--color-surface-3)', padding: '2px 6px', borderRadius: 4, color: 'var(--color-text-muted)' }}>
                                    {theme === 'dark' ? <IconSun size={14} /> : <IconMoon size={14} />}
                                </span>
                            </div>
                        </div>

                        {/* Language (mobile only) */}
                        <div className="menu-section mobile-only-lang">
                            <div className="dropdown-divider" style={{ margin: '4px 0' }} />
                            <div className="menu-section-title">Language</div>
                            <div className="dropdown-lang-toggle">
                                {(['en', 'si', 'ta'] as const).map(l => (
                                    <button
                                        key={l}
                                        className={`lang-btn ${currentLang === l ? 'active' : ''}`}
                                        onClick={() => switchLang(l)}
                                        aria-pressed={currentLang === l}
                                    >
                                        {l.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="dropdown-divider" />

                        {/* Support */}
                        <div className="menu-section">
                            <div className="menu-section-title">Support</div>
                            <div className="dropdown-item" role="menuitem" onClick={() => goto('/help')}>
                                <span className="item-icon" aria-hidden="true"><IconHelpCircle size={16} /></span>
                                <span className="item-text">Help & Support</span>
                            </div>
                        </div>

                        <div className="dropdown-divider" />

                        {/* Sign out */}
                        <div className="menu-section">
                            <div
                                className="dropdown-item logout-item"
                                role="menuitem"
                                onClick={() => { setShowDropdown(false); handleLogout(); }}
                            >
                                <span className="item-icon" aria-hidden="true"><IconLogOut size={16} /></span>
                                <span className="item-text">Sign Out</span>
                                <span className="logout-shortcut">Ctrl+Q</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
