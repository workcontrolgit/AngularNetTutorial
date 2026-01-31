import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { OidcAuthService } from './oidc-auth.service';

/**
 * Role-based route guard
 * Usage in routes:
 * {
 *   path: 'admin',
 *   canActivate: [roleGuard],
 *   data: { roles: ['HRAdmin'] }
 * }
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  // Check if user is authenticated
  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Get required roles from route data
  const requiredRoles = route.data['roles'] as string[];

  // If no roles specified, just check authentication
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    return true;
  }

  // User doesn't have required role - redirect to unauthorized page
  router.navigate(['/403']);
  return false;
};

/**
 * Employee role guard - shortcut for Employee role
 */
export const employeeGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isEmployee() || authService.isManager() || authService.isHRAdmin()) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};

/**
 * Manager role guard - for Manager and HRAdmin roles
 */
export const managerGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isManager() || authService.isHRAdmin()) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};

/**
 * HRAdmin role guard - only for HRAdmin role
 */
export const hrAdminGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(OidcAuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isHRAdmin()) {
    return true;
  }

  router.navigate(['/403']);
  return false;
};
