import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import { ShieldAlert } from 'lucide-react';
import { Button } from '../ui/button';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Protected Route Component
 * Restricts access based on authentication and user roles
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  fallback,
}) => {
  const { user, isAuthenticated } = useAuth();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return fallback || null;
  }

  // Check role if specified
  if (allowedRoles && allowedRoles.length > 0) {
    if (!allowedRoles.includes(user.role)) {
      return (
        <AccessDenied 
          message={`Cette section est réservée aux ${allowedRoles.join(', ')}`}
        />
      );
    }
  }

  return <>{children}</>;
};

/**
 * Access Denied Component
 */
interface AccessDeniedProps {
  message?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ message }) => {
  const { logout } = useAuth();

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
          Accès Refusé
        </h2>
        <p className="text-[#64748B] mb-6">
          {message || "Vous n'avez pas les permissions nécessaires pour accéder à cette page."}
        </p>
        <Button variant="outline" onClick={logout}>
          Se déconnecter
        </Button>
      </div>
    </div>
  );
};

/**
 * Admin Only Component
 */
export const AdminOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin']}>{children}</ProtectedRoute>
);

/**
 * Manager Only Component (Admin + Magasinier)
 */
export const ManagerOnly: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['admin', 'magasinier']}>{children}</ProtectedRoute>
);

/**
 * Hook to check if current user can access based on roles
 */
export const useCanAccess = (allowedRoles: UserRole[]): boolean => {
  const { user, isAuthenticated } = useAuth();
  
  if (!isAuthenticated || !user) return false;
  return allowedRoles.includes(user.role);
};
