import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useNavigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const user = useAuthStore(state => state.user);
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const hasHydrated = useAuthStore(state => state._hasHydrated);
  const navigate = useNavigate();

  useEffect(() => {
    // Chờ persist rehydrate xong trước khi quyết định redirect
    if (!hasHydrated) return;

    // Nếu chưa đăng nhập, chuyển về đăng nhập
    if (!isAuthenticated || !user) {
      navigate('/auth/login', { replace: true });
      return;
    }

    // Kiểm tra quyền admin
    const isUserAdmin = user.isAdmin || user.role === 'admin';

    if (!isUserAdmin) {
      navigate('/access-denied', { replace: true });
    }
  }, [hasHydrated, isAuthenticated, user, navigate]);

  if (!hasHydrated) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const isUserAdmin = user.isAdmin || user.role === 'admin';
  if (!isUserAdmin) {
    return null;
  }

  return <Outlet />;
};

export default AdminRoute;
