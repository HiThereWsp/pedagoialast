
import { useState } from "react"
import { SignUpForm } from "./auth/SignUpForm"
import { SignInForm } from "./auth/SignInForm"
import {supabase} from "@/integrations/supabase/client.ts";
import {ThemeSupa} from "@supabase/auth-ui-shared";
import {Auth} from "@supabase/auth-ui-react";
import { FacebookLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import {useNavigate} from "react-router-dom";
import { Provider } from "@supabase/supabase-js";

export const LoginForm = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const navigate = useNavigate()
    const SocialLogin = async (provider_name: Provider) => {
      const {data, error} = await supabase.auth.signInWithOAuth({
          provider: provider_name,
          options: {
              redirectTo: "https://pedagoia.fr/login"
          }
      })
  }
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isSignUp ? "Inscription" : "Connexion"}
      </h2>
        <FacebookLoginButton onClick={() => SocialLogin("facebook" as Provider)} >
            {isSignUp ? <span>Signup with Facebook</span> : <span>Login with Facebook</span>}
        </FacebookLoginButton>
        <GoogleLoginButton style={{marginTop: 20}} onClick={() => SocialLogin("google" as Provider)}>
            {isSignUp ? <span>Signup with Google</span> : <span>Login with Google</span>}
        </GoogleLoginButton>
      {isSignUp ? (
          <SignUpForm onToggleMode={() => setIsSignUp(false)} />
      ) : (
          <SignInForm onToggleMode={() => setIsSignUp(true)} />
      )}
    </div>
  )
}
