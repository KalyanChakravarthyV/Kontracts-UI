import { useAuth0 } from '@auth0/auth0-react';
import { useLocation } from 'wouter';

const CONSENT_ERROR_CODES = new Set([
  'consent_required',
  'interaction_required',
  'login_required',
]);

export function useAuthToken() {
  const { getAccessTokenSilently, loginWithRedirect, user } = useAuth0();
  const [location] = useLocation();

  const getToken = async (): Promise<string> => {
    try {
      return await getAccessTokenSilently();
    } catch (err: unknown) {
      const errorCode =
        err instanceof Error
          ? (err as Error & { error?: string }).error
          : undefined;

      if (errorCode && CONSENT_ERROR_CODES.has(errorCode)) {
        await loginWithRedirect({ appState: { returnTo: location } });
        // loginWithRedirect navigates away; return empty string to satisfy type
        return '';
      }

      throw err;
    }
  };

  const getHeaders = async (): Promise<Record<string, string>> => {
    const token = await getToken();
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    const orgId = (user as any)?.org_id;
    if (orgId) {
      headers['X-Organization-ID'] = orgId;
    }
    return headers;
  };

  return { getToken, getHeaders };
}
