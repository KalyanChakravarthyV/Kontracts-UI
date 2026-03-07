import { Auth0Provider } from '@auth0/auth0-react';
import type { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { getAuth0Config } from '@/auth0-config';

interface Auth0ProviderWithNavigateProps {
  children: ReactNode;
}

export function Auth0ProviderWithNavigate({ children }: Auth0ProviderWithNavigateProps) {
  const [, setLocation] = useLocation();
  const { domain, clientId, audience, redirectUri, postLoginRedirect } = getAuth0Config();

  const onRedirectCallback = (appState?: { returnTo?: string }) => {
    setLocation(appState?.returnTo || postLoginRedirect);
  };

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: redirectUri,
        audience: audience || undefined,
      }}
      cacheLocation='localstorage'
      onRedirectCallback={onRedirectCallback}
    >
      {children}
    </Auth0Provider>
  );
}
