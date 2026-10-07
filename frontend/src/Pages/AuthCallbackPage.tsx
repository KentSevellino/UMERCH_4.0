import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { takeOauthOrigin } from '../utils/oauthErrors';
import { formatSignInError, safeSignInErrorCode } from '../utils/signInErrors';

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const { loginWithGoogleCode } = useAuth();
  const navigate = useNavigate();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    const error = searchParams.get('error');
    const code = searchParams.get('code');
    const origin = takeOauthOrigin();
    const home = origin === 'landing' ? '/Landing' : '/login';

    if (error) {
      navigate(`${home}?error=${safeSignInErrorCode(error)}`, { replace: true });
      return;
    }
    if (!code) {
      navigate(home, { replace: true });
      return;
    }

    loginWithGoogleCode(code)
      .then((result) => navigate(result.redirect || '/Landing', { replace: true }))
      .catch((err: unknown) => {
        const { code } = formatSignInError(err);
        navigate(`${home}?error=${code === 'sign_in_failed' ? 'google_failed' : code}`, { replace: true });
      });
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
      <p className="text-gray-600 text-sm">Signing you in...</p>
    </div>
  );
}
