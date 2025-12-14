import { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  return <SessionGate>{children}</SessionGate>;
}

interface SessionGateProps {
  children: React.ReactNode;
}

function SessionGate({ children }: SessionGateProps) {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (isLoading) return;

    if (error) {
      console.error('AuthWrapper: Auth0 error', error);
      setLocation('/auth');
      return;
    }

    const onAuthRoute = location.startsWith('/auth');

    if (!isAuthenticated && !onAuthRoute) {
      setLocation('/auth');
      return;
    }

    if (isAuthenticated && onAuthRoute) {
      setLocation('/dashboard');
    }
  }, [error, isAuthenticated, isLoading, location, setLocation]);

  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900'></div>
      </div>
    );
  }

  if (location.startsWith('/auth')) {
    return <>{children}</>;
  }

  if (!isAuthenticated) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='text-center'>
          <p className='text-gray-600'>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
