/**
 * @fileoverview User profile management service
 * @category Profile Management
 */

import type {SupabaseClient} from "@supabase/supabase-js";
import type {User, UserProfileUpdate} from "../types/user";
import type {Result} from "../types/result";
import {createSuccess, createFailure} from "../types/result";

/**
 * User service handling profile management operations
 */
export class UserService {
  private supabase: SupabaseClient;

  /**
   * Initialize the user service
   * @param supabaseClient - Configured Supabase client
   */
  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Update the current user's profile information
   * @param updates - Profile fields to update
   * @returns Promise resolving to Result with updated user
   */
  async updateProfile(updates: UserProfileUpdate): Promise<Result<User>> {
    try {
      // Get current user first
      const {
        data: {user},
        error: getUserError,
      } = await this.supabase.auth.getUser();

      if (getUserError) {
        return createFailure(new Error(getUserError.message));
      }

      if (!user) {
        return createFailure(new Error("No authenticated user found"));
      }

      // Update user metadata
      const {data, error} = await this.supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updates,
        },
      });

      if (error) {
        return createFailure(new Error(error.message));
      }

      if (!data.user) {
        return createFailure(new Error("Profile update failed"));
      }

      const updatedUser = this.mapSupabaseUserToUser(data.user);
      return createSuccess(updatedUser);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Profile update failed"));
    }
  }

  /**
   * Get the current authenticated user with fresh data
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
}
