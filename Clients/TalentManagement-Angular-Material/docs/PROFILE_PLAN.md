# User Profile Implementation Plan

## Executive Summary

Implement a comprehensive user profile page that displays authenticated user information, including ID token claims and access token details. The user menu already has links to profile pages (`/profile/overview` and `/profile/settings`), but the routes and components don't exist yet.

## Current State Analysis

### ✅ Already Implemented
- **User Menu**: User button component with dropdown menu in header
- **Profile Links**: Menu items already link to `/profile/overview` and `/profile/settings`
- **Translation Keys**: i18n keys for profile menu already exist
- **Auth Service**: `OidcAuthService` with methods to get tokens and user info
- **Token Methods Available**:
  - `getAccessToken()`: Returns JWT access token
  - `getUserInfo()`: Returns ID token claims
  - `getUserRoles()`: Returns user roles array
  - `isAuthenticated$`: Observable for auth state

### ❌ Missing Components
- Profile routes not configured in `app.routes.ts`
- Profile overview component (to show tokens and user info)
- Profile settings component (for future use)
- Profile models/interfaces for token display

## Project Goals

1. Create user profile overview page displaying:
   - User information from ID token (name, email, sub, roles)
   - Complete ID token claims (formatted JSON)
   - Access token details (formatted, with decode option)
   - Token expiration information
   - User roles and permissions

2. Add profile routes to application routing
3. Ensure profile page is accessible only to authenticated users
4. Display tokens in a secure, developer-friendly format
5. Follow existing application patterns (Material Design, standalone components)

## Technical Architecture

### Component Structure

```
src/app/routes/profile/
├── profile-overview.component.ts      # Main profile page with tokens
├── profile-overview.component.html    # Template
├── profile-overview.component.scss    # Styling
├── profile-settings.component.ts      # Future: User settings page
├── profile-settings.component.html
└── profile-settings.component.scss
```

### Data Models

```typescript
// src/app/models/profile.model.ts

export interface UserProfile {
  // ID Token Claims
  sub: string;                    // Subject (user ID)
  name?: string;                  // User display name
  email?: string;                 // User email
  preferred_username?: string;    // Username
  role?: string | string[];       // User roles
  [key: string]: any;            // Additional claims
}

export interface TokenInfo {
  token: string;                  // Raw JWT token
  claims: Record<string, any>;    // Decoded claims
  issuedAt?: Date;               // Token issue time
  expiresAt?: Date;              // Token expiration
  isExpired: boolean;            // Expiration status
}

export interface ProfileData {
  userInfo: UserProfile;
  idToken: TokenInfo;
  accessToken: TokenInfo;
  roles: string[];
  permissions: string[];
}
```

### Route Configuration

```typescript
// Add to app.routes.ts

{
  path: 'profile',
  children: [
    {
      path: 'overview',
      component: ProfileOverviewComponent,
      canActivate: [employeeGuard], // Require authentication
    },
    {
      path: 'settings',
      component: ProfileSettingsComponent,
      canActivate: [employeeGuard],
    },
    {
      path: '',
      redirectTo: 'overview',
      pathMatch: 'full',
    },
  ],
}
```

## Implementation Details

### Phase 1: Profile Models (1 hour)

**File**: `src/app/models/profile.model.ts`

```typescript
export interface UserProfile {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  preferred_username?: string;
  role?: string | string[];
  given_name?: string;
  family_name?: string;
  [key: string]: any;
}

export interface TokenClaims {
  iss?: string;           // Issuer
  sub?: string;           // Subject
  aud?: string | string[]; // Audience
  exp?: number;           // Expiration (Unix timestamp)
  nbf?: number;           // Not before
  iat?: number;           // Issued at
  auth_time?: number;     // Authentication time
  [key: string]: any;     // Custom claims
}

export interface TokenInfo {
  raw: string;
  header: Record<string, any>;
  payload: TokenClaims;
  signature: string;
  issuedAt?: Date;
  expiresAt?: Date;
  expiresIn?: number;     // Seconds until expiration
  isExpired: boolean;
  isValid: boolean;
}

export interface ProfileData {
  isAuthenticated: boolean;
  userInfo: UserProfile | null;
  idToken: TokenInfo | null;
  accessToken: TokenInfo | null;
  roles: string[];
  permissions: string[];
}
```

