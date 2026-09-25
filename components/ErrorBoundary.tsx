
'use client';

import React, { Component, ReactNode } from 'react';
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--bg-primary, #ffffff)' }}
        >
          <div
            className="rounded-lg shadow-[0_1px_2px_var(--shadow)] max-w-md w-full overflow-hidden"
            style={{ backgroundColor: 'var(--bg-card, #f9fafb)' }}
          >
            <div
              className="px-6 py-4 border-b flex items-center gap-3"
              style={{ borderColor: 'var(--border-color, #e5e7eb)' }}
            >
              <AlertCircle size={24} className="text-red-600 flex-shrink-0" />
              <h2
                className="text-xl font-semibold font-display"
                style={{ color: 'var(--text-primary, #1f2937)' }}
              >
                Something went wrong
              </h2>
            </div>
            <div className="p-6">
              <p
                className="mb-6"
                style={{ color: 'var(--text-secondary, #6b7280)' }}
              >
                An unexpected error occurred. Please try again or refresh the page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre
                  className="mb-6 p-3 rounded text-xs overflow-auto max-h-32"
                  style={{
                    backgroundColor: 'var(--bg-secondary, #f3f4f6)',
                    color: 'var(--text-secondary, #6b7280)',
                  }}
                >
                  {this.state.error.message}
                </pre>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => this.setState({ hasError: false })}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary text-white
                             font-semibold rounded-md transition-colors"
                >
                  <RotateCcw size={16} />
                  Try again
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md font-semibold transition-colors
                             border-[1.5px] border-[var(--border-color)] hover:border-[var(--text-primary)] text-[var(--text-primary)]"
                >
                  <RefreshCw size={16} />
                  Reload page
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
