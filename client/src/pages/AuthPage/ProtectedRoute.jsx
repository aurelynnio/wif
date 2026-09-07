import { useAuthStore } from '@/store/authStore';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasHydrated = useAuthStore(state => state._hasHydrated);

  // Wait for persist rehydration before making redirect decisions
  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
