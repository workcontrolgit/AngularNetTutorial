import { AuthConfig } from 'angular-oauth2-oidc';
import { environment } from '../../environments/environment';

export const authConfig: AuthConfig = {
  // Duende IdentityServer URL
  issuer: environment.identityServerUrl,

  // URL of the Angular app (where IdentityServer will redirect after login)
  redirectUri: window.location.origin + '/callback',

  // URL to redirect after logout
  postLogoutRedirectUri: window.location.origin,

  // The Angular app's client ID as registered with IdentityServer
  clientId: environment.clientId,

  // Requested scopes
  scope: environment.scope,

  // Use Authorization Code Flow with PKCE (most secure for SPAs)
  responseType: 'code',

  // Show debug information in console (disable in production)
  showDebugInformation: !environment.production,

  // Enable silent refresh for automatic token renewal
  useSilentRefresh: true,

  // Silent refresh redirect URI
  silentRefreshRedirectUri: window.location.origin + '/silent-refresh.html',

  // Time before token expires to trigger silent refresh (in seconds)
  silentRefreshTimeout: 5000,

  // Timeout for silent refresh (in milliseconds)
  timeoutFactor: 0.75,

  // Session checks interval (in milliseconds)
  sessionChecksEnabled: true,

  // Clear hash after login
  clearHashAfterLogin: true,

  // Disable strict discovery document validation for local development
  strictDiscoveryDocumentValidation: false,

  // Skip issuer check (only for local development with localhost)
  skipIssuerCheck: !environment.production,

  // Require HTTPS (should be true in production)
  requireHttps: environment.production,

  // Request access token
  requestAccessToken: true,

  // Use HTTP Basic Auth for token requests
  dummyClientSecret: undefined,

  // Custom query parameters
  customQueryParams: {},
};
