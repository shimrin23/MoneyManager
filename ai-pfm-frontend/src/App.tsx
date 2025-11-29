import React, { useState } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import { LoansPage } from './pages/LoansPage';
import { CreditCardsPage } from './pages/CreditCardsPage';
import { SubscriptionsPage } from './pages/SubscriptionsPage';
import { SmartBudgetsPage } from './pages/SmartBudgetsPage';
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
  
  console.log('App component rendering, isAuthenticated:', isAuthenticated);

  const handleTransactionAdded = () => {
    setShowAddTransactionModal(false);
    window.location.reload();
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
              <nav className="side-navigation">
                <div className="sidebar-header">
                  <h1 className="sidebar-logo">💰 MoneyManager</h1>
                </div>
                <div className="nav-section">
                  <div className="nav-title">NAVIGATION</div>
                  <a href="/dashboard" className="nav-item dashboard-item">
                    <span className="nav-icon">📊</span>
                    Dashboard
                  </a>
                  <a href="/financial-health" className="nav-item">
                    <span className="nav-icon">🏥</span>
                    Health
                  </a>
                  <a href="/goals" className="nav-item">
                    <span className="nav-icon">🎯</span>
                    Goals
                  </a>
                  <a href="/loans" className="nav-item">
                    <span className="nav-icon">🏦</span>
                    Loans
                  </a>
                  <a href="/credit-cards" className="nav-item">
                    <span className="nav-icon">💳</span>
                    Cards
                  </a>
                  <a href="/subscriptions" className="nav-item">
                    <span className="nav-icon">🔄</span>
                    Subscriptions
                  </a>
                  <a href="/smart-budgets" className="nav-item">
                    <span className="nav-icon">🧠</span>
                    Smart Budgets
                  </a>
                </div>
              </nav>
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
                    <>
                      <main className="page-content">
                        <Dashboard />
                        
                        {/* Transaction and Subscription sections */}
                        <div className="content-grid">
                          <div className="card full-width">
                            <TransactionList />
                          </div>
                          <div className="card">
                            <Subscriptions />
                          </div>
                        </div>
                      </main>
                    </>
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
          
          {/* Global Add Transaction Modal */}
          {showAddTransactionModal && <AddTransactionModal />}
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;