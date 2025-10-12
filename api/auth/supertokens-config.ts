import ThirdParty from 'supertokens-node/recipe/thirdparty';
import Session from 'supertokens-node/recipe/session';
import Dashboard from 'supertokens-node/recipe/dashboard';
import UserRoles from 'supertokens-node/recipe/userroles';
import EmailVerification from 'supertokens-node/recipe/emailverification';
import Passwordless from 'supertokens-node/recipe/passwordless';
import type { TypeInput } from 'supertokens-node/types';

export function getApiDomain() {
  if (process.env.NODE_ENV === 'production') {
    return `https://${process.env.VERCEL_URL || process.env.PRODUCTION_DOMAIN || 'kontracts-ui.vadlakonda.in'}`;
  }
  return `http://localhost:${process.env.PORT || 3000}`;
}

export function getWebsiteDomain() {
  if (process.env.NODE_ENV === 'production') {
    return `https://${process.env.VERCEL_URL || process.env.PRODUCTION_DOMAIN || 'kontracts-ui.vadlakonda.in'}`;
  }
  // Allow any localhost port for development
  return 'http://localhost:*';
}

export const SuperTokensConfig: TypeInput = {
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI || 'https://try.supertokens.com',
    apiKey: process.env.SUPERTOKENS_API_KEY,
  },
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
        providers: [
          {
            config: {
              thirdPartyId: 'google',
              clients: [
                {
                  clientId: process.env.GOOGLE_CLIENT_ID || '',
                  clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
                },
              ],
            },
          },
          {
            config: {
              thirdPartyId: 'github',
              clients: [
                {
                  clientId: process.env.GITHUB_CLIENT_ID || '',
                  clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
                },
              ],
            },
          },
        ],
      },
    }),
    Passwordless.init({
      contactMethod: 'EMAIL',
      flowType: 'USER_INPUT_CODE_AND_MAGIC_LINK',
    }),
    Dashboard.init(),
    UserRoles.init(),
    EmailVerification.init({
      mode: 'REQUIRED',
    }),
    Session.init(),
  ],
};