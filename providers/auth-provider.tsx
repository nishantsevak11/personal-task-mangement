'use client';

import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuth();

  useEffect(() => {
    // Check for existing session
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch session:', error);
      });
  }, [setUser]);

  return <>{children}</>;
}
