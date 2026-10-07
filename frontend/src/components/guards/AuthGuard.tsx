import { Navigate } from 'react-router-dom';
import { protectedDestination } from '../../utils/authState';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { status, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
        <div className="text-[#9C0306] text-lg font-semibold">Loading...</div>
      </div>
    );
  }

  const destination = protectedDestination(status, false, isAdmin);
  if (destination) return <Navigate to={destination} replace />;

  return <>{children}</>;
}
