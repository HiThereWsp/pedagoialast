import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/landing/LoginForm';

export default function Login() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') as "sign_in" | "sign_up" || "sign_up";

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Assistant Pédagogique IA
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {view === "sign_up" ? "Inscrivez-vous pour continuer" : "Connectez-vous pour continuer"}
          </p>
        </div>

        <LoginForm defaultView={view} />
      </div>
    </div>
  );
}