**Export**: Add to `src/app/models/index.ts`

---

### Phase 2: Token Utility Service (2 hours)

**File**: `src/app/services/token-decoder.service.ts`

Utility service to decode and parse JWT tokens:

```typescript
import { Injectable } from '@angular/core';
import { TokenInfo, TokenClaims } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TokenDecoderService {

  decodeToken(token: string): TokenInfo | null {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const header = this.decodeBase64Url(parts[0]);
      const payload = this.decodeBase64Url(parts[1]);
      const signature = parts[2];

      const claims: TokenClaims = JSON.parse(payload);

      const issuedAt = claims.iat ? new Date(claims.iat * 1000) : undefined;
      const expiresAt = claims.exp ? new Date(claims.exp * 1000) : undefined;
      const now = new Date();
      const isExpired = expiresAt ? expiresAt < now : false;
      const expiresIn = expiresAt ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000) : undefined;

      return {
        raw: token,
        header: JSON.parse(header),
        payload: claims,
        signature,
        issuedAt,
        expiresAt,
        expiresIn,
        isExpired,
        isValid: !isExpired,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  private decodeBase64Url(str: string): string {
    // Convert Base64URL to Base64
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');

    // Pad with '=' to make length multiple of 4
    while (base64.length % 4 !== 0) {
      base64 += '=';
    }

    // Decode Base64
    return atob(base64);
  }

  formatTokenForDisplay(token: string, maxLength: number = 50): string {
    if (!token || token.length <= maxLength) {
      return token;
    }
    const start = token.substring(0, maxLength / 2);
    const end = token.substring(token.length - maxLength / 2);
    return `${start}...${end}`;
  }

  getExpirationStatus(tokenInfo: TokenInfo | null): string {
    if (!tokenInfo || !tokenInfo.expiresAt) {
      return 'Unknown';
    }

    if (tokenInfo.isExpired) {
      return 'Expired';
    }

    const expiresIn = tokenInfo.expiresIn || 0;
    const hours = Math.floor(expiresIn / 3600);
    const minutes = Math.floor((expiresIn % 3600) / 60);

    if (hours > 24) {
      return `Expires in ${Math.floor(hours / 24)} days`;
    } else if (hours > 0) {
      return `Expires in ${hours}h ${minutes}m`;
    } else {
      return `Expires in ${minutes}m`;
    }
  }
}
```

**Export**: Add to `src/app/services/api/index.ts`

---

### Phase 3: Profile Overview Component (4 hours)

**File**: `src/app/routes/profile/profile-overview.component.ts`

```typescript
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
import { Subscription } from 'rxjs';
import { PageHeader } from '@shared';
import { OidcAuthService } from '../../core/authentication/oidc-auth.service';
import { TokenDecoderService } from '../../services/token-decoder.service';
import { ProfileData, TokenInfo, UserProfile } from '../../models';

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
    PageHeader,
  ],
})
export class ProfileOverviewComponent implements OnInit, OnDestroy {
  private authService = inject(OidcAuthService);
  private tokenDecoder = inject(TokenDecoderService);
  private snackBar = inject(MatSnackBar);
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

    if (!isAuthenticated) {
      this.profileData = null;
      return;
    }

    const userInfo = this.authService.getUserInfo();
    const accessToken = this.authService.getAccessToken();
    const idToken = this.getIdToken(); // Get from OAuthService
    const roles = this.authService.getUserRoles();

    this.profileData = {
      isAuthenticated,
      userInfo,
      idToken: idToken ? this.tokenDecoder.decodeToken(idToken) : null,
      accessToken: accessToken ? this.tokenDecoder.decodeToken(accessToken) : null,
      roles,
      permissions: this.getUserPermissions(),
    };
  }

  private getIdToken(): string {
    // Access ID token from OAuthService
    const claims = this.authService.getUserInfo();
    // For now, we'll use the access token as fallback
    // In production, you'd get the actual ID token from the OAuthService
    return this.authService.getAccessToken();
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
    navigator.clipboard.writeText(text).then(() => {
      this.showMessage(`${label} copied to clipboard`);
    }).catch(err => {
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
}
```

