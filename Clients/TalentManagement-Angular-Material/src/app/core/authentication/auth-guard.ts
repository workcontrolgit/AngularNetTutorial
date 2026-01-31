import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { OidcAuthService } from './oidc-auth.service';
import { environment } from '../../../environments/environment';

export const authGuard = (route?: ActivatedRouteSnapshot, state?: RouterStateSnapshot) => {
  const oidcAuth = inject(OidcAuthService);
  const router = inject(Router);

  // Allow anonymous access if configured in environment
  if (environment.allowAnonymousAccess) {
    return true;
  }

  // Check if user is authenticated via OIDC
  if (oidcAuth.isAuthenticated()) {
    return true;
  }

  // Redirect to login if not authenticated and anonymous access is not allowed
  return router.parseUrl('/login');
};
