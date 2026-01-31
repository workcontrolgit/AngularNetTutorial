import { Component, ViewEncapsulation, inject, OnInit, OnDestroy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-panel',
  template: `
    <div class="matero-user-panel" [class.authenticated]="oidcAuth.isAuthenticated()">
      <mat-icon class="matero-user-panel-avatar">account_circle</mat-icon>
      <div class="matero-user-panel-info">
        <h4>{{ userName }}</h4>
        <h5>{{ userEmail }}</h5>
      </div>
    </div>
  `,
  styleUrl: './user-panel.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule],
})
export class UserPanel implements OnInit, OnDestroy {
  readonly oidcAuth = inject(OidcAuthService);
  private authSubscription?: Subscription;

  userName = 'Guest';
  userEmail = 'Anonymous';

  ngOnInit(): void {
    // Set initial values
    this.updateUserInfo();

    // Subscribe to authentication state changes
    this.authSubscription = this.oidcAuth.isAuthenticated$.subscribe((isAuth) => {
      console.log('UserPanel: Auth state changed:', isAuth);
      this.updateUserInfo();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  private updateUserInfo(): void {
    const isAuth = this.oidcAuth.isAuthenticated();
    console.log('UserPanel: Updating user info, isAuthenticated:', isAuth);

    if (!isAuth) {
      this.userName = 'Guest';
      this.userEmail = 'Anonymous';
      return;
    }

    const userInfo = this.oidcAuth.getUserInfo();
    console.log('UserPanel: User info from service:', userInfo);
    console.log('UserPanel: Available claims:', userInfo ? Object.keys(userInfo) : 'null');

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

    console.log('UserPanel: Set userName to:', this.userName, 'email to:', this.userEmail);
  }
}
