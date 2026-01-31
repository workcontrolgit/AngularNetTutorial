import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { OidcAuthService } from '../authentication/oidc-auth.service';

/**
 * HTTP Interceptor that adds Bearer token to outgoing requests
 * Only adds token to requests going to the API
 */
export const authTokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(OidcAuthService);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    return next(req);
  }

  // Get access token
  const token = authService.getAccessToken();

  if (!token) {
    return next(req);
  }

  // Clone request and add Authorization header
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });

  return next(authReq);
};
