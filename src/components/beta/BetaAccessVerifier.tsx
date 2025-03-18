
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

// The URL for the Stripe checkout for beta access
export const BETA_ACCESS_STRIPE_LINK = 'https://buy.stripe.com/fZe7vKe8G2nP2SA6ou';

interface BetaAccessVerifierProps {
  onSuccess?: () => void;
}

export function BetaAccessVerifier({ onSuccess }: BetaAccessVerifierProps) {
  const [email, setEmail] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Extract session_id from URL if present
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const session_id = urlParams.get('session_id');
    if (session_id) {
      setSessionId(session_id);
    }
  }, []);
  
  const verifyAccess = async () => {
    if (!email || !sessionId) {
      toast.error('Veuillez fournir votre email et l\'ID de votre session Stripe');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('handle-stripe-beta-access', {
        body: { email, session_id: sessionId }
      });
      
      if (error) {
        console.error('Error verifying beta access:', error);
        toast.error('Impossible de vérifier votre accès beta: ' + error.message);
        return;
      }
      
      if (data?.success) {
        toast.success('Votre accès beta a été activé avec succès!');
        
        // Clear URL parameters to avoid resubmission
        if (window.history && window.history.replaceState) {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }
        
        // Get auth session to check if user is logged in
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // User is already logged in, force refresh subscription status
          toast.info('Rafraîchissement de votre statut d\'abonnement...');
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            window.location.href = '/tableaudebord';
          }, 2000);
        } else {
          // User is not logged in, redirect to signup page with email prefilled
          toast.info('Redirection vers la page d\'inscription...');
          setTimeout(() => {
            window.location.href = `/signup?email=${encodeURIComponent(email)}`;
          }, 1000);
        }
        
        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast.error('Impossible de valider votre accès beta. Veuillez contacter le support.');
      }
    } catch (err) {
      console.error('Exception verifying beta access:', err);
      toast.error('Une erreur est survenue lors de la vérification');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold">Vérification de votre accès Beta</h2>
      
      <div className="space-y-2">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Si vous avez acheté un accès Beta via Stripe, veuillez entrer votre email et l'ID de session pour activer votre accès.
        </p>
        
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre email"
          className="w-full"
        />
        
        <Input
          type="text"
          value={sessionId}
          onChange={(e) => setSessionId(e.target.value)}
          placeholder="ID de session Stripe (commence par cs_live_)"
          className="w-full"
        />
        
        <Button
          onClick={verifyAccess}
          disabled={isLoading || !email || !sessionId}
          className="w-full"
        >
          {isLoading ? <LoadingIndicator size="sm" /> : 'Vérifier mon accès Beta'}
        </Button>
      </div>
      
      <div className="text-sm text-center text-gray-500 dark:text-gray-400 pt-2">
        <p>Besoin d'aide? Contactez notre support.</p>
        <p className="mt-2">
          <a
            href={BETA_ACCESS_STRIPE_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Acheter un accès Beta
          </a>
        </p>
      </div>
    </div>
  );
}
