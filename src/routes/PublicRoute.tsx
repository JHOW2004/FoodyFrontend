import type React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/useAuthStore';

export const PublicRoute: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Outlet />;
};
