import { useState } from "react"
import { SignUpForm } from "./auth/SignUpForm"
import { SignInForm } from "./auth/SignInForm"
import {supabase} from "@/integrations/supabase/client.ts";
import {ThemeSupa} from "@supabase/auth-ui-shared";
import {Auth} from "@supabase/auth-ui-react";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isSignUp ? "Inscription" : "Connexion"}
      </h2>
      
      {isSignUp ? (
              <>
                  <Auth
                      supabaseClient={supabase}
                      appearance={{
                          theme: ThemeSupa,
                      }}

                      providers={["google"]}
                      redirectTo="http://localhost:8080/login"
                      onlyThirdPartyProviders={true}

                  />
                  <SignUpForm onToggleMode={() => setIsSignUp(false)} />
              </>
      ) : (
          <>
              <Auth
                  supabaseClient={supabase}
                  appearance={{
                      theme: ThemeSupa,
                  }}

                  providers={["google"]}
                  redirectTo="http://localhost:8080/login"
                  onlyThirdPartyProviders={true}

              />
              <SignInForm onToggleMode={() => setIsSignUp(true)} />
          </>
      )}
    </div>
  )
}