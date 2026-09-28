import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/layouts/Navbar';
import Footer from '../components/layouts/Footer';
import GoogleGIcon from '../components/ui/GoogleGIcon';

const GOOGLE_ERRORS: Record<string, string> = {
  no_account: 'No account found for this email. Please contact your admin.',
  inactive: 'Your account has been deactivated. Please contact an administrator.',
  google_failed: 'Google sign-in failed. Please try again.',
  google_email: 'Your Google account did not provide an email address.',
};

const googleAuthUrl = `${import.meta.env.VITE_API_URL || '/api'}/auth/google`;

function oauthErrorFromUrl(): string {
  const oauthError = new URLSearchParams(window.location.search).get('error');
  return oauthError ? (GOOGLE_ERRORS[oauthError] ?? oauthError) : '';
}

export default function LoginPage() {
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loginValue, setLoginValue] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(oauthErrorFromUrl);
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    if (isAdmin) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/Landing', { replace: true });
    }
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(loginValue, password);
      if (result.redirect) {
        navigate(result.redirect);
      } else if (result.otp_required) {
        navigate('/authentication');
      } else if (result.user?.role === 'Admin') {
        navigate('/admin');
      } else {
        navigate('/Landing');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <h1 className="text-2xl font-bold text-center text-[#9C0306] mb-6">Sign In</h1>
          {error && (
            <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email or UM ID</label>
              <input
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#9C0306]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#9C0306]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#9C0306] text-white py-3 rounded-lg font-semibold hover:bg-[#7a0205] transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <div className="flex items-center gap-3 my-4 text-sm text-gray-400">
            <div className="flex-1 border-t border-gray-200" />
            <span>or</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>
          <a
            href={googleAuthUrl}
            className="w-full flex items-center justify-center gap-2 border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <GoogleGIcon />
            Sign in with Google
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