---

### Phase 4: Profile Overview Template (3 hours)

**File**: `src/app/routes/profile/profile-overview.component.html`

```html
<page-header>
  <ng-container *ngIf="profileData?.userInfo as user">
    <mat-icon>account_circle</mat-icon>
    {{ user.name || user.preferred_username || 'User Profile' }}
  </ng-container>
  <ng-container *ngIf="!profileData?.isAuthenticated">
    <mat-icon>account_circle</mat-icon>
    User Profile
  </ng-container>
</page-header>

<!-- Not Authenticated State -->
<div *ngIf="!profileData?.isAuthenticated" class="not-authenticated">
  <mat-card>
    <mat-card-content>
      <div class="empty-state">
        <mat-icon>lock</mat-icon>
        <h2>Not Authenticated</h2>
        <p>Please log in to view your profile information.</p>
        <button mat-raised-button color="primary" routerLink="/login">
          <mat-icon>login</mat-icon>
          Log In
        </button>
      </div>
    </mat-card-content>
  </mat-card>
</div>

<!-- Authenticated Profile -->
<div *ngIf="profileData?.isAuthenticated" class="profile-container">

  <!-- User Information Card -->
  <mat-card class="profile-card">
    <mat-card-header>
      <mat-icon mat-card-avatar>person</mat-icon>
      <mat-card-title>User Information</mat-card-title>
      <mat-card-subtitle>Your profile details from ID token</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <div class="info-grid" *ngIf="profileData.userInfo as user">
        <div class="info-item">
          <label>User ID (sub)</label>
          <div class="value">{{ user.sub }}</div>
        </div>

        <div class="info-item">
          <label>Display Name</label>
          <div class="value">{{ user.name || 'N/A' }}</div>
        </div>

        <div class="info-item">
          <label>Email</label>
          <div class="value">{{ user.email || 'N/A' }}</div>
        </div>

        <div class="info-item">
          <label>Username</label>
          <div class="value">{{ user.preferred_username || 'N/A' }}</div>
        </div>

        <div class="info-item full-width">
          <label>Roles</label>
          <div class="value">
            <mat-chip-set>
              <mat-chip *ngFor="let role of profileData.roles" [color]="'primary'" highlighted>
                {{ role }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>

        <div class="info-item full-width">
          <label>Permissions</label>
          <div class="value">
            <mat-chip-set>
              <mat-chip *ngFor="let permission of profileData.permissions" [color]="'accent'">
                {{ permission }}
              </mat-chip>
            </mat-chip-set>
          </div>
        </div>
      </div>
    </mat-card-content>
  </mat-card>

  <!-- Tokens Card -->
  <mat-card class="tokens-card">
    <mat-card-header>
      <mat-icon mat-card-avatar>vpn_key</mat-icon>
      <mat-card-title>Authentication Tokens</mat-card-title>
      <mat-card-subtitle>JWT tokens for API access and identity</mat-card-subtitle>
    </mat-card-header>

    <mat-card-content>
      <mat-tab-group>

        <!-- ID Token Tab -->
        <mat-tab label="ID Token">
          <div class="token-content" *ngIf="profileData.idToken as token">

            <!-- Token Status -->
            <div class="token-status">
              <mat-chip-set>
                <mat-chip [color]="getExpirationColor(token)" highlighted>
                  <mat-icon>schedule</mat-icon>
                  {{ getExpirationStatus(token) }}
                </mat-chip>
                <mat-chip *ngIf="!token.isExpired" color="primary">
                  <mat-icon>verified_user</mat-icon>
                  Valid
                </mat-chip>
                <mat-chip *ngIf="token.isExpired" color="warn">
                  <mat-icon>error</mat-icon>
                  Expired
                </mat-chip>
              </mat-chip-set>
            </div>

            <!-- Token Metadata -->
            <div class="token-metadata">
              <div class="metadata-item">
                <label>Issued At</label>
                <div>{{ formatDate(token.issuedAt) }}</div>
              </div>
              <div class="metadata-item">
                <label>Expires At</label>
                <div>{{ formatDate(token.expiresAt) }}</div>
              </div>
              <div class="metadata-item" *ngIf="token.payload.iss">
                <label>Issuer</label>
                <div>{{ token.payload.iss }}</div>
              </div>
            </div>

            <!-- Token Actions -->
            <div class="token-actions">
              <button mat-button (click)="toggleRawIdToken()">
                <mat-icon>{{ showRawIdToken ? 'visibility_off' : 'visibility' }}</mat-icon>
                {{ showRawIdToken ? 'Hide' : 'Show' }} Raw Token
              </button>
              <button mat-button (click)="copyToClipboard(token.raw, 'ID Token')">
                <mat-icon>content_copy</mat-icon>
                Copy Token
              </button>
            </div>

            <!-- Raw Token Display -->
            <mat-expansion-panel *ngIf="showRawIdToken" expanded>
              <mat-expansion-panel-header>
                <mat-panel-title>Raw JWT Token</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="token-display">{{ token.raw }}</pre>
            </mat-expansion-panel>

            <!-- Token Claims -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Token Header</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="json-display">{{ formatJson(token.header) }}</pre>
            </mat-expansion-panel>

            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Token Claims (Payload)</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="json-display">{{ formatJson(token.payload) }}</pre>
            </mat-expansion-panel>
          </div>

          <div *ngIf="!profileData.idToken" class="no-token">
            <mat-icon>info</mat-icon>
            <p>ID Token not available</p>
          </div>
        </mat-tab>

        <!-- Access Token Tab -->
        <mat-tab label="Access Token">
          <div class="token-content" *ngIf="profileData.accessToken as token">

            <!-- Token Status -->
            <div class="token-status">
              <mat-chip-set>
                <mat-chip [color]="getExpirationColor(token)" highlighted>
                  <mat-icon>schedule</mat-icon>
                  {{ getExpirationStatus(token) }}
                </mat-chip>
                <mat-chip *ngIf="!token.isExpired" color="primary">
                  <mat-icon>verified_user</mat-icon>
                  Valid
                </mat-chip>
                <mat-chip *ngIf="token.isExpired" color="warn">
                  <mat-icon>error</mat-icon>
                  Expired
                </mat-chip>
              </mat-chip-set>
            </div>

            <!-- Token Metadata -->
            <div class="token-metadata">
              <div class="metadata-item">
                <label>Issued At</label>
                <div>{{ formatDate(token.issuedAt) }}</div>
              </div>
              <div class="metadata-item">
                <label>Expires At</label>
                <div>{{ formatDate(token.expiresAt) }}</div>
              </div>
              <div class="metadata-item" *ngIf="token.payload.aud">
                <label>Audience</label>
                <div>{{ token.payload.aud }}</div>
              </div>
            </div>

            <!-- Token Actions -->
            <div class="token-actions">
              <button mat-button (click)="toggleRawAccessToken()">
                <mat-icon>{{ showRawAccessToken ? 'visibility_off' : 'visibility' }}</mat-icon>
                {{ showRawAccessToken ? 'Hide' : 'Show' }} Raw Token
              </button>
              <button mat-button (click)="copyToClipboard(token.raw, 'Access Token')">
                <mat-icon>content_copy</mat-icon>
                Copy Token
              </button>
            </div>

            <!-- Raw Token Display -->
            <mat-expansion-panel *ngIf="showRawAccessToken" expanded>
              <mat-expansion-panel-header>
                <mat-panel-title>Raw JWT Token</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="token-display">{{ token.raw }}</pre>
            </mat-expansion-panel>

            <!-- Token Claims -->
            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Token Header</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="json-display">{{ formatJson(token.header) }}</pre>
            </mat-expansion-panel>

            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Token Claims (Payload)</mat-panel-title>
              </mat-expansion-panel-header>
              <pre class="json-display">{{ formatJson(token.payload) }}</pre>
            </mat-expansion-panel>

            <mat-expansion-panel>
              <mat-expansion-panel-header>
                <mat-panel-title>Scopes</mat-panel-title>
              </mat-expansion-panel-header>
              <div class="scopes-list">
                <mat-chip-set>
                  <mat-chip *ngFor="let scope of token.payload.scope?.split(' ') || []">
                    {{ scope }}
                  </mat-chip>
                </mat-chip-set>
              </div>
            </mat-expansion-panel>
          </div>

          <div *ngIf="!profileData.accessToken" class="no-token">
            <mat-icon>info</mat-icon>
            <p>Access Token not available</p>
          </div>
        </mat-tab>

      </mat-tab-group>
    </mat-card-content>
  </mat-card>

</div>
```

---

### Phase 5: Profile Styling (2 hours)

**File**: `src/app/routes/profile/profile-overview.component.scss`

```scss
.profile-container {
  padding: 16px;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.not-authenticated {
  padding: 16px;
  max-width: 600px;
  margin: 0 auto;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;

    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.38);
      margin-bottom: 16px;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 500;
    }

    p {
      margin: 0 0 24px;
      color: rgba(0, 0, 0, 0.6);
    }

    button {
      mat-icon {
        font-size: 20px;
        width: 20px;
        height: 20px;
        margin-right: 8px;
        color: inherit;
      }
    }
  }
}

.profile-card,
.tokens-card {
  mat-card-header {
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.12);

    mat-card-title {
      font-size: 20px;
      font-weight: 500;
      margin: 0;
    }

    mat-card-subtitle {
      margin-top: 4px;
      color: rgba(0, 0, 0, 0.6);
    }
  }

  mat-card-content {
    padding: 24px;
  }
}

// User Information Grid
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }

  .info-item {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &.full-width {
      grid-column: 1 / -1;
    }

    label {
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: rgba(0, 0, 0, 0.6);
    }

    .value {
      font-size: 16px;
      color: rgba(0, 0, 0, 0.87);
      word-break: break-word;
    }
  }
}

// Token Content
.token-content {
  padding: 24px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .token-status {
    mat-chip-set {
      mat-chip {
        mat-icon {
          margin-right: 4px;
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    }
  }

  .token-metadata {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: 4px;

    .metadata-item {
      label {
        display: block;
        font-size: 12px;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 4px;
      }

      div {
        font-size: 14px;
        color: rgba(0, 0, 0, 0.87);
        word-break: break-word;
      }
    }
  }

  .token-actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;

    button {
      mat-icon {
        margin-right: 4px;
      }
    }
  }

  mat-expansion-panel {
    margin-top: 8px;
  }

  .token-display,
  .json-display {
    background-color: #f5f5f5;
    padding: 16px;
    border-radius: 4px;
    overflow-x: auto;
    font-family: 'Courier New', monospace;
    font-size: 12px;
    line-height: 1.5;
    margin: 0;
    white-space: pre-wrap;
    word-break: break-all;
  }

  .scopes-list {
    padding: 16px;

    mat-chip-set {
      mat-chip {
        margin: 4px;
      }
    }
  }
}

.no-token {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  text-align: center;
  color: rgba(0, 0, 0, 0.38);

  mat-icon {
    font-size: 48px;
    width: 48px;
    height: 48px;
    margin-bottom: 12px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
}

// Chip customization
mat-chip-set {
  mat-chip {
    margin: 4px;
  }
}

// Responsive adjustments
@media (max-width: 768px) {
  .profile-container {
    padding: 12px;
  }

  .profile-card,
  .tokens-card {
    mat-card-content {
      padding: 16px;
    }
  }

  .token-content {
    padding: 16px 0;

    .token-metadata {
      grid-template-columns: 1fr;
    }
  }
}
```

