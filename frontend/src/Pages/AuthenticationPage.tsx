import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthenticationPage() {
  const { verifyOtp, resendOtp, user } = useAuth();
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await verifyOtp(otp);
      navigate('/Landing');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid OTP';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendOtp();
    } catch {
      // Ignore errors for resend
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F6F6] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-[#9C0306] mb-2">OTP Verification</h1>
        <p className="text-center text-[#727272] text-sm mb-6">
          Enter the 6-digit code sent to {user?.email || 'your email'}
        </p>
        {error && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4 text-sm">{error}</div>
        )}
        <form onSubmit={handleVerify} className="flex flex-col gap-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="Enter OTP"
            maxLength={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-center text-2xl tracking-[0.5em] focus:outline-none focus:border-[#9C0306]"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#9C0306] text-white py-3 rounded-lg font-semibold hover:bg-[#7a0205] transition-colors disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>
        <button
          onClick={handleResend}
          className="w-full mt-4 text-[#9C0306] text-sm font-semibold hover:underline bg-transparent border-none cursor-pointer"
        >
          Resend OTP
        </button>
      </div>
    </div>
  );
}
