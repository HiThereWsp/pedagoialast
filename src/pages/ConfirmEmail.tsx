import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client.ts";
import {
  FunctionsHttpError,
  FunctionsRelayError,
  FunctionsFetchError,
} from "@supabase/supabase-js";

type AuthType = "signup" | "email" | "magiclink" | "invite" | "recovery";

export default function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [auth, setAuth] = useState<{
    token: string;
    type: AuthType | null;
    redirect_to: string;
  }>({ token: "", type: null, redirect_to: "/home" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Extract and validate auth parameters
  useEffect(() => {
    const token = searchParams.get("token_hash");
    const typeParam = searchParams.get("type");
    const redirect_to = searchParams.get("redirect_to") || "/home";

    const validTypes: AuthType[] = ["signup", "email", "magiclink", "invite", "recovery"];
    const type = validTypes.includes(typeParam as AuthType)
        ? (typeParam as AuthType)
        : null;

    if (token && type) {
      setAuth({ token, type, redirect_to });
    }
  }, [searchParams]);

  const handleRedirect = useCallback(async () => {
    if (!auth.token || !auth.type) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Verify OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: auth.token,
        type: auth.type,
      });

      if (error) {
        console.error("Verification failed:", error.message);
        setErrorMessage("Something went wrong. Please try again.");
        return;
      }

      // Use session from verification response
      const session = data.session;
      if (!session) {
        setErrorMessage("Session not available. Please try again.");
        return;
      }

      // Handle post-verification actions
      // if (auth.type === "signup") {
      //   console.log("sending email!")
      //   try {
      //     const { data: emailData, error: emailError } = await supabase.functions.invoke(
      //         "send-welcome-emails-after-signup",
      //         {
      //           body: {
      //             type: "welcome",
      //             email: session.user?.email,
      //           },
      //         }
      //     );
      //
      //     if (emailError) {
      //       if (emailError instanceof FunctionsHttpError) {
      //         const errorMessage = await emailError.context.json();
      //         console.error("Function error:", errorMessage);
      //       } else if (emailError instanceof FunctionsRelayError) {
      //         console.error("Relay error:", emailError.message);
      //       } else if (emailError instanceof FunctionsFetchError) {
      //         console.error("Fetch error:", emailError.message);
      //       }
      //       console.log("Welcome email data:", emailData);
      //     }
      //   } catch (emailErr) {
      //     console.error("Email sending failed:", emailErr);
      //   }
      // }

      // Handle navigation
      switch (auth.type) {
        case "signup":
        case "magiclink":
          navigate("/home");
          break;
        case "recovery":
          navigate("/reset-password");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setErrorMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [auth.token, auth.type, auth.redirect_to, navigate]);

  // Auto-trigger verification when valid auth exists
  useEffect(() => {
    if (auth.token && auth.type) {
      handleRedirect();
    }
  }, [auth.token, auth.type, handleRedirect]);

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    );
  }

  return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        {errorMessage && (
            <div className="mb-4">
              <p className="text-red-500 mb-2">{errorMessage}</p>
              {auth.token && (
                  <Button
                      onClick={handleRedirect}
                      className="px-4 py-2 text-white bg-blue-600 rounded-md"
                  >
                    Retry Verification
                  </Button>
              )}
            </div>
        )}

        {!auth.token && (
            <p className="text-red-500">Invalid or expired verification link.</p>
        )}
      </div>
  );
}