---

### Phase 6: Profile Settings Component (1 hour)

**File**: `src/app/routes/profile/profile-settings.component.ts`

```typescript
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { PageHeader } from '@shared';

@Component({
  selector: 'app-profile-settings',
  standalone: true,
  templateUrl: './profile-settings.component.html',
  styleUrl: './profile-settings.component.scss',
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    PageHeader,
  ],
})
export class ProfileSettingsComponent {
  // Future: User settings functionality
}
```

**File**: `src/app/routes/profile/profile-settings.component.html`

```html
<page-header>
  <mat-icon>settings</mat-icon>
  Profile Settings
</page-header>

<div class="settings-container">
  <mat-card>
    <mat-card-content>
      <div class="coming-soon">
        <mat-icon>construction</mat-icon>
        <h2>Coming Soon</h2>
        <p>User settings functionality will be available in a future update.</p>
      </div>
    </mat-card-content>
  </mat-card>
</div>
```

**File**: `src/app/routes/profile/profile-settings.component.scss`

```scss
.settings-container {
  padding: 16px;
  max-width: 800px;
  margin: 0 auto;

  .coming-soon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 48px 16px;
    text-align: center;

    mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: rgba(0, 0, 0, 0.38);
      margin-bottom: 16px;
    }

    h2 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 500;
    }

    p {
      margin: 0;
      color: rgba(0, 0, 0, 0.6);
    }
  }
}
```

