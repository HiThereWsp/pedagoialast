
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { SEO } from "@/components/SEO";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useMarketingAccess } from "@/hooks/useMarketingAccess";

// This is a protected admin page for repairing user subscriptions
const AdminSubscriptionRepairPage = () => {
  useMarketingAccess(); // Protect this page
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [repairType, setRepairType] = useState<"ambassador" | "subscription">("ambassador");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const handleRepairSubscription = async () => {
    if (!email) {
      toast.error("Email address is required");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      // Choose which function to call based on repair type
      const functionName = repairType === "ambassador" 
        ? "fix-ambassador-subscription" 
        : "repair-user-subscription";
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: { email }
      });

      if (error) {
        console.error(`Error with ${repairType} repair:`, error);
        setResult({
          success: false,
          message: `Failed to repair ${repairType}`,
          details: error.message,
        });
        toast.error(`Failed to repair ${repairType}`);
      } else {
        console.log(`${repairType} repair result:`, data);
        setResult({
          success: true,
          message: `${repairType} successfully repaired`,
          details: data,
        });
        toast.success(`${repairType} successfully repaired`);
      }
    } catch (err) {
      console.error(`Exception during ${repairType} repair:`, err);
      setResult({
        success: false,
        message: `Exception occurred during ${repairType} repair`,
        details: err.message,
      });
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container max-w-2xl py-10">
      <SEO title="Admin Subscription Management" description="Manage user subscriptions" />
      <h1 className="text-2xl font-bold mb-6">Gestion des Abonnements (Admin)</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email de l'utilisateur</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="utilisateur@exemple.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label>Type de réparation</Label>
            <RadioGroup value={repairType} onValueChange={(v) => setRepairType(v as "ambassador" | "subscription")}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ambassador" id="ambassador" />
                <Label htmlFor="ambassador">Accès Ambassadeur</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="subscription" id="subscription" />
                <Label htmlFor="subscription">Abonnement Standard</Label>
              </div>
            </RadioGroup>
          </div>
          
          <Button 
            onClick={handleRepairSubscription} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              "Réparer l'abonnement"
            )}
          </Button>
        </div>
      </div>
      
      {result && (
        <Card className={`mt-6 p-4 ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {result.details && (
                <pre className="text-xs mt-2 bg-gray-100 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(result.details, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AdminSubscriptionRepairPage;
