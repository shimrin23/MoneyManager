// User Header Component with Professional Profile Menu
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../api/client.ts';

interface User {
    id: string;
    name: string;
    email: string;
}

export const UserHeader = () => {
    const [user, setUser] = useState<User | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetchUserProfile();
        
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const response = await apiClient.get('/auth/profile');
                setUser(response.data.user);
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
            handleLogout(); // Auto logout if token is invalid
        }
    };

    const handleLogout = () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        
        // Clear any cached data
        setUser(null);
        
        // Show logout message
        alert('Successfully logged out!');
        
        // Redirect to login page
        navigate('/login');
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .substring(0, 2);
    };

    if (!user) {
        return null;
    }

    return (
        <div className="user-header" ref={dropdownRef}>
            <div className="user-profile-button" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">
                    {getInitials(user.name)}
                </div>
                <div className="user-info-compact">
                    <span className="user-name-compact">{user.name}</span>
                    <span className="status-indicator">●</span>
                </div>
                <div className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`}>
                    ▼
                </div>
            </div>

            {showDropdown && (
                <div className="user-dropdown-menu">
                    <div className="user-dropdown-header">
                        <div className="user-avatar-large">
                            {getInitials(user.name)}
                        </div>
                        <div className="user-details-full">
                            <div className="user-name-full">{user.name}</div>
                            <div className="user-email">{user.email}</div>
                            <div className="user-status">
                                <span className="status-dot">●</span>
                                Online
                            </div>
                        </div>
                    </div>

                    <div className="dropdown-divider"></div>

                    <div className="dropdown-menu-items">
                        {/* Account Management */}
                        <div className="menu-section">
                            <div className="menu-section-title">Account</div>
                            <div 
                                className="dropdown-item" 
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/profile');
                                }}
                            >
                                <span className="item-icon">👤</span>
                                <span className="item-text">Edit Profile</span>
                            </div>

                            <div 
                                className="dropdown-item"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/settings');
                                }}
                            >
                                <span className="item-icon">⚙️</span>
                                <span className="item-text">Account Settings</span>
                            </div>

                            <div 
                                className="dropdown-item"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/notifications');
                                }}
                            >
                                <span className="item-icon">🔔</span>
                                <span className="item-text">Notifications</span>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Settings & Support */}
                        <div className="menu-section">
                            <div className="menu-section-title">Support</div>
                            <div 
                                className="dropdown-item"
                                onClick={() => {
                                    setShowDropdown(false);
                                    navigate('/help');
                                }}
                            >
                                <span className="item-icon">❓</span>
                                <span className="item-text">Help & Support</span>
                            </div>
                        </div>

                        <div className="dropdown-divider"></div>

                        {/* Logout Section */}
                        <div className="menu-section logout-section">
                            <div 
                                className="dropdown-item logout-item" 
                                onClick={() => {
                                    setShowDropdown(false);
                                    handleLogout();
                                }}
                            >
                                <span className="item-icon">🚪</span>
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