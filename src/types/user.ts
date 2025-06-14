/**
 * @fileoverview User-related type definitions
 * @category Types
 */

/**
 * Core user interface representing a user in the system
 */
export interface User {
  /** Unique user identifier */
  id: string;
  /** User's email address */
  email: string;
  /** User's first name (optional) */
  firstName?: string;
  /** User's last name (optional) */
  lastName?: string;
  /** URL to user's avatar image (optional) */
  avatar?: string;
  /** Whether the user's email has been verified */
  emailVerified: boolean;
  /** ISO timestamp when user was created */
  createdAt: string;
  /** ISO timestamp when user was last updated */
  updatedAt: string;
}

/**
 * Type for updating user profile information
 * Only allows updating firstName, lastName, and avatar
 */
export type UserProfileUpdate = Partial<Pick<User, "firstName" | "lastName" | "avatar">>;

/**
 * Data required for user sign up
 */
export interface UserSignUpData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
  /** Optional profile data to set during signup */
  profile?: UserProfileUpdate;
}

/**
 * Data required for user sign in
 */
export interface UserSignInData {
  /** User's email address */
  email: string;
  /** User's password */
  password: string;
}
