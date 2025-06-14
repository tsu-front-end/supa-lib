/**
 * @fileoverview Main ServiceManager class integrating all services
 * @category Main
 */

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {AuthService} from "../services/auth.service";
import {UserService} from "../services/user.service";
import {CrudService} from "../services/crud.service";
import type {ServiceManagerConfig, AuthSession, SignUpResult, SignInResult} from "../types/auth";
import type {User, UserProfileUpdate} from "../types/user";
import type {Result} from "../types/result";

/**
 * Main ServiceManager class providing user authentication, profile management, and basic CRUD operations
 *
 * @example
 * ```typescript
 * const serviceManager = new ServiceManager({
 *   supabase: {
 *     url: "your-supabase-url",
 *     anonKey: "your-anon-key",
 *   },
 * });
 *
 * // Sign up a new user
 * const signUpResult = await serviceManager.signUp("user@example.com", "password123");
 * if (signUpResult.success) {
 *   console.log("User created:", signUpResult.data.user);
 * }
 *
 * // Create a database record
 * const createResult = await serviceManager.create("social_links", {
 *   user_id: signUpResult.data.user.id,
 *   platform: "twitter",
 *   url: "https://twitter.com/username"
 * });
 * ```
 */
export class ServiceManager {
  private supabase: SupabaseClient;
  private authService: AuthService;
  private userService: UserService;
  private crudService: CrudService;

  /**
   * Initialize the ServiceManager with Supabase configuration
   * @param config - ServiceManager configuration containing Supabase settings
   */
  constructor(config: ServiceManagerConfig) {
    this.supabase = createClient(config.supabase.url, config.supabase.anonKey);
    this.authService = new AuthService(config.supabase);
    this.userService = new UserService(this.supabase);
    this.crudService = new CrudService(this.supabase);
  }

  // Authentication Methods

  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param profile - Optional profile data to set during signup
   * @returns Promise resolving to Result with user and verification status
   *
   * @example
   * ```typescript
   * const result = await serviceManager.signUp("user@example.com", "password123", {
   *   firstName: "John",
   *   lastName: "Doe"
   * });
   *
   * if (result.success) {
   *   if (result.data.needsVerification) {
   *     console.log("Please check your email for verification");
   *   }
   *   console.log("User created:", result.data.user);
   * } else {
   *   console.error("Sign up failed:", result.error.message);
   * }
   * ```
   */
  async signUp(email: string, password: string, profile?: UserProfileUpdate): Promise<Result<SignUpResult>> {
    return this.authService.signUp(email, password, profile);
  }

  /**
   * Sign in an existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to Result with user and session
   *
   * @example
   * ```typescript
   * const result = await serviceManager.signIn("user@example.com", "password123");
   *
   * if (result.success) {
   *   console.log("Signed in:", result.data.user);
   *   console.log("Session expires at:", new Date(result.data.session.expiresAt));
   * } else {
   *   console.error("Sign in failed:", result.error.message);
   * }
   * ```
   */
  async signIn(email: string, password: string): Promise<Result<SignInResult>> {
    return this.authService.signIn(email, password);
  }

  /**
   * Sign out the current user
   * @returns Promise resolving to Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await serviceManager.signOut();
   *
   * if (result.success) {
   *   console.log("Successfully signed out");
   * } else {
   *   console.error("Sign out failed:", result.error.message);
   * }
   * ```
   */
  async signOut(): Promise<Result<void>> {
    return this.authService.signOut();
  }

  /**
   * Resend email verification for the current user
   * @returns Promise resolving to Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await serviceManager.resendVerificationEmail();
   *
   * if (result.success) {
   *   console.log("Verification email sent");
   * } else {
   *   console.error("Failed to send verification email:", result.error.message);
   * }
   * ```
   */
  async resendVerificationEmail(): Promise<Result<void>> {
    return this.authService.resendVerificationEmail();
  }

  // Profile Management Methods

  /**
   * Update the current user's profile information
   * @param updates - Profile fields to update (firstName, lastName, avatar)
   * @returns Promise resolving to Result with updated user
   *
   * @example
   * ```typescript
   * const result = await serviceManager.updateProfile({
   *   firstName: "John",
   *   lastName: "Doe",
   *   avatar: "https://example.com/avatar.jpg"
   * });
   *
   * if (result.success) {
   *   console.log("Profile updated:", result.data);
   * } else {
   *   console.error("Profile update failed:", result.error.message);
   * }
   * ```
   */
  async updateProfile(updates: UserProfileUpdate): Promise<Result<User>> {
    return this.userService.updateProfile(updates);
  }

