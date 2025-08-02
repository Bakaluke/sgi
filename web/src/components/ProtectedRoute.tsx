import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingOverlay } from '@mantine/core';
import { JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
  allowedRoles?: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { token, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingOverlay visible />;
  }

  if (!token) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role || '')) {
    return <Navigate to="/products" />;
  }

  return children;
};

export default ProtectedRoute;