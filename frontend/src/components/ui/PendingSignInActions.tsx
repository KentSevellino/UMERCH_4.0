import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function PendingSignInActions({ showResume = true }: { showResume?: boolean }) {
  const { isPendingVerification, logout } = useAuth();
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState('');
  if (!isPendingVerification) return null;

  const cancel = async () => {
    setCancelling(true);
    setError('');
    try {
      await logout();
    } catch {
      setError('Unable to cancel sign-in. Please try again.');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-amber-50 px-4 py-3 text-sm text-[#9C0306]" role="status">
      <span>Verification required</span>
      {showResume && <Link className="font-semibold underline" to="/authentication">Complete verification</Link>}
      <button className="underline disabled:opacity-50" disabled={cancelling} onClick={() => void cancel()}>
        {cancelling ? 'Cancelling...' : 'Cancel sign-in'}
      </button>
      {error && <span role="alert">{error}</span>}
    </div>
  );
}
