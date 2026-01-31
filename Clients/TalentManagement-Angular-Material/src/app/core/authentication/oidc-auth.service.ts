import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService, OAuthEvent } from 'angular-oauth2-oidc';
import { BehaviorSubject, Subject, filter } from 'rxjs';
import { authConfig } from '../../config/auth.config';

export interface UserInfo {
  sub: string;
  name?: string;
  email?: string;
  role?: string | string[];
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class OidcAuthService {
  private oauthService = inject(OAuthService);
  private router = inject(Router);

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  private userInfoSubject = new BehaviorSubject<UserInfo | null>(null);
  public userInfo$ = this.userInfoSubject.asObservable();

  // Event emitter for permission refresh - used by StartupService
  private permissionsChangeSubject = new Subject<void>();
  public permissionsChange$ = this.permissionsChangeSubject.asObservable();

  constructor() {
    this.configureOAuth();
  }

  /**
   * Configure OAuth service with auth config
   */
  private configureOAuth(): void {
    this.oauthService.configure(authConfig);

    // Subscribe to token events
    this.oauthService.events
      .pipe(filter(e => e.type === 'token_received'))
      .subscribe(() => {
        this.handleSuccessfulLogin();
      });

    this.oauthService.events
      .pipe(filter(e => e.type === 'token_error' || e.type === 'token_refresh_error'))
      .subscribe(() => {
        console.error('Token error occurred');
      });

    // Setup automatic silent refresh
    this.oauthService.setupAutomaticSilentRefresh();
  }

  /**
   * Initialize authentication - loads discovery document and tries to process login
   */
  async initAuth(): Promise<boolean> {
    try {
      // Load discovery document (OIDC metadata from /.well-known/openid-configuration)
      await this.oauthService.loadDiscoveryDocument();

      // Try to login using authorization code flow (processes callback if present)
      await this.oauthService.tryLogin();

      // Check if we have a valid access token
      if (this.oauthService.hasValidAccessToken()) {
        await this.handleSuccessfulLogin();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error during authentication initialization:', error);
      return false;
    }
  }

  /**
   * Initiate login flow - redirects to IdentityServer
   */
  login(targetUrl?: string): void {
    if (targetUrl) {
      this.oauthService.initCodeFlow(targetUrl);
    } else {
      this.oauthService.initCodeFlow();
    }
  }

  /**
   * Logout - clears tokens and redirects to IdentityServer logout
   */
  logout(): void {
    this.oauthService.logOut();
    this.isAuthenticatedSubject.next(false);
    this.userInfoSubject.next(null);
    // Emit event to refresh permissions (reset to Guest role)
    this.permissionsChangeSubject.next();
  }

  /**
   * Handle successful login - load user info and update state
   */
  private async handleSuccessfulLogin(): Promise<void> {
    try {
      const claims = this.oauthService.getIdentityClaims() as UserInfo;
      this.userInfoSubject.next(claims);
      this.isAuthenticatedSubject.next(true);
      // Emit event to refresh permissions based on user's roles from token
      this.permissionsChangeSubject.next();
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  /**
   * Get access token
   */
  getAccessToken(): string {
    return this.oauthService.getAccessToken();
  }

  /**
   * Get current user info
   */
  getUserInfo(): UserInfo | null {
    return this.userInfoSubject.value;
  }

  /**
   * Get user roles from token claims
   */
  getUserRoles(): string[] {
    const claims = this.oauthService.getIdentityClaims() as any;
    if (!claims) return [];

    const role = claims['role'];

    if (Array.isArray(role)) {
      return role;
    } else if (typeof role === 'string') {
      return [role];
    }

    return [];
  }

  /**
   * Check if user has a specific role
   */
  hasRole(role: string): boolean {
    const roles = this.getUserRoles();
    return roles.includes(role);
  }

  /**
   * Check if user is Employee
   */
  isEmployee(): boolean {
    return this.hasRole('Employee');
  }

  /**
   * Check if user is Manager
   */
  isManager(): boolean {
    return this.hasRole('Manager');
  }

  /**
   * Check if user is HRAdmin
   */
  isHRAdmin(): boolean {
    return this.hasRole('HRAdmin');
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getUserRoles();
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Get user display name
   */
  getUserDisplayName(): string {
    const userInfo = this.getUserInfo();
    return userInfo?.name || userInfo?.email || 'User';
  }
}