---

### Phase 7: Route Configuration (30 minutes)

**File**: `src/app/app.routes.ts`

Add profile routes to the routes array:

```typescript
import { ProfileOverviewComponent } from './routes/profile/profile-overview.component';
import { ProfileSettingsComponent } from './routes/profile/profile-settings.component';

// Add to routes array:
{
  path: 'profile',
  children: [
    {
      path: 'overview',
      component: ProfileOverviewComponent,
      canActivate: [employeeGuard],
    },
    {
      path: 'settings',
      component: ProfileSettingsComponent,
      canActivate: [employeeGuard],
    },
    {
      path: '',
      redirectTo: 'overview',
      pathMatch: 'full',
    },
  ],
},
```

---

### Phase 8: Update Models Index (5 minutes)

**File**: `src/app/models/index.ts`

```typescript
export * from './profile.model';
```

---

### Phase 9: Update Services Index (5 minutes)

**File**: `src/app/services/api/index.ts`

```typescript
export * from './token-decoder.service';
```

---

## Testing Plan

### Unit Tests

1. **TokenDecoderService Tests**
   - Decode valid JWT tokens
   - Handle malformed tokens
   - Calculate expiration correctly
   - Format tokens for display

2. **ProfileOverviewComponent Tests**
   - Load profile data on init
   - React to authentication state changes
   - Copy token to clipboard
   - Toggle raw token display

### Integration Tests

1. Navigate to `/profile/overview`
2. Verify user info displays correctly
3. Verify tokens are decoded and displayed
4. Test copy to clipboard functionality
5. Test token expiration status
6. Test authentication guard

### Manual Testing Checklist

- [ ] Login and navigate to profile overview
- [ ] Verify user name, email, sub displayed
- [ ] Verify roles chips displayed correctly
- [ ] Verify permissions chips displayed
- [ ] Check ID token tab displays token info
- [ ] Check Access token tab displays token info
- [ ] Verify token expiration status shown
- [ ] Test "Show Raw Token" button
- [ ] Test "Copy Token" button
- [ ] Verify JSON formatting in expansions
- [ ] Test on mobile (responsive layout)
- [ ] Logout and verify profile redirects or shows login message

---

## Security Considerations

### ⚠️ Token Display Security

1. **Development Only**: This feature displays sensitive JWT tokens
   - Consider environment flag to disable in production
   - Add warning banner about sensitive information

2. **Copy to Clipboard**: Warn users about token sensitivity
   - Add confirmation dialog before copying
   - Add auto-expiration notice

3. **Browser History**: Tokens displayed in DOM
   - Don't log tokens to console
   - Clear sensitive data on component destroy

