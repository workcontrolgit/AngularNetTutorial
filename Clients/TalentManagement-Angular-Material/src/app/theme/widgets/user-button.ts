import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { Router, RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

import { SettingsService } from '@core';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';

@Component({
  selector: 'app-user',
  template: `
    <button matIconButton [matMenuTriggerFor]="menu" class="user-button">
      <mat-icon>account_circle</mat-icon>
    </button>

    <mat-menu #menu="matMenu">
      <div class="user-info">
        <div class="user-name">{{ userName }}</div>
        <div class="user-email">{{ userEmail }}</div>
        <div class="user-roles">{{ userRoles }}</div>
      </div>
      <mat-divider></mat-divider>
      @if (isAuthenticated()) {
        <button routerLink="/profile/overview" mat-menu-item>
          <mat-icon>account_circle</mat-icon>
          <span>{{ 'profile' | translate }}</span>
        </button>
        <button routerLink="/profile/settings" mat-menu-item>
          <mat-icon>edit</mat-icon>
          <span>{{ 'edit_profile' | translate }}</span>
        </button>
      }
      <button mat-menu-item (click)="restore()">
        <mat-icon>restore</mat-icon>
        <span>{{ 'restore_defaults' | translate }}</span>
      </button>
      @if (isAuthenticated()) {
        <button mat-menu-item (click)="logout()">
          <mat-icon>exit_to_app</mat-icon>
          <span>{{ 'logout' | translate }}</span>
        </button>
      } @else {
        <button mat-menu-item (click)="login()">
          <mat-icon>login</mat-icon>
          <span>{{ 'login' | translate }}</span>
        </button>
      }
    </mat-menu>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .user-button {
      display: inline-flex !important;
    }

    .user-info {
      padding: 16px;
      max-width: 250px;

      .user-name {
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .user-email {
        font-size: 12px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }

      .user-roles {
        font-size: 11px;
        color: rgba(0, 0, 0, 0.5);
        font-style: italic;
      }
    }
  `,
  imports: [CommonModule, RouterLink, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, TranslateModule],
})
export class UserButton implements OnInit, OnDestroy {
  private readonly oidcAuth = inject(OidcAuthService);
  private readonly router = inject(Router);
  private readonly settings = inject(SettingsService);
  private authSubscription?: Subscription;

  userName = 'Guest';
  userEmail = '';
  userRoles = 'Anonymous User';

  ngOnInit(): void {
    // Set initial values
    this.updateUserInfo();

    // Subscribe to authentication state changes
    this.authSubscription = this.oidcAuth.isAuthenticated$.subscribe(() => {
      this.updateUserInfo();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  private updateUserInfo(): void {
    if (!this.oidcAuth.isAuthenticated()) {
      this.userName = 'Guest';
      this.userEmail = '';
      this.userRoles = 'Anonymous User';
      return;
    }

    const userInfo = this.oidcAuth.getUserInfo();
    console.log('UserButton: User info:', userInfo);
    console.log('UserButton: Available claims:', userInfo ? Object.keys(userInfo) : 'null');

    // Try different claim names that might be present
    this.userName =
      userInfo?.name ||
      userInfo?.preferred_username ||
      userInfo?.given_name ||
      userInfo?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      userInfo?.sub ||
      'User';

    this.userEmail =
      userInfo?.email ||
      userInfo?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
      '';

    const roles = this.oidcAuth.getUserRoles();
    this.userRoles = roles.length > 0 ? roles.join(', ') : 'No roles';

    console.log('UserButton: Set userName to:', this.userName, 'email to:', this.userEmail, 'roles:', this.userRoles);
  }

  isAuthenticated(): boolean {
    return this.oidcAuth.isAuthenticated();
  }

  login() {
    // Navigate to login page instead of directly calling OIDC
    this.router.navigateByUrl('/login');
  }

  logout() {
    this.oidcAuth.logout();
    this.router.navigateByUrl('/dashboard');
  }

  restore() {
    this.settings.reset();
    window.location.reload();
  }
}
