// Sidebar User Card — MoneyManager
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
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserProfile();

        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setShowDropdown(false);
        };

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const goto = (path: string) => { setShowDropdown(false); navigate(path); };

    if (!user) return null;

    const avatarGradient = 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)';

    return (
        <div className="sidebar-user-card" ref={dropdownRef}>
            {/* Upward popup menu */}
            {showDropdown && (
                <div className="sidebar-user-menu" role="menu" aria-label="User menu">
                    {/* Profile header */}
                    <div className="sidebar-user-menu-header">
                        <div className="sidebar-user-avatar-lg" style={{ background: avatarGradient }}>
                            {getInitials(user.name)}
                        </div>
                        <div className="sidebar-user-info-full">
                            <div className="sidebar-user-name-full">{user.name}</div>
                            {user.email && <div className="sidebar-user-email">{user.email}</div>}
                            <div className="sidebar-user-status">
                                <span className="sidebar-status-dot" aria-hidden="true"></span>
                                Online
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-user-divider" />

                    <div className="sidebar-user-menu-item" role="menuitem" onClick={() => goto('/profile')}>
                        <span className="sidebar-user-item-icon"><IconUser size={15} /></span>
                        <span>Edit Profile</span>
                    </div>
                    <div className="sidebar-user-menu-item" role="menuitem" onClick={() => goto('/settings')}>
                        <span className="sidebar-user-item-icon"><IconSettings size={15} /></span>
                        <span>Settings</span>
                    </div>



                    <div className="sidebar-user-divider" />

                    <div className="sidebar-user-menu-item" role="menuitem" onClick={() => goto('/help')}>
                        <span className="sidebar-user-item-icon"><IconHelpCircle size={15} /></span>
                        <span>Help & Support</span>
                    </div>

                    <div className="sidebar-user-divider" />

                    <div className="sidebar-user-menu-item logout" role="menuitem" onClick={() => { setShowDropdown(false); handleLogout(); }}>
                        <span className="sidebar-user-item-icon"><IconLogOut size={15} /></span>
                        <span>Sign Out</span>
                    </div>
                </div>
            )}

            {/* Trigger — styled like a nav-item */}
            <button
                type="button"
                className="sidebar-user-trigger"
                onClick={() => setShowDropdown(v => !v)}
                aria-haspopup="true"
                aria-expanded={showDropdown}
                aria-label="Open user menu"
            >
                <div className="sidebar-user-avatar-sm" style={{ background: avatarGradient }}>
                    {getInitials(user.name)}
                </div>
                <div className="sidebar-user-text">
                    <span className="sidebar-user-name">{user.name.split(' ')[0]}</span>
                    <span className="sidebar-user-role">{user.email || localStorage.getItem('userRole') || 'User'}</span>
                </div>
                <svg className="sidebar-user-chevron" width="14" height="14" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="2"
                    style={{ transform: showDropdown ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>
        </div>
    );
};
