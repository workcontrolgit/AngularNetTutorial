import { Injectable } from '@angular/core';
import { TokenInfo, TokenClaims } from '../models';

/**
 * Service for decoding and parsing JWT tokens
 */
@Injectable({
  providedIn: 'root',
})
export class TokenDecoderService {
  /**
   * Decode a JWT token into its components
   */
  decodeToken(token: string): TokenInfo | null {
    if (!token) {
      return null;
    }

    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.warn('Invalid JWT token format');
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
      const expiresIn = expiresAt
        ? Math.floor((expiresAt.getTime() - now.getTime()) / 1000)
        : undefined;

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

  /**
   * Decode Base64URL encoded string (JWT standard)
   */
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

  /**
   * Format token for display (truncate long tokens)
   */
  formatTokenForDisplay(token: string, maxLength: number = 50): string {
    if (!token || token.length <= maxLength) {
      return token;
    }
    const start = token.substring(0, maxLength / 2);
    const end = token.substring(token.length - maxLength / 2);
    return `${start}...${end}`;
  }

  /**
   * Get human-readable expiration status
   */
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
      const days = Math.floor(hours / 24);
      return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      return `Expires in ${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `Expires in ${minutes}m`;
    } else {
      return 'Expires soon';
    }
  }
}
