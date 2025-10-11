import ThirdParty, { Google, Github } from 'supertokens-auth-react/recipe/thirdparty';
import Passwordless from 'supertokens-auth-react/recipe/passwordless';
import EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import Session from 'supertokens-auth-react/recipe/session';

export function getApiDomain() {
  if (import.meta.env.PROD) {
    return `https://${import.meta.env.VITE_PRODUCTION_DOMAIN || 'kontracts-ui.vadlakonda.in'}`;
  }
  // For development, use production API or local if available
  return import.meta.env.VITE_API_DOMAIN || `https://kontracts-ui.vadlakonda.in`;
}

export function getWebsiteDomain() {
  if (import.meta.env.PROD) {
    return `https://${import.meta.env.VITE_PRODUCTION_DOMAIN || 'kontracts-ui.vadlakonda.in'}`;
  }
  // For development, detect current port
  return window.location.origin;
}

export const SuperTokensConfig = {
  appInfo: {
    appName: 'Kontracts',
    apiDomain: getApiDomain(),
    websiteDomain: getWebsiteDomain(),
    apiBasePath: '/api/auth',
    websiteBasePath: '/auth',
  },
  recipeList: [
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [Google.init(), Github.init()],
      },
    }),
    Passwordless.init({
      contactMethod: 'EMAIL',
    }),
    EmailVerification.init({
      mode: 'REQUIRED',
    }),
    Session.init(),
  ],
  getRedirectionURL: async (context: { action: string; newSessionCreated?: boolean }) => {
    if (context.action === 'SUCCESS' && context.newSessionCreated) {
      return '/dashboard';
    }
    return undefined;
  },
};