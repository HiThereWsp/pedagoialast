
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Erreur attrapée par ErrorBoundary:', error);
    console.error('Informations sur l\'erreur:', errorInfo);
    
    // Ici vous pourriez envoyer l'erreur à un service de suivi
  }

  handleReload = (): void => {
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Fallback UI personnalisé en cas d'erreur
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="max-w-md w-full p-6">
            <Alert className="bg-red-50 border-red-200 mb-6">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <AlertTitle className="text-red-800 font-bold text-lg">
                Une erreur est survenue
              </AlertTitle>
              <AlertDescription className="text-red-700 mt-2">
                <p>Nous rencontrons un problème technique. Vous pouvez essayer de recharger la page ou revenir à l'accueil.</p>
                
                <details className="mt-4 text-xs">
                  <summary className="cursor-pointer font-medium">Détails techniques</summary>
                  <p className="mt-1 p-2 bg-red-100 rounded overflow-auto max-h-40">
                    {this.state.error?.toString() || 'Erreur inconnue'}
                  </p>
                </details>
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button 
                onClick={this.handleReload}
                variant="default"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Recharger la page
              </Button>
              
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                Retour à l'accueil
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
