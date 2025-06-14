/**
 * @fileoverview Authentication service for user authentication operations
 * @category Authentication
 */

import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import type {SupabaseConfig, AuthSession, SignUpResult, SignInResult} from "../types/auth";
import type {User, UserProfileUpdate} from "../types/user";
import type {Result} from "../types/result";
import {createSuccess, createFailure} from "../types/result";

/**
 * Authentication service handling user authentication operations
 */
export class AuthService {
  private supabase: SupabaseClient;

  /**
   * Initialize the authentication service
   * @param config - Supabase configuration
   */
  constructor(config: SupabaseConfig) {
    this.supabase = createClient(config.url, config.anonKey);
  }

  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param profile - Optional profile data to set during signup
   * @returns Promise resolving to Result with user and verification status
   */
  async signUp(email: string, password: string, profile?: UserProfileUpdate): Promise<Result<SignUpResult>> {
    try {
      const {data, error} = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: profile || {},
        },
      });

      if (error) {
        return createFailure(new Error(error.message));
      }

      if (!data.user) {
        return createFailure(new Error("User creation failed"));
      }

      const user = this.mapSupabaseUserToUser(data.user);
      const needsVerification = !data.user.email_confirmed_at;

      return createSuccess({
        user,
        needsVerification,
      });
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Sign up failed"));
    }
  }

  /**
   * Sign in an existing user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise resolving to Result with user and session
   */
  async signIn(email: string, password: string): Promise<Result<SignInResult>> {
    try {
      const {data, error} = await this.supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return createFailure(new Error(error.message));
      }

      if (!data.user || !data.session) {
        return createFailure(new Error("Sign in failed"));
      }

      const user = this.mapSupabaseUserToUser(data.user);
      const session = this.mapSupabaseSessionToAuthSession(data.session, user);

      return createSuccess({
        user,
        session,
      });
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Sign in failed"));
    }
  }

  /**
   * Sign out the current user
   * @returns Promise resolving to Result indicating success or failure
   */
  async signOut(): Promise<Result<void>> {
    try {
      const {error} = await this.supabase.auth.signOut();

      if (error) {
        return createFailure(new Error(error.message));
      }

      return createSuccess(undefined);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Sign out failed"));
    }
  }

  /**
   * Get the current authenticated user
   * @returns Promise resolving to Result with current user or null
   */
  async getCurrentUser(): Promise<Result<User | null>> {
    try {
      const {
        data: {user},
        error,
      } = await this.supabase.auth.getUser();

      if (error) {
        return createFailure(new Error(error.message));
      }

      if (!user) {
        return createSuccess(null);
      }

      const mappedUser = this.mapSupabaseUserToUser(user);
      return createSuccess(mappedUser);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Failed to get current user"));
    }
  }

  /**
   * Get the current authentication session
   * @returns Promise resolving to Result with current session or null
   */
  async getCurrentSession(): Promise<Result<AuthSession | null>> {
    try {
      const {
        data: {session},
        error,
      } = await this.supabase.auth.getSession();

      if (error) {
        return createFailure(new Error(error.message));
      }

      if (!session) {
        return createSuccess(null);
      }

      const user = this.mapSupabaseUserToUser(session.user);
      const authSession = this.mapSupabaseSessionToAuthSession(session, user);

      return createSuccess(authSession);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Failed to get current session"));
    }
  }

  /**
   * Resend email verification for the current user
   * @returns Promise resolving to Result indicating success or failure
   */
  async resendVerificationEmail(): Promise<Result<void>> {
    try {
      const {
        data: {user},
      } = await this.supabase.auth.getUser();

      if (!user) {
        return createFailure(new Error("No authenticated user found"));
      }

      const {error} = await this.supabase.auth.resend({
        type: "signup",
        email: user.email!,
      });

      if (error) {
        return createFailure(new Error(error.message));
      }

      return createSuccess(undefined);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Failed to resend verification email"));
    }
  }

  // TODO: extract as utility function
  /**
   * Map Supabase user object to our User interface
   * @param supabaseUser - Supabase user object
   * @returns Mapped User object
   */
  private mapSupabaseUserToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: supabaseUser.user_metadata?.firstName || supabaseUser.user_metadata?.first_name,
      lastName: supabaseUser.user_metadata?.lastName || supabaseUser.user_metadata?.last_name,
      avatar: supabaseUser.user_metadata?.avatar || supabaseUser.user_metadata?.avatar_url,
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at,
    };
  }

  /**
   * Map Supabase session to our AuthSession interface
   * @param supabaseSession - Supabase session object
   * @param user - Mapped user object
   * @returns Mapped AuthSession object
   */
  private mapSupabaseSessionToAuthSession(supabaseSession: any, user: User): AuthSession {
    return {
      user,
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: supabaseSession.expires_at,
    };
  }
}
