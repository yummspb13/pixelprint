"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'user' | 'admin';
  redirectTo?: string;
}

export default function ProtectedRoute({ 
  children, 
  requiredRole = 'user',
  redirectTo = '/'
}: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        toast.error('Please log in to access this page');
        router.push(redirectTo);
        return;
      }

      if (requiredRole === 'admin' && user.role !== 'admin') {
        toast.error('Access denied. Admin privileges required.');
        router.push('/dashboard');
        return;
      }
    }
  }, [user, loading, requiredRole, router, redirectTo]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-px-cyan"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (requiredRole === 'admin' && user.role !== 'admin') {
    return null;
  }

  return <>{children}</>;
}
