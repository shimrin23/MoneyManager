import React, { useEffect, useState } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Subscriptions } from './components/Subscriptions';
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
import { AIAssistant } from './components/AIAssistant';
import './App.css';
import './styles/UserPages.css';
import './styles/FinancialPages.css';

// FIX: Use React.ReactNode here
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const isAuthenticated = !!localStorage.getItem('token');
  const [showAddTransactionModal, setShowAddTransactionModal] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 768);
  
  console.log('App component rendering, isAuthenticated:', isAuthenticated);

  const handleTransactionAdded = () => {
    setShowAddTransactionModal(false);
    window.location.reload();
  };

  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth <= 768;
      setIsMobile(mobileView);
      setIsSidebarOpen(!mobileView);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleSidebarToggle = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const handleNavLinkClick = () => {
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const AddTransactionModal = () => (
    <div className="modal-overlay" onClick={() => setShowAddTransactionModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add New Transaction</h2>
          <button 
            className="modal-close" 
            onClick={() => setShowAddTransactionModal(false)}
          >
            ×
          </button>
        </div>
        <AddTransactionForm onTransactionAdded={handleTransactionAdded} />
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-container">
          {isAuthenticated && (
            <>
              <nav className={`side-navigation ${isMobile && isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                  <h1 className="sidebar-logo">💰 MoneyManager</h1>
                </div>
                <div className="nav-section">
                  <div className="nav-title">NAVIGATION</div>
                  <NavLink to="/dashboard" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">📊</span>
                    Dashboard
                  </NavLink>
                  <NavLink to="/financial-health" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">🏥</span>
                    Health
                  </NavLink>
                  <NavLink to="/goals" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">🎯</span>
                    Goals
                  </NavLink>
                  <NavLink to="/loans" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">🏦</span>
                    Loans
                  </NavLink>
                  <NavLink to="/credit-cards" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">💳</span>
                    Cards
                  </NavLink>
                  <NavLink to="/subscriptions" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">🔄</span>
                    Subscriptions
                  </NavLink>
                  <NavLink to="/smart-budgets" onClick={handleNavLinkClick} className={({ isActive }) => `nav-item${isActive ? ' dashboard-item' : ''}`}>
                    <span className="nav-icon">🧠</span>
                    Smart Budgets
                  </NavLink>
                </div>
              </nav>
              {isMobile && isSidebarOpen && (
                <button
                  type="button"
                  className="sidebar-overlay"
                  onClick={() => setIsSidebarOpen(false)}
                  aria-label="Close sidebar overlay"
                />
              )}
              {isMobile && (
                <button
                  type="button"
                  className={`sidebar-toggle ${isSidebarOpen ? 'open' : ''}`}
                  onClick={handleSidebarToggle}
                  aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                  {isSidebarOpen ? '<' : '>'}
                </button>
              )}
              <header className="top-header">
                <div className="header-welcome">
                  <span className="welcome-text">Welcome back!</span>
                </div>
                <div className="header-actions">
                  <button 
                    className="header-quick-add"
                    onClick={() => setShowAddTransactionModal(true)}
                  >
                    + New Transaction
                  </button>
                  <button
                    type="button"
                    className="header-ai-icon-button"
                    aria-label="Open AI Assistant"
                    title="AI Assistant"
                    onClick={() => setIsAiAssistantOpen(true)}
                  >
                    <span className="header-ai-icon" aria-hidden="true">🤖</span>
                  </button>
                  <UserHeader />
                </div>
              </header>
            </>
          )}

          {!isAuthenticated && (
            <header>
              <h1>💰 MoneyManager</h1>
            </header>
          )}

          <div className={`main-content ${isAuthenticated ? 'with-sidebar' : ''}`}>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />

              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <Dashboard />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <ProfilePage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/account-settings" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <AccountSettings />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/notifications" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <NotificationsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/help" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <HelpPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <SettingsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/financial-health" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <FinancialHealthPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/goals" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <GoalsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/loans" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <LoansPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/credit-cards" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <CreditCardsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/subscriptions" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <SubscriptionsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/smart-budgets" 
                element={
                  <ProtectedRoute>
                    <main className="page-content">
                      <SmartBudgetsPage />
                    </main>
                  </ProtectedRoute>
                } 
              />

              <Route 
                path="/" 
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
              />
              <Route 
                path="*" 
                element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} 
              />
            </Routes>
          </div>
          {isAuthenticated && (
            <AIAssistant open={isAiAssistantOpen} onOpenChange={setIsAiAssistantOpen} />
          )}
          
          {/* Global Add Transaction Modal */}
          {showAddTransactionModal && <AddTransactionModal />}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
