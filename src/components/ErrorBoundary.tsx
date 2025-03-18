
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to the console
    console.error('React ErrorBoundary caught an error:', error, errorInfo);
    
    // You could also log the error to an error reporting service
    // reportError(error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <div className="p-8 flex flex-col items-center justify-center min-h-[300px]">
          <h2 className="text-2xl font-bold mb-4">Une erreur est survenue</h2>
          <p className="mb-4 text-gray-600">Nous sommes désolés, quelque chose s'est mal passé.</p>
          <p className="text-sm text-gray-500 mb-4">{this.state.error?.message}</p>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Rafraîchir la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
