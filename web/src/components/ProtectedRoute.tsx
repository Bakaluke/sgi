import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '@mantine/core';
import type { ProtectedRouteProps } from '../types';

const ProtectedRoute = ({ children, allowedRoles, requiredPermission }: ProtectedRouteProps) => {
  const { token, user, can, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/dashboard" />;
  }

  if (requiredPermission && !can(requiredPermission)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

export default ProtectedRoute;