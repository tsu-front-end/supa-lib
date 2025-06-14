import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Authentication service handling user authentication operations
 */
export declare class AuthService {
    private supabase;
    /**
     * Initialize the authentication service
     * @param config - Supabase configuration
     */
    constructor(config: SupabaseConfig);
    /**
     * Sign up a new user with email and password
     * @param email - User's email address
     * @param password - User's password
     * @param profile - Optional profile data to set during signup
     * @returns Promise resolving to Result with user and verification status
     */
    signUp(email: string, password: string, profile?: UserProfileUpdate): Promise<Result<SignUpResult>>;
    /**
     * Sign in an existing user with email and password
     * @param email - User's email address
     * @param password - User's password
     * @returns Promise resolving to Result with user and session
     */
    signIn(email: string, password: string): Promise<Result<SignInResult>>;
    /**
     * Sign out the current user
     * @returns Promise resolving to Result indicating success or failure
     */
    signOut(): Promise<Result<void>>;
    /**
     * Get the current authenticated user
     * @returns Promise resolving to Result with current user or null
     */
    getCurrentUser(): Promise<Result<User | null>>;
    /**
     * Get the current authentication session
     * @returns Promise resolving to Result with current session or null
     */
    getCurrentSession(): Promise<Result<AuthSession | null>>;
    /**
     * Resend email verification for the current user
     * @returns Promise resolving to Result indicating success or failure
     */
    resendVerificationEmail(): Promise<Result<void>>;
    /**
     * Map Supabase user object to our User interface
     * @param supabaseUser - Supabase user object
     * @returns Mapped User object
     */
    private mapSupabaseUserToUser;
    /**
     * Map Supabase session to our AuthSession interface
     * @param supabaseSession - Supabase session object
     * @param user - Mapped user object
     * @returns Mapped AuthSession object
     */
    private mapSupabaseSessionToAuthSession;
}

/**
 * Authentication session containing user and token information
 */
export declare interface AuthSession {
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
 * Creates a failure result
 * @param error - The error
 * @returns Failure result
 */
export declare function createFailure<E = Error>(error: E): Failure<E>;

/**
 * Creates a success result
 * @param data - The success data
 * @returns Success result
 */
export declare function createSuccess<T>(data: T): Success<T>;

/**
 * CRUD service handling basic database operations
 */
export declare class CrudService {
    private supabase;
    /**
     * Initialize the CRUD service
     * @param supabaseClient - Configured Supabase client
     */
    constructor(supabaseClient: SupabaseClient);
    /**
     * Create a new record in the specified table
     * @param table - Table name
     * @param data - Data to insert
     * @returns Promise resolving to Result with created record
     */
    create(table: string, data: Record<string, any>): Promise<Result<any>>;
    /**
     * Read a record by ID from the specified table
     * @param table - Table name
     * @param id - Record ID
     * @returns Promise resolving to Result with record or null
     */
    read(table: string, id: string): Promise<Result<any | null>>;
    /**
     * Update a record by ID in the specified table
     * @param table - Table name
     * @param id - Record ID
     * @param data - Data to update
     * @returns Promise resolving to Result with updated record
     */
    update(table: string, id: string, data: Record<string, any>): Promise<Result<any>>;
    /**
     * Delete a record by ID from the specified table
     * @param table - Table name
     * @param id - Record ID
     * @returns Promise resolving to Result indicating success or failure
     */
    delete(table: string, id: string): Promise<Result<void>>;
    /**
     * List records from the specified table with optional basic filtering
     * @param table - Table name
     * @param filters - Optional filters to apply
     * @returns Promise resolving to Result with array of records
     */
    list(table: string, filters?: Record<string, any>): Promise<Result<any[]>>;
}

/**
 * Failure result containing error
 */
export declare interface Failure<E = Error> {
    success: false;
    error: E;
}

/**
 * Type guard to check if result is a failure
 * @param result - Result to check
 * @returns True if result is a failure
 */
export declare function isFailure<T, E>(result: Result<T, E>): result is Failure<E>;

/**
 * Type guard to check if result is successful
 * @param result - Result to check
 * @returns True if result is successful
 */
export declare function isSuccess<T, E>(result: Result<T, E>): result is Success<T>;

/**
 * Result type that can be either success or failure
 * @template T - Type of success data
 * @template E - Type of error (defaults to Error)
 */
export declare type Result<T, E = Error> = Success<T> | Failure<E>;

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
export declare class ServiceManager {
    private supabase;
    private authService;
    private userService;
    private crudService;
    /**
     * Initialize the ServiceManager with Supabase configuration
     * @param config - ServiceManager configuration containing Supabase settings
     */
    constructor(config: ServiceManagerConfig);
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
    signUp(email: string, password: string, profile?: UserProfileUpdate): Promise<Result<SignUpResult>>;
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
    signIn(email: string, password: string): Promise<Result<SignInResult>>;
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
    signOut(): Promise<Result<void>>;
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
    resendVerificationEmail(): Promise<Result<void>>;
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
    updateProfile(updates: UserProfileUpdate): Promise<Result<User>>;
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
    getCurrentUser(): Promise<Result<User | null>>;
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
    getCurrentSession(): Promise<Result<AuthSession | null>>;
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
    create(table: string, data: Record<string, any>): Promise<Result<any>>;
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
    read(table: string, id: string): Promise<Result<any | null>>;
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
    update(table: string, id: string, data: Record<string, any>): Promise<Result<any>>;
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
    delete(table: string, id: string): Promise<Result<void>>;
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
    list(table: string, filters?: Record<string, any>): Promise<Result<any[]>>;
}

/**
 * Service Manager configuration
 */
export declare interface ServiceManagerConfig {
    /** Supabase configuration */
    supabase: SupabaseConfig;
}

/**
 * Result of successful sign in operation
 */
export declare interface SignInResult {
    /** The authenticated user */
    user: User;
    /** The authentication session */
    session: AuthSession;
}

/**
 * Result of successful sign up operation
 */
export declare interface SignUpResult {
    /** The created user */
    user: User;
    /** Whether email verification is required */
    needsVerification: boolean;
}

/**
 * @fileoverview Result pattern types for error handling without exceptions
 * @category Types
 */
/**
 * Success result containing data
 */
export declare interface Success<T> {
    success: true;
    data: T;
}

/**
 * Supabase configuration required for client initialization
 */
export declare interface SupabaseConfig {
    /** Supabase project URL */
    url: string;
    /** Supabase anonymous key */
    anonKey: string;
}

/**
 * @fileoverview User-related type definitions
 * @category Types
 */
/**
 * Core user interface representing a user in the system
 */
export declare interface User {
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
export declare type UserProfileUpdate = Partial<Pick<User, "firstName" | "lastName" | "avatar">>;

/**
 * User service handling profile management operations
 */
export declare class UserService {
    private supabase;
    /**
     * Initialize the user service
     * @param supabaseClient - Configured Supabase client
     */
    constructor(supabaseClient: SupabaseClient);
    /**
     * Update the current user's profile information
     * @param updates - Profile fields to update
     * @returns Promise resolving to Result with updated user
     */
    updateProfile(updates: UserProfileUpdate): Promise<Result<User>>;
    /**
     * Get the current authenticated user with fresh data
     * @returns Promise resolving to Result with current user or null
     */
    getCurrentUser(): Promise<Result<User | null>>;
    /**
     * Map Supabase user object to our User interface
     * @param supabaseUser - Supabase user object
     * @returns Mapped User object
     */
    private mapSupabaseUserToUser;
}

/**
 * Data required for user sign in
 */
export declare interface UserSignInData {
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
}

/**
 * Data required for user sign up
 */
export declare interface UserSignUpData {
    /** User's email address */
    email: string;
    /** User's password */
    password: string;
    /** Optional profile data to set during signup */
    profile?: UserProfileUpdate;
}

export declare const version = "1.0.0";

export { }
