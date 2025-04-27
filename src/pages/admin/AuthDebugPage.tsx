import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { 
  syncAuthStateCrossDomain, 
  syncSubscriptionStateCrossDomain, 
  checkCrossDomainAuth,
  clearCrossDomainAuth,
  getSubscriptionStatusFromCookie 
} from '@/utils/cross-domain-auth';

export default function AuthDebugPage() {
  const { user, loading, authReady } = useAuth();
  const { isSubscribed, subscriptionType } = useSubscription();
  const [cookies, setCookies] = useState<string[]>([]);
  const [localStorageData, setLocalStorageData] = useState<Record<string, string>>({});
  const isDev = import.meta.env.DEV;
  
  // Fonction pour rafraîchir les données
  const refreshData = () => {
    // Lire tous les cookies
    const allCookies = document.cookie.split(';').map(c => c.trim());
    setCookies(allCookies);
    
    // Lire les données localStorage pertinentes
    const data: Record<string, string> = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          // Filtrer seulement les clés liées à l'authentification
          if (key.includes('supabase') || key.includes('subscription') || key.includes('auth')) {
            data[key] = localStorage.getItem(key) || '';
          }
        }
      }
    } catch (err) {
      console.error('Erreur lecture localStorage:', err);
    }
    
    setLocalStorageData(data);
  };
  
  // Charger les données initiales
  useEffect(() => {
    refreshData();
    
    // Rafraîchir toutes les 3 secondes
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, []);
  
  // Fonctions pour tester les fonctionnalités
  const forceWriteCookies = async () => {
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      syncAuthStateCrossDomain(data.session);
      syncSubscriptionStateCrossDomain();
      refreshData();
    } else {
      alert('Pas de session active à synchroniser');
    }
  };
  
  const clearAllCookies = () => {
    clearCrossDomainAuth();
    refreshData();
  };
  
  const testCookieDetection = () => {
    const result = checkCrossDomainAuth();
    alert(`Détection de cookies cross-domaine: ${result ? 'Cookies trouvés' : 'Aucun cookie trouvé'}`);
  };
  
  const checkSubscriptionCookie = () => {
    const status = getSubscriptionStatusFromCookie();
    alert(`Statut d'abonnement depuis cookie: ${status ? JSON.stringify(status) : 'Non trouvé'}`);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Débogage d'authentification cross-domaine</h1>
      
      {isDev && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
          <p className="font-bold">Mode développement détecté</p>
          <p>En développement, toutes les fonctionnalités premium sont automatiquement disponibles.</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>État d'authentification</CardTitle>
            <CardDescription>État actuel de connexion</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Utilisateur:</strong> {user ? user.email : 'Non connecté'}</p>
              <p><strong>Loading:</strong> {loading ? 'Oui' : 'Non'}</p>
              <p><strong>Auth Ready:</strong> {authReady ? 'Oui' : 'Non'}</p>
              <p><strong>Abonnement:</strong> {isSubscribed ? 'Actif' : 'Inactif'}</p>
              <p><strong>Type d'abonnement:</strong> {subscriptionType || 'Aucun'}</p>
              <p><strong>Mode développement:</strong> {isDev ? 'Oui' : 'Non'}</p>
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button onClick={() => supabase.auth.signOut()}>
              Se déconnecter
            </Button>
            <Button onClick={() => window.location.href = "/login"}>
              Page de connexion
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tests cross-domaine</CardTitle>
            <CardDescription>Tester les fonctions de cookies cross-domaine</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button onClick={forceWriteCookies} className="w-full mb-2">
                Forcer l'écriture des cookies
              </Button>
              <Button onClick={clearAllCookies} variant="destructive" className="w-full mb-2">
                Nettoyer tous les cookies
              </Button>
              <Button onClick={testCookieDetection} variant="outline" className="w-full mb-2">
                Tester détection de cookies
              </Button>
              <Button onClick={checkSubscriptionCookie} variant="outline" className="w-full">
                Vérifier cookie d'abonnement
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Cookies actuels</CardTitle>
            <CardDescription>Liste des cookies dans le navigateur</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-3 rounded-md overflow-x-auto max-h-40">
              {cookies.length === 0 ? (
                <p className="text-gray-500">Aucun cookie trouvé</p>
              ) : (
                <ul className="list-disc list-inside space-y-1">
                  {cookies.map((cookie, index) => (
                    <li key={index} className="text-sm">
                      {cookie}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>LocalStorage</CardTitle>
            <CardDescription>Données pertinentes du localStorage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-3 rounded-md overflow-x-auto max-h-60">
              {Object.keys(localStorageData).length === 0 ? (
                <p className="text-gray-500">Aucune donnée pertinente trouvée</p>
              ) : (
                Object.entries(localStorageData).map(([key, value]) => (
                  <div key={key} className="mb-3">
                    <p className="font-bold text-sm">{key}:</p>
                    <pre className="text-xs bg-white p-2 rounded-md overflow-x-auto mt-1">
                      {value.length > 500 ? value.substring(0, 500) + '...' : value}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={refreshData} variant="outline">
              Rafraîchir les données
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 