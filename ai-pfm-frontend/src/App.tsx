import React from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Dashboard } from './components/Dashboard';
import { TransactionList } from './components/TransactionList';
import { Subscriptions } from './components/Subscriptions';
import { ErrorBoundary } from './components/ErrorBoundary';
import './App.css';

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
          <header>
            <h1>💰 MoneyManager</h1>
          </header>

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