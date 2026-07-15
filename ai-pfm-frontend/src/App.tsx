import React, { useEffect, useState } from 'react';
import { 
  IconDashboard, IconLightbulb, IconActivity, IconReceipt, IconRepeat, 
  IconAlertTriangle, IconBrain, IconTarget, IconLandmark, IconBuilding, 
  IconCar, IconDiamond, IconCreditCard, IconRefreshCw, IconLink, 
  IconSettings, IconUsers, IconClipboardList, IconBarChart, IconWallet 
} from './components/Icons';
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate } from 'react-router-dom';

// ── NavGroup — defined OUTSIDE AppShell so it never re-mounts on route changes ─
const NavGroup = ({ title, children }: { title: string; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`nav-group ${isOpen ? 'open' : ''}`}>
      <button type="button" className="nav-group-header" onClick={() => setIsOpen(o => !o)}>
        <span className="nav-group-title">{title}</span>
        <span className="nav-group-chevron">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>
      <div className="nav-group-content">
        {children}
      </div>
    </div>
  );
};

import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { AddTransactionForm } from './components/AddTransactionForm';
import { UserHeader } from './components/UserHeader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ProfilePage } from './pages/ProfilePage';
import { AccountSettings } from './pages/AccountSettings';
import { NotificationsPage } from './pages/NotificationsPage';
import { HelpPage } from './pages/HelpPage';
import { SettingsPage } from './pages/SettingsPage';
import { FinancialHealthPage } from './pages/FinancialHealthPage';
import { GoalsPage } from './pages/GoalsPage';
import LoansPage from './components/LoansPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SmartBudgetsPage } from './pages/SmartBudgetsPage';
import { ConnectBankPage } from './pages/ConnectBankPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminUsersPage } from './pages/AdminUsersPage';
import { AdminConfigPage } from './pages/AdminConfigPage';
import { AdminAuditPage } from './pages/AdminAuditPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { RecurringTransactionsPage } from './pages/RecurringTransactionsPage';
import { FixedDepositsPage } from './pages/FixedDepositsPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { LeasesPage } from './pages/LeasesPage';
import { PawningPage } from './pages/PawningPage';
import { AdminAnalyticsPage } from './pages/AdminAnalyticsPage';
import { VerifyEmail } from './pages/VerifyEmail';
import { ResetPassword } from './pages/ResetPassword';
import { AIAssistant } from './components/AIAssistant';
import './App.css';
import './styles/UserPages.css';
import './styles/FinancialPages.css';

type UserRole = 'customer' | 'admin' | 'ops' | 'manager';
type Language = 'en' | 'si' | 'ta';

const AUTH_PAGES = ['/login', '/signup', '/verify-email', '/reset-password'];

const T: Record<Language, Record<string, string>> = {
  en: {
    dashboard: 'Dashboard', recommendations: 'Recommendations', health: 'Health',
    transactions: 'Transactions', recurring: 'Recurring', anomalies: 'Anomaly Alerts',
    budgets: 'Smart Budgets', goals: 'Goals', fd: 'Fixed Deposits', loans: 'Loans',
    leases: 'Leases', pawning: 'Pawning', cards: 'Cards', subscriptions: 'Subscriptions',
    connectBank: 'Connect Bank', welcomeBack: 'Welcome back!', adminPortal: 'Admin Portal',
    newTx: 'New Transaction',
    adminDash: 'Admin Dashboard', userMgmt: 'User Management',
    config: 'Configuration', audit: 'Audit Logs', reports: 'Reports & Analytics',
    // Nav group titles
    grpOverview: 'Overview', grpMoney: 'Money', grpPlanning: 'Planning',
    grpBanking: 'Banking Products', grpSettings: 'Settings',
    aiCoach: 'AI Coach', cashFlow: 'Cash Flow Forecast',
    profile: 'Profile', security: 'Security',
  },
  si: {
    dashboard: 'උපකරණ පුවරුව', recommendations: 'නිර්දේශ', health: 'සෞඛ්‍යය',
    transactions: 'ගනුදෙනු', recurring: 'පුනරාවර්තන', anomalies: 'අසාමාන්‍ය ඇඟවීම්',
    budgets: 'ස්මාර්ට් අයවැය', goals: 'ඉලක්ක', fd: 'ස්ථාවර තැන්පතු', loans: 'ණය',
    leases: 'බදු', pawning: 'උකස්', cards: 'කාඩ්', subscriptions: 'දායකත්ව',
    connectBank: 'බැංකුව සම්බන්ධ කරන්න', welcomeBack: 'නැවත සාදරයෙන් පිළිගනිමු!', adminPortal: 'පරිපාලන ද්වාරය',
    newTx: 'නව ගනුදෙනු',
    adminDash: 'පරිපාලන උපකරණ පුවරුව', userMgmt: 'පරිශීලක කළමනාකරණය',
    config: 'වින්‍යාසය', audit: 'විගණන ලඝු-සටහන්', reports: 'වාර්තා සහ විශ්ලේෂණ',
    // Nav group titles
    grpOverview: 'දළ විශ්ලේෂණය', grpMoney: 'මුදල්', grpPlanning: 'සැලසුම',
    grpBanking: 'බැංකු නිෂ්පාදන', grpSettings: 'සැකසුම්',
    aiCoach: 'AI උපදේශක', cashFlow: 'මුදල් ප්‍රවාහ පුරෝකථනය',
    profile: 'පැතිකඩ', security: 'ආරක්ෂාව',
  },
  ta: {
    dashboard: 'டாஷ்போர்டு', recommendations: 'பரிந்துரைகள்', health: 'நிதி ஆரோக்கியம்',
    transactions: 'பரிவர்த்தனைகள்', recurring: 'மீண்டும் வருவன', anomalies: 'அசாதாரண எச்சரிக்கை',
    budgets: 'ஸ்மார்ட் பட்ஜெட்', goals: 'இலக்குகள்', fd: 'நிலையான வைப்பு', loans: 'கடன்கள்',
    leases: 'குத்தகை', pawning: 'அடகு', cards: 'அட்டைகள்', subscriptions: 'சந்தாக்கள்',
    connectBank: 'வங்கி இணைக்க', welcomeBack: 'மீண்டும் வரவேற்கிறோம்!', adminPortal: 'நிர்வாக போர்டல்',
    newTx: 'புதிய பரிவர்த்தனை',
    adminDash: 'நிர்வாக டாஷ்போர்டு', userMgmt: 'பயனர் நிர்வாகம்',
    config: 'கட்டமைப்பு', audit: 'தணிக்கை பதிவுகள்', reports: 'அறிக்கைகள் மற்றும் பகுப்பாய்வு',
    // Nav group titles
    grpOverview: 'கண்ணோட்டம்', grpMoney: 'பணம்', grpPlanning: 'திட்டமிடல்',
    grpBanking: 'வங்கி தயாரிப்புகள்', grpSettings: 'அமைப்புகள்',
    aiCoach: 'AI பயிற்சியாளர்', cashFlow: 'பண ஓட்ட முன்கணிப்பு',
    profile: 'சுயவிவரம்', security: 'பாதுகாப்பு',
  },
};

const getRole = (): UserRole =>
  (localStorage.getItem('userRole') as UserRole) || 'customer';

const isAdminRole = (r: UserRole) => r === 'admin' || r === 'ops' || r === 'manager';
const isCustomerRole = (r: UserRole) => r === 'customer';

// ── Route guards ─────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (!isAdminRole(getRole())) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  if (!localStorage.getItem('token')) return <Navigate to="/login" replace />;
  if (!isCustomerRole(getRole())) return <Navigate to="/admin" replace />;
  return <>{children}</>;
};

