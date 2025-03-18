
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type SyncStats = {
  processed: number;
  success: number;
  failures: number;
  skipped: number;
};

export function BrevoSync() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string; stats?: SyncStats} | null>(null);
  const [userId, setUserId] = useState('');
  const [limit, setLimit] = useState('100');

  const handleSync = async (mode: 'all' | 'user') => {
    setLoading(true);
    setResult(null);
    
    try {
      const payload: Record<string, any> = { syncMode: mode };
      
      if (mode === 'user' && userId) {
        payload.userId = userId;
      } else {
        payload.limit = parseInt(limit);
      }
      
      const { data, error } = await supabase.functions.invoke('sync-users-to-brevo', {
        body: payload
      });
      
      if (error) {
        console.error('Error syncing users:', error);
        setResult({ success: false, message: `Error: ${error.message}` });
        return;
      }
      
      setResult({ 
        success: true, 
        message: data.message || 'Synchronization completed', 
        stats: data.stats
      });
      console.log('Sync result:', data);
    } catch (err) {
      console.error('Exception during sync:', err);
      setResult({ success: false, message: `Exception: ${err instanceof Error ? err.message : String(err)}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle>Synchronisation Utilisateurs vers Brevo</CardTitle>
        <CardDescription>
          Synchronisez les utilisateurs existants de Supabase vers les listes appropriées dans Brevo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">Tous les utilisateurs</TabsTrigger>
            <TabsTrigger value="single">Utilisateur spécifique</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="limit">Nombre d'utilisateurs à traiter</Label>
              <Input 
                id="limit" 
                type="number" 
                value={limit} 
                onChange={e => setLimit(e.target.value)} 
                placeholder="100" 
              />
              <p className="text-sm text-gray-500">
                Limite le nombre d'utilisateurs traités par batch pour éviter les timeouts
              </p>
            </div>
            
            <Button 
              onClick={() => handleSync('all')} 
              disabled={loading}
              className="w-full"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronisation en cours...</> : 'Synchroniser tous les utilisateurs'}
            </Button>
          </TabsContent>
          
          <TabsContent value="single" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userId">ID Utilisateur</Label>
              <Input 
                id="userId" 
                value={userId} 
                onChange={e => setUserId(e.target.value)} 
                placeholder="UUID de l'utilisateur"
              />
            </div>
            
            <Button 
              onClick={() => handleSync('user')} 
              disabled={loading || !userId}
              className="w-full"
            >
              {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Synchronisation en cours...</> : 'Synchroniser cet utilisateur'}
            </Button>
          </TabsContent>
        </Tabs>
        
        {result && (
          <Alert className={`mt-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            {result.success ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertTitle>{result.success ? 'Synchronisation réussie' : 'Erreur de synchronisation'}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.stats && (
                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div>Utilisateurs traités: {result.stats.processed}</div>
                  <div>Synchronisations réussies: {result.stats.success}</div>
                  <div>Échecs: {result.stats.failures}</div>
                  <div>Ignorés: {result.stats.skipped}</div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-xs text-gray-500">
          Les listes Brevo: #7 Beta, #8 Free, #9 Premium, #10 Ambassadeurs
        </div>
      </CardFooter>
    </Card>
  );
}
