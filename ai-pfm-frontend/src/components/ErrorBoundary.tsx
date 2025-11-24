import React from 'react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="card">
            <h2>Something went wrong</h2>
            <p>An error occurred while loading the application.</p>
            {this.state.error && (
              <details style={{ marginTop: '1rem' }}>
                <summary>Error details</summary>
                <pre style={{ 
                  backgroundColor: '#1e293b', 
                  padding: '1rem', 
                  borderRadius: '0.5rem',
                  overflow: 'auto',
                  fontSize: '0.875rem'
                }}>
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
            <button 
              onClick={() => window.location.reload()} 
              style={{
                marginTop: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}