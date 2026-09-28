import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { loginWithGoogleCode } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const error = searchParams.get('error');
    const code = searchParams.get('code');

    if (error) {
      navigate(`/login?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    if (!code) {
      navigate('/login', { replace: true });
      return;
    }

    loginWithGoogleCode(code)
      .then((result) => navigate(result.redirect || '/Landing', { replace: true }))
      .catch((err: unknown) => {
        const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
        const message = data?.message || 'Google sign-in failed. Please try again.';
        navigate(`/login?error=${encodeURIComponent(message)}`, { replace: true });
      });
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
      <p className="text-gray-600 text-sm">Signing you in...</p>
    </div>
  );
}
