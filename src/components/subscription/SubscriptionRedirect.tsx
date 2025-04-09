import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAnalytics } from '@/hooks';

export const SubscriptionRedirect = () => {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(5);
  const { logEvent } = useAnalytics();

  useEffect(() => {
    if (import.meta.env.PROD) {
      logEvent('subscription_required_redirect');
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate('/pricing');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, logEvent]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center p-8 max-w-md">
        <img
          src="https://pedagoia.s3.eu-west-3.amazonaws.com/logo-pedagoia.png"
          alt="PedagoIA Logo"
          className="w-48 h-48 mx-auto mb-8 animate-bounce"
        />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Accès réservé aux abonnés
        </h2>
        <p className="text-gray-600 mb-6">
          Cette fonctionnalité nécessite un abonnement payant.
          Redirection vers la page des abonnements dans {timeLeft} secondes...
        </p>
        <div className="animate-pulse">
          <div className="h-2 bg-blue-200 rounded"></div>
        </div>
      </div>
    </div>
  );
}; 