  /**
   * Get the current authenticated user
   * @returns Promise resolving to Result with current user or null
   *
   * @example
   * ```typescript
   * const result = await serviceManager.getCurrentUser();
   *
   * if (result.success) {
   *   if (result.data) {
   *     console.log("Current user:", result.data);
   *   } else {
   *     console.log("No user is currently signed in");
   *   }
   * } else {
   *   console.error("Failed to get current user:", result.error.message);
   * }
   * ```
   */
  async getCurrentUser(): Promise<Result<User | null>> {
    return this.userService.getCurrentUser();
  }

  /**
   * Get the current authentication session
   * @returns Promise resolving to Result with current session or null
   *
   * @example
   * ```typescript
   * const result = await serviceManager.getCurrentSession();
   *
   * if (result.success) {
   *   if (result.data) {
   *     console.log("Current session:", result.data);
   *     console.log("Expires at:", new Date(result.data.expiresAt));
   *   } else {
   *     console.log("No active session");
   *   }
   * } else {
   *   console.error("Failed to get current session:", result.error.message);
   * }
   * ```
   */
  async getCurrentSession(): Promise<Result<AuthSession | null>> {
    return this.authService.getCurrentSession();
  }

  // Basic CRUD Operations

  /**
   * Create a new record in the specified table
   * @param table - Table name
   * @param data - Data to insert
   * @returns Promise resolving to Result with created record
   *
   * @example
   * ```typescript
   * const result = await serviceManager.create("social_links", {
   *   user_id: "user-id",
   *   platform: "twitter",
   *   url: "https://twitter.com/username"
   * });
   *
   * if (result.success) {
   *   console.log("Record created:", result.data);
   * } else {
   *   console.error("Create failed:", result.error.message);
   * }
   * ```
   */
  async create(table: string, data: Record<string, any>): Promise<Result<any>> {
    return this.crudService.create(table, data);
  }

  /**
   * Read a record by ID from the specified table
   * @param table - Table name
   * @param id - Record ID
   * @returns Promise resolving to Result with record or null
   *
   * @example
   * ```typescript
   * const result = await serviceManager.read("social_links", "link-id");
   *
   * if (result.success) {
   *   if (result.data) {
   *     console.log("Record found:", result.data);
   *   } else {
   *     console.log("Record not found");
   *   }
   * } else {
   *   console.error("Read failed:", result.error.message);
   * }
   * ```
   */
  async read(table: string, id: string): Promise<Result<any | null>> {
    return this.crudService.read(table, id);
  }

  /**
   * Update a record by ID in the specified table
   * @param table - Table name
   * @param id - Record ID
   * @param data - Data to update
   * @returns Promise resolving to Result with updated record
   *
   * @example
   * ```typescript
   * const result = await serviceManager.update("social_links", "link-id", {
   *   url: "https://twitter.com/newusername"
   * });
   *
   * if (result.success) {
   *   console.log("Record updated:", result.data);
   * } else {
   *   console.error("Update failed:", result.error.message);
   * }
   * ```
   */
  async update(table: string, id: string, data: Record<string, any>): Promise<Result<any>> {
    return this.crudService.update(table, id, data);
  }

  /**
   * Delete a record by ID from the specified table
   * @param table - Table name
   * @param id - Record ID
   * @returns Promise resolving to Result indicating success or failure
   *
   * @example
   * ```typescript
   * const result = await serviceManager.delete("social_links", "link-id");
   *
   * if (result.success) {
   *   console.log("Record deleted successfully");
   * } else {
   *   console.error("Delete failed:", result.error.message);
   * }
   * ```
   */
  async delete(table: string, id: string): Promise<Result<void>> {
    return this.crudService.delete(table, id);
  }

  /**
   * List records from the specified table with optional basic filtering
   * @param table - Table name
   * @param filters - Optional filters to apply (key-value pairs for exact matches)
   * @returns Promise resolving to Result with array of records
   *
   * @example
   * ```typescript
   * // List all records
   * const allResult = await serviceManager.list("social_links");
   *
   * // List with filters
   * const filteredResult = await serviceManager.list("social_links", {
   *   user_id: "user-id",
   *   platform: "twitter"
   * });
   *
   * if (filteredResult.success) {
   *   console.log("Records found:", filteredResult.data);
   * } else {
   *   console.error("List failed:", filteredResult.error.message);
   * }
   * ```
   */
  async list(table: string, filters?: Record<string, any>): Promise<Result<any[]>> {
    return this.crudService.list(table, filters);
  }
}
