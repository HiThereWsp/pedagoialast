
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "@/integrations/supabase/auth";
import { SEO } from "@/components/SEO";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";

// This is a protected admin page for repairing user subscriptions
const AdminSubscriptionRepairPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [adminToken, setAdminToken] = useState("");
  const [planType, setPlanType] = useState<"monthly" | "yearly">("monthly");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  // Admin token should be set as an environment variable or secret
  // and should be a complex value that only admins know
  const handleRepairSubscription = async () => {
    if (!email || !adminToken) {
      toast.error("Email and admin token are required");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("create-manual-subscription", {
        body: {
          email,
          planType,
          adminToken,
        },
      });

      if (error) {
        console.error("Error repairing subscription:", error);
        setResult({
          success: false,
          message: "Failed to repair subscription",
          details: error.message,
        });
        toast.error("Failed to repair subscription");
      } else {
        console.log("Subscription repair result:", data);
        setResult({
          success: true,
          message: "Subscription successfully repaired",
          details: data,
        });
        toast.success("Subscription successfully repaired");
      }
    } catch (err) {
      console.error("Exception repairing subscription:", err);
      setResult({
        success: false,
        message: "Exception occurred while repairing subscription",
        details: err.message,
      });
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify admin access - this is a simple check; you might want more sophisticated protection
  const isAdmin = user?.email === "gly08533@jioso.com" || user?.email === "dlq55377@jioso.com"; 

  if (!isAdmin) {
    return (
      <div className="container max-w-md py-20">
        <SEO title="Access Denied" description="Admin access required" />
        <Card className="p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md py-10">
      <SEO title="Admin Subscription Repair" description="Repair user subscriptions" />
      <h1 className="text-2xl font-bold mb-6">Subscription Repair Tool</h1>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">User Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="adminToken">Admin Security Token</Label>
          <Input
            id="adminToken"
            type="password"
            value={adminToken}
            onChange={(e) => setAdminToken(e.target.value)}
            placeholder="Enter admin token"
          />
        </div>
        
        <div className="space-y-2">
          <Label>Subscription Plan</Label>
          <RadioGroup value={planType} onValueChange={(v) => setPlanType(v as "monthly" | "yearly")}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="monthly" id="monthly" />
              <Label htmlFor="monthly">Monthly Plan</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yearly" id="yearly" />
              <Label htmlFor="yearly">Yearly Plan</Label>
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
              Processing...
            </>
          ) : (
            "Repair Subscription"
          )}
        </Button>
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
