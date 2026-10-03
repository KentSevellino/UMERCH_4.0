import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { takeOauthOrigin } from '../utils/oauthErrors';
import { DeviceFingerprint } from '../utils/DeviceFingerprint';

async function resolveFingerprint(): Promise<string | undefined> {
  try {
    const stored = DeviceFingerprint.getStoredFingerprint();
    if (stored) {
      return stored;
    }

    const generated = await DeviceFingerprint.generateFingerprint();
    DeviceFingerprint.storeFingerprint(generated);

    return generated;
  } catch {
    return undefined;
  }
}

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
      navigate(`${home}?error=${encodeURIComponent(error)}`, { replace: true });
      return;
    }
    if (!code) {
      navigate(home, { replace: true });
      return;
    }

    resolveFingerprint()
      .then((fingerprint) => loginWithGoogleCode(code, fingerprint))
      .then((result) => navigate(result.redirect || '/Landing', { replace: true }))
      .catch((err: unknown) => {
        const data = (err as { response?: { data?: { message?: string } } })?.response?.data;
        const message = data?.message || 'Google sign-in failed. Please try again.';
        navigate(`${home}?error=${encodeURIComponent(message)}`, { replace: true });
      });
  }, [searchParams, loginWithGoogleCode, navigate]);

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center">
      <p className="text-gray-600 text-sm">Signing you in...</p>
    </div>
  );
}
