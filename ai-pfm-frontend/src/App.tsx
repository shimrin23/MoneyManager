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
import './App.css';
import './styles/UserPages.css';

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
                <UserHeader />
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