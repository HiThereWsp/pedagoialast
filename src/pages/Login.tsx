import { useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/components/landing/LoginForm';
import { Header } from '@/components/landing/Header';

export default function Login() {
  const [searchParams] = useSearchParams();
  const view = searchParams.get('view') as "sign_in" | "sign_up" || "sign_up";

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          <LoginForm defaultView={view} />
        </div>
      </div>
    </div>
  );
}