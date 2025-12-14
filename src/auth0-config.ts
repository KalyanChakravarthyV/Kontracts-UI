const domain = import.meta.env.VITE_AUTH0_DOMAIN;
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
const audience = import.meta.env.VITE_AUTH0_AUDIENCE;
const redirectUri =
  typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : '/auth/callback';

export function getAuth0Config() {
  if (!domain || !clientId) {
    throw new Error('Missing Auth0 configuration. Ensure VITE_AUTH0_DOMAIN and VITE_AUTH0_CLIENT_ID are set.');
  }

  return {
    domain,
    clientId,
    audience,
    redirectUri,
    postLoginRedirect: '/dashboard',
  };
}
