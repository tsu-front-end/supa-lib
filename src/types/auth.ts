/**
 * @fileoverview Authentication and configuration type definitions
 * @category Types
 */

import type {User} from "./user";

/**
 * Supabase configuration required for client initialization
 */
export interface SupabaseConfig {
  /** Supabase project URL */
  url: string;
  /** Supabase anonymous key */
  anonKey: string;
}

/**
 * Service Manager configuration
 */
export interface ServiceManagerConfig {
  /** Supabase configuration */
  supabase: SupabaseConfig;
}

/**
 * Authentication session containing user and token information
 */
export interface AuthSession {
  /** Authenticated user */
  user: User;
  /** Access token for API requests */
  accessToken: string;
  /** Refresh token for renewing access */
  refreshToken: string;
  /** Timestamp when the session expires (Unix timestamp) */
  expiresAt: number;
}

/**
 * Result of successful sign up operation
 */
export interface SignUpResult {
  /** The created user */
  user: User;
  /** Whether email verification is required */
  needsVerification: boolean;
}

/**
 * Result of successful sign in operation
 */
export interface SignInResult {
  /** The authenticated user */
  user: User;
  /** The authentication session */
  session: AuthSession;
}
