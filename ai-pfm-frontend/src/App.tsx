import React from 'react'; 
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
  
  console.log('App component rendering, isAuthenticated:', isAuthenticated);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app-container">
          {isAuthenticated && (
            <header>
              <div className="header-content">
                <h1>💰 MoneyManager</h1>
                <div className="header-actions">
                  <UserHeader />
                  <button 
                    className="btn-logout"
                    onClick={() => {
                      localStorage.removeItem('token');
                      window.location.href = '/login';
                    }}
                    title="Sign Out"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </header>
          )}

          {!isAuthenticated && (
            <header>
              <h1>💰 MoneyManager</h1>
            </header>
          )}

          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <main>
                    <Dashboard />
                    <div className="content-grid">
                      <AddTransactionForm onTransactionAdded={() => window.location.reload()} />
                      <TransactionList />
                      <Subscriptions />
                    </div>
                  </main>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/account-settings" 
              element={
                <ProtectedRoute>
                  <AccountSettings />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/notifications" 
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/help" 
              element={
                <ProtectedRoute>
                  <HelpPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/settings" 
              element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/financial-health" 
              element={
                <ProtectedRoute>
                  <FinancialHealthPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <GoalsPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/loans" 
              element={
                <ProtectedRoute>
                  <LoansPage />
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/credit-cards" 
              element={
                <ProtectedRoute>
                  <CreditCardsPage />
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
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;