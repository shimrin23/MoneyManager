import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

try {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
} catch (error) {
  console.error('Failed to render app:', error);
  
  // Fallback rendering
  root.render(
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontFamily: 'system-ui',
      background: '#0f172a',
      color: '#e2e8f0'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem'
      }}>
        <h1>MoneyManager</h1>
        <p>Failed to load the application. Please refresh the page.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '0.25rem',
            cursor: 'pointer'
          }}
        >
          Reload
        </button>
      </div>
    </div>
  );
}
