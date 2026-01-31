import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { PageHeader } from '@shared';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { TokenDecoderService } from '../../services/token-decoder.service';
import { ProfileData, TokenInfo, UserProfile } from '../../models';
import { OAuthService } from 'angular-oauth2-oidc';

@Component({
  selector: 'app-profile-overview',
  standalone: true,
  templateUrl: './profile-overview.component.html',
  styleUrl: './profile-overview.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTabsModule,
    RouterModule,
    PageHeader,
  ],
})
export class ProfileOverviewComponent implements OnInit, OnDestroy {
  private authService = inject(OidcAuthService);
  private oauthService = inject(OAuthService);
  private tokenDecoder = inject(TokenDecoderService);
  private snackBar = inject(MatSnackBar);
  private router = inject(Router);
  private authSubscription?: Subscription;

  profileData: ProfileData | null = null;
  showRawIdToken = false;
  showRawAccessToken = false;

  ngOnInit(): void {
    this.loadProfileData();

    // Subscribe to auth state changes
    this.authSubscription = this.authService.isAuthenticated$.subscribe(() => {
      this.loadProfileData();
    });
  }

  ngOnDestroy(): void {
    this.authSubscription?.unsubscribe();
  }

  loadProfileData(): void {
    const isAuthenticated = this.authService.isAuthenticated();
    const hasValidAccessToken = this.oauthService.hasValidAccessToken();

    console.log('Authentication Status:', {
      isAuthenticated,
      hasValidAccessToken,
    });

    if (!isAuthenticated && !hasValidAccessToken) {
      this.profileData = null;
      return;
    }

    const userInfo = this.authService.getUserInfo();
    const accessToken = this.authService.getAccessToken();
    const idToken = this.oauthService.getIdToken(); // Get ID token from OAuthService
    const roles = this.authService.getUserRoles();

    // Debug logging
    console.log('Profile Data Debug:', {
      isAuthenticated,
      hasUserInfo: !!userInfo,
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      hasIdToken: !!idToken,
      idTokenLength: idToken?.length,
      roles,
    });

    this.profileData = {
      isAuthenticated,
      userInfo,
      idToken: idToken ? this.tokenDecoder.decodeToken(idToken) : null,
      accessToken: accessToken ? this.tokenDecoder.decodeToken(accessToken) : null,
      roles,
      permissions: this.getUserPermissions(),
    };

    console.log('Decoded tokens:', {
      idToken: this.profileData.idToken,
      accessToken: this.profileData.accessToken,
    });
  }

  private getUserPermissions(): string[] {
    const permissions: string[] = [];

    if (this.authService.hasRole('HRAdmin')) {
      permissions.push('canAdd', 'canEdit', 'canDelete', 'canRead');
    } else if (this.authService.hasRole('Manager')) {
      permissions.push('canAdd', 'canEdit', 'canDelete', 'canRead');
    } else if (this.authService.hasRole('Employee')) {
      permissions.push('canRead');
    }

    return permissions;
  }

  toggleRawIdToken(): void {
    this.showRawIdToken = !this.showRawIdToken;
  }

  toggleRawAccessToken(): void {
    this.showRawAccessToken = !this.showRawAccessToken;
  }

  copyToClipboard(text: string, label: string): void {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        this.showMessage(`${label} copied to clipboard`);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        this.showMessage('Failed to copy to clipboard');
      });
  }

  formatJson(obj: any): string {
    return JSON.stringify(obj, null, 2);
  }

  getExpirationStatus(tokenInfo: TokenInfo | null): string {
    return this.tokenDecoder.getExpirationStatus(tokenInfo);
  }

  getExpirationColor(tokenInfo: TokenInfo | null): string {
    if (!tokenInfo || !tokenInfo.expiresIn) {
      return '';
    }

    const hoursRemaining = tokenInfo.expiresIn / 3600;

    if (tokenInfo.isExpired) {
      return 'warn';
    } else if (hoursRemaining < 1) {
      return 'accent';
    } else {
      return 'primary';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) {
      return 'N/A';
    }
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'medium',
    }).format(date);
  }

  showMessage(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
  }

  getScopes(scope: string | string[] | undefined): string[] {
    if (!scope) {
      return [];
    }
    if (Array.isArray(scope)) {
      return scope;
    }
    if (typeof scope === 'string') {
      return scope.split(' ').filter(s => s.length > 0);
    }
    return [];
  }
}
