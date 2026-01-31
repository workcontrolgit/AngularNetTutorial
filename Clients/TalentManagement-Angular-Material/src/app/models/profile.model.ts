/**
 * User profile models for displaying ID token claims and access tokens
 */

/**
 * User profile information from ID token claims
 */
export interface UserProfile {
  sub: string; // Subject (user ID)
  name?: string; // User display name
  email?: string; // User email
  email_verified?: boolean; // Email verification status
  preferred_username?: string; // Username
  role?: string | string[]; // User roles
  given_name?: string; // First name
  family_name?: string; // Last name
  [key: string]: any; // Additional custom claims
}

/**
 * JWT token claims (payload)
 */
export interface TokenClaims {
  iss?: string; // Issuer
  sub?: string; // Subject
  aud?: string | string[]; // Audience
  exp?: number; // Expiration (Unix timestamp)
  nbf?: number; // Not before
  iat?: number; // Issued at
  auth_time?: number; // Authentication time
  scope?: string; // Scopes (space-separated)
  [key: string]: any; // Custom claims
}

/**
 * Decoded JWT token information
 */
export interface TokenInfo {
  raw: string; // Raw JWT token
  header: Record<string, any>; // JWT header
  payload: TokenClaims; // JWT payload (claims)
  signature: string; // JWT signature
  issuedAt?: Date; // Token issue date
  expiresAt?: Date; // Token expiration date
  expiresIn?: number; // Seconds until expiration
  isExpired: boolean; // Whether token is expired
  isValid: boolean; // Whether token is valid
}

/**
 * Complete profile data including user info and tokens
 */
export interface ProfileData {
  isAuthenticated: boolean; // User authentication status
  userInfo: UserProfile | null; // User information from ID token
  idToken: TokenInfo | null; // Decoded ID token
  accessToken: TokenInfo | null; // Decoded access token
  roles: string[]; // User roles
  permissions: string[]; // User permissions
}