### Implementation Recommendation

Add to component:

```typescript
// Add warning banner in template
<mat-card class="security-warning" *ngIf="profileData?.isAuthenticated">
  <mat-card-content>
    <mat-icon>warning</mat-icon>
    <strong>Security Notice:</strong>
    Tokens displayed on this page contain sensitive information.
    Do not share these tokens with anyone or paste them in untrusted applications.
  </mat-card-content>
</mat-card>
```

---

## Timeline & Effort

| Phase | Task | Estimated Time |
|-------|------|----------------|
| 1 | Profile models | 1 hour |
| 2 | Token decoder service | 2 hours |
| 3 | Profile overview component | 4 hours |
| 4 | Profile overview template | 3 hours |
| 5 | Profile styling | 2 hours |
| 6 | Profile settings component | 1 hour |
| 7 | Route configuration | 30 minutes |
| 8 | Models index update | 5 minutes |
| 9 | Services index update | 5 minutes |
| 10 | Testing | 2 hours |
| **Total** | | **~16 hours** |

---

## Future Enhancements

1. **Profile Settings Page**
   - Theme preferences
   - Language selection
   - Notification settings
   - Default dashboard views

2. **Token Refresh**
   - Display refresh token info
   - Manual refresh button
   - Auto-refresh indicator

3. **Session Management**
   - View active sessions
   - Revoke tokens
   - Session history

4. **User Preferences**
   - Save user preferences to API
   - Sync across devices

5. **Avatar Upload**
   - Profile picture upload
   - Avatar management

---

## Dependencies

### NPM Packages
- ✅ @angular/material (already installed)
- ✅ @angular/cdk (already installed)
- ✅ rxjs (already installed)

### No New Dependencies Required

---

## Files to Create/Modify

### New Files (9)
1. `src/app/models/profile.model.ts`
2. `src/app/services/token-decoder.service.ts`
3. `src/app/routes/profile/profile-overview.component.ts`
4. `src/app/routes/profile/profile-overview.component.html`
5. `src/app/routes/profile/profile-overview.component.scss`
6. `src/app/routes/profile/profile-settings.component.ts`
7. `src/app/routes/profile/profile-settings.component.html`
8. `src/app/routes/profile/profile-settings.component.scss`

### Modified Files (3)
1. `src/app/app.routes.ts` - Add profile routes
2. `src/app/models/index.ts` - Export profile model
3. `src/app/services/api/index.ts` - Export token decoder service

---

## Success Criteria

✅ User can navigate to `/profile/overview` from user menu
✅ Profile page displays user information (name, email, sub)
✅ Profile page displays user roles and permissions
✅ ID token is decoded and displayed with claims
✅ Access token is decoded and displayed with claims
✅ Token expiration status is shown
✅ Users can copy tokens to clipboard
✅ Users can toggle raw token display
✅ Page is responsive on mobile devices
✅ Authentication guard prevents unauthorized access
✅ Component reacts to login/logout events

---

## Implementation Notes

1. **User Menu Already Configured**: The user-button component already has links to `/profile/overview` and `/profile/settings`, so no menu changes needed

2. **Translation Keys Ready**: i18n keys for profile menu already exist in `en-US.json`

3. **Authentication Service Ready**: `OidcAuthService` already provides all needed methods for token access

4. **Role Guard Available**: Use `employeeGuard` to require authentication for profile pages

5. **Reactive Pattern**: Follow existing pattern with `isAuthenticated$` subscription for auth state changes

6. **Material Design**: Use existing Material Design components for consistency

7. **Token Decoder**: Implement Base64URL decoding for JWT tokens (standard format)

---

## References

- OIDC Specification: https://openid.net/specs/openid-connect-core-1_0.html
- JWT Specification: https://datatracker.ietf.org/doc/html/rfc7519
- Angular OAuth2 OIDC: https://github.com/manfredsteyer/angular-oauth2-oidc
- Material Design: https://material.angular.io/

---

**Document Version**: 1.0
**Last Updated**: 2026-01-20
**Author**: Claude Code Agent
