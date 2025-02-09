import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client.ts";
import { FunctionsHttpError, FunctionsRelayError, FunctionsFetchError } from "@supabase/supabase-js"


export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState({
    token: "",
    type: "",
    redirect_to: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const redirect_to = searchParams.get("redirect_to") || "/home";

    if (token && type) {
      setAuth({ token, type, redirect_to });
    }
  }, [searchParams]);

  const handleRedirect = async () => {
    if (!auth.token || !auth.type) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: auth.token,
        type: auth.type,
      });

      if (error) {
        console.error("Verification failed:", error.message);
        setErrorMessage("Something went wrong. Please try again.");
      } else {
        console.log("Verification successful:", data);
      }

      const { data: session } = await supabase.auth.getSession();

      if (session) {
        if(auth.type === "signup") {
          const {data, error} =  await supabase.functions.invoke("send-emails", {
            body: {
              type: 'welcome',
              email: session?.user?.email

            }
          })
          if (error instanceof FunctionsHttpError) {
            const errorMessage = await error.context.json()
            console.log('Function returned an error', errorMessage)
          } else if (error instanceof FunctionsRelayError) {
            console.log('Relay error:', error.message)
          } else if (error instanceof FunctionsFetchError) {
            console.log('Fetch error:', error.message)
          }


        }
        if(session && auth.type == 'magiclink' || auth.type == 'signup') {
          navigate("/home");
        }
        if (session && auth.type == 'recovery') {
          navigate("/reset-password");
        }
      }

    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}

        {auth.token ? (
            <Button onClick={handleRedirect} className="px-4 py-2 text-white bg-blue-600 rounded-md">
              Continue to Verify
            </Button>
        ) : (
            <p className="text-red-500">Token is missing or expired.</p>
        )}
      </div>
  );
}