// ── Inner shell (needs useLocation, so must be inside <BrowserRouter>) ───────
function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();

  // Reactive auth state — updates when 'auth-changed' fires (login / logout)
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState<UserRole>(getRole);
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  );
  const [lang, setLang] = useState<Language>(
    () => (localStorage.getItem('lang') as Language) || 'en'
  );
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const isOnAuthPage = AUTH_PAGES.includes(location.pathname);
  const isAuthenticated = !!token;
  const showLayout = isAuthenticated && !isOnAuthPage;

  const isAdmin = isAdminRole(role);
  const isCustomer = isCustomerRole(role);

  // Sync auth state on login / logout
  useEffect(() => {
    const sync = () => {
      setToken(localStorage.getItem('token'));
      setRole(getRole());
    };
    window.addEventListener('auth-changed', sync);
    return () => window.removeEventListener('auth-changed', sync);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const switchLang = (l: Language) => {
    setLang(l);
    localStorage.setItem('lang', l);
    localStorage.setItem('pfm_language', l);
    window.dispatchEvent(new CustomEvent('lang-changed', { detail: l }));
  };

  const navItem = (to: string, icon: React.ReactNode, label: string) => (
    <NavLink
      to={to}
      onClick={() => setIsMobileSidebarOpen(false)}
      className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}
      data-tooltip={label}
    >
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span className="nav-label">{label}</span>
    </NavLink>
  );

  const navButton = (onClick: () => void, icon: React.ReactNode, label: string) => (
    <button
      onClick={() => {
        setIsMobileSidebarOpen(false);
        onClick();
      }}
      className="nav-item"
      data-tooltip={label}
    >
      <span className="nav-icon" aria-hidden="true">{icon}</span>
      <span className="nav-label">{label}</span>
    </button>
  );

  const AddTransactionModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddTransactionModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Transaction</h2>
          <button className="modal-close" onClick={() => setShowAddTransactionModal(false)}>×</button>
        </div>
        <AddTransactionForm onTransactionAdded={() => { setShowAddTransactionModal(false); window.location.reload(); }} />
      </div>
    </div>
  );

  return (
    <div className="app-container">

      {/* ── Sidebar + header only when logged in AND not on an auth page ── */}
      {showLayout && (
        <>
          {/* Backdrop overlay for mobile drawer */}
          <button 
            type="button" 
            className={`sidebar-overlay ${isMobileSidebarOpen ? 'show' : ''}`}
            onClick={() => setIsMobileSidebarOpen(false)} 
            aria-label="Close sidebar" 
          />

          <nav className={`side-navigation ${isMobileSidebarOpen ? 'open' : ''}`}>
            <div className="sidebar-header">
              <h1 className="sidebar-logo">
                <span className="logo-emoji"><IconWallet size={24} /></span>
                <span className="logo-text">MoneyManager</span>
              </h1>
              {isAdmin && (
                <span className="sidebar-role-badge admin">
                  {role === 'ops' ? 'Operations' : role === 'manager' ? 'Manager' : 'Admin'}
                </span>
              )}
            </div>

            <div className="nav-section">
              {isCustomer && (
                <>
                  <NavGroup title={T[lang].grpOverview}>
                    {navItem('/dashboard', <IconDashboard size={20} />, T[lang].dashboard)}
                    {navItem('/financial-health', <IconActivity size={20} />, T[lang].health)}
                    {navItem('/recommendations', <IconLightbulb size={20} />, T[lang].recommendations)}
                  </NavGroup>

                  <NavGroup title={T[lang].grpMoney}>
                    {navItem('/transactions', <IconReceipt size={20} />, T[lang].transactions)}
                    {navItem('/credit-cards', <IconCreditCard size={20} />, T[lang].cards)}
                    {navItem('/anomalies', <IconAlertTriangle size={20} />, T[lang].anomalies)}
                  </NavGroup>

                  <NavGroup title={T[lang].grpPlanning}>
                    {navItem('/smart-budgets', <IconBrain size={20} />, T[lang].budgets)}
                    {navItem('/goals', <IconTarget size={20} />, T[lang].goals)}
                    {navItem('/recurring', <IconRepeat size={20} />, T[lang].cashFlow)}
                  </NavGroup>

                  <NavGroup title={T[lang].grpBanking}>
                    {navItem('/connect-bank', <IconLink size={20} />, T[lang].connectBank)}
                    {navItem('/fixed-deposits', <IconLandmark size={20} />, T[lang].fd)}
                    {navItem('/loans', <IconBuilding size={20} />, T[lang].loans)}
                    {navItem('/leases', <IconCar size={20} />, T[lang].leases)}
                    {navItem('/pawning', <IconDiamond size={20} />, T[lang].pawning)}
                  </NavGroup>
                </>
              )}

              {isAdmin && (
                <>
                  {/* end prop prevents /admin matching /admin/users etc. */}
                  <NavLink to="/admin" end onClick={() => setIsMobileSidebarOpen(false)}
                    className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}
                    data-tooltip={T[lang].adminDash}>
                    <span className="nav-icon" aria-hidden="true"><IconSettings size={20} /></span>
                    <span className="nav-label">{T[lang].adminDash}</span>
                  </NavLink>
                  {navItem('/admin/users', <IconUsers size={20} />, T[lang].userMgmt)}
                  {navItem('/admin/config', <IconSettings size={20} />, T[lang].config)}
                  {navItem('/admin/audit', <IconClipboardList size={20} />, T[lang].audit)}
                  {navItem('/admin/reports', <IconBarChart size={20} />, T[lang].reports)}
                </>
              )}
            </div>

            <div className="sidebar-footer">
              <UserHeader theme={theme} onToggleTheme={() => setTheme(p => p === 'dark' ? 'light' : 'dark')} />
            </div>
          </nav>

          <header className="top-header">
            <div className="header-left">
              <button
                type="button"
                className="hamburger-toggle"
                onClick={() => setIsMobileSidebarOpen(p => !p)}
                aria-label="Toggle navigation menu"
                aria-expanded={isMobileSidebarOpen}
              >
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
                <span className="hamburger-line"></span>
              </button>
              <div className="header-logo-mobile">
                <span className="header-logo-icon"><IconWallet size={24} /></span>
                <span className="header-logo-text">MoneyManager</span>
              </div>
            </div>

            <div className="header-actions">
              <div className="header-lang-row">
                {([['en','En'], ['si','සිං'], ['ta','த']] as [Language, string][]).map(([l, label]) => (
                  <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`}
                    onClick={() => switchLang(l)}
                    title={l === 'en' ? 'English' : l === 'si' ? 'Sinhala' : 'Tamil'}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {isCustomer && (
                <button
                  className="modal-close"
                  onClick={() => setIsAiAssistantOpen(true)}
                  aria-label="AI Coach"
                  title="AI Coach"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v2a3 3 0 0 1-3 3h-1v1a4 4 0 0 1-8 0v-1H7a3 3 0 0 1-3-3v-2a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/>
                    <line x1="9" y1="10" x2="9" y2="14"/>
                    <line x1="15" y1="10" x2="15" y2="14"/>
                  </svg>
                </button>
              )}
              {isCustomer && (
                <button
                  className="modal-close"
                  onClick={() => setShowAddTransactionModal(true)}
                  aria-label="New Transaction"
                  title="New Transaction"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </button>
              )}
              {isCustomer && (
                <button
                  className="modal-close"
                  onClick={() => setTheme(p => p === 'dark' ? 'light' : 'dark')}
                  aria-label="Toggle Theme"
                  title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {theme === 'dark' ? (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
                    </svg>
                  )}
                </button>
              )}
              {isCustomer && (
                <button
                  className="modal-close"
                  onClick={() => navigate('/notifications')}
                  aria-label="Notifications"
                  title="Notifications"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                  </svg>
                </button>
              )}
            </div>
          </header>
        </>
      )}

      <div className={`main-content ${showLayout ? 'with-sidebar' : ''}`}>
        <Routes>
          {/* Auth pages — redirect away if already logged in */}
          <Route path="/login" element={
            isAuthenticated
              ? <Navigate to={isAdmin ? '/admin' : '/dashboard'} replace />
              : <Login />
          } />
          <Route path="/signup" element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <Signup />
          } />
          <Route path="/verify-email" element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <VerifyEmail />
          } />
          <Route path="/reset-password" element={
            isAuthenticated
              ? <Navigate to="/dashboard" replace />
              : <ResetPassword />
          } />

          {/* ── Customer routes ── */}
          <Route path="/dashboard" element={<CustomerRoute><main className="page-content"><Dashboard /></main></CustomerRoute>} />
          <Route path="/recommendations" element={<CustomerRoute><main className="page-content"><RecommendationsPage /></main></CustomerRoute>} />
          <Route path="/financial-health" element={<CustomerRoute><main className="page-content"><FinancialHealthPage /></main></CustomerRoute>} />
          <Route path="/transactions" element={<CustomerRoute><main className="page-content"><TransactionList /></main></CustomerRoute>} />
          <Route path="/recurring" element={<CustomerRoute><main className="page-content"><RecurringTransactionsPage /></main></CustomerRoute>} />
          <Route path="/anomalies" element={<CustomerRoute><main className="page-content"><AnomalyDetectionPage /></main></CustomerRoute>} />
          <Route path="/smart-budgets" element={<CustomerRoute><main className="page-content"><SmartBudgetsPage /></main></CustomerRoute>} />
          <Route path="/goals" element={<CustomerRoute><main className="page-content"><GoalsPage /></main></CustomerRoute>} />
          <Route path="/fixed-deposits" element={<CustomerRoute><main className="page-content"><FixedDepositsPage /></main></CustomerRoute>} />
          <Route path="/loans" element={<CustomerRoute><main className="page-content"><LoansPage /></main></CustomerRoute>} />
          <Route path="/leases" element={<CustomerRoute><main className="page-content"><LeasesPage /></main></CustomerRoute>} />
          <Route path="/pawning" element={<CustomerRoute><main className="page-content"><PawningPage /></main></CustomerRoute>} />
          <Route path="/credit-cards" element={<CustomerRoute><main className="page-content"><CreditCardsPage /></main></CustomerRoute>} />
          <Route path="/subscriptions" element={<CustomerRoute><main className="page-content"><SubscriptionsPage /></main></CustomerRoute>} />
          <Route path="/connect-bank" element={<CustomerRoute><main className="page-content"><ConnectBankPage /></main></CustomerRoute>} />

          {/* Shared */}
          <Route path="/profile" element={<ProtectedRoute><main className="page-content"><ProfilePage /></main></ProtectedRoute>} />
          <Route path="/account-settings" element={<ProtectedRoute><main className="page-content"><AccountSettings /></main></ProtectedRoute>} />
          <Route path="/notifications" element={<ProtectedRoute><main className="page-content"><NotificationsPage /></main></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><main className="page-content"><SettingsPage /></main></ProtectedRoute>} />
          <Route path="/help" element={<ProtectedRoute><main className="page-content"><HelpPage /></main></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminRoute><main className="page-content"><AdminDashboard /></main></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><main className="page-content"><AdminUsersPage /></main></AdminRoute>} />
          <Route path="/admin/config" element={<AdminRoute><main className="page-content"><AdminConfigPage /></main></AdminRoute>} />
          <Route path="/admin/audit" element={<AdminRoute><main className="page-content"><AdminAuditPage /></main></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><main className="page-content"><AdminAnalyticsPage /></main></AdminRoute>} />

          {/* Catch-all */}
          <Route path="/welcome" element={<Navigate to="/login" replace />} />
          <Route path="/" element={
            !isAuthenticated ? <Navigate to="/login" replace /> :
              isAdmin ? <Navigate to="/admin" replace /> :
                <Navigate to="/dashboard" replace />
          } />
          <Route path="*" element={
            !isAuthenticated ? <Navigate to="/login" replace /> :
              isAdmin ? <Navigate to="/admin" replace /> :
                <Navigate to="/dashboard" replace />
          } />
        </Routes>
      </div>

      {showLayout && isCustomer && (
        <AIAssistant open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen} />
      )}

      {showAddTransactionModal && <AddTransactionModal />}
    </div>
  );
}

// ── Root — BrowserRouter wraps AppShell so useLocation works ─────────────────
function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
