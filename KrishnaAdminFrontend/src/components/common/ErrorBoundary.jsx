import React, { Component } from 'react';
import { RotateCcw } from 'lucide-react';
import { Toast } from './Toast';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[Admin Error Boundary Caught]:', error, errorInfo);
    // Dynamically import and trigger toast to avoid circular dependency
    import('../../stores/toastStore').then(({ toast }) => {
      toast.error('An unexpected application error occurred.');
    });
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Render Toast here so it survives the unmount, plus a reload button
      return (
        <>
          <Toast />
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
             <button
              onClick={this.handleReload}
              style={{
                padding: '8px 16px',
                backgroundColor: '#1e293b',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              <RotateCcw size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
              Reload Page
            </button>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
