import { createClient } from "@supabase/supabase-js";
function createSuccess(data) {
  return {
    success: true,
    data
  };
}
function createFailure(error) {
  return {
    success: false,
    error
  };
}
function isSuccess(result) {
  return result.success === true;
}
function isFailure(result) {
  return result.success === false;
}
class AuthService {
  /**
   * Initialize the authentication service
   * @param config - Supabase configuration
   */
  constructor(config) {
    this.supabase = createClient(config.url, config.anonKey);
  }
  /**
   * Sign up a new user with email and password
   * @param email - User's email address
   * @param password - User's password
   * @param profile - Optional profile data to set during signup
   * @returns Promise resolving to Result with user and verification status
   */
  async signUp(email, password, profile) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: profile || {}
        }
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
        needsVerification
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
  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
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
        session
      });
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Sign in failed"));
    }
  }
  /**
   * Sign out the current user
   * @returns Promise resolving to Result indicating success or failure
   */
  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(void 0);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Sign out failed"));
    }
  }
  /**
   * Get the current authenticated user
   * @returns Promise resolving to Result with current user or null
   */
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error
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
  async getCurrentSession() {
    try {
      const {
        data: { session },
        error
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
  async resendVerificationEmail() {
    try {
      const {
        data: { user }
      } = await this.supabase.auth.getUser();
      if (!user) {
        return createFailure(new Error("No authenticated user found"));
      }
      const { error } = await this.supabase.auth.resend({
        type: "signup",
        email: user.email
      });
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(void 0);
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
  mapSupabaseUserToUser(supabaseUser) {
    var _a, _b, _c, _d, _e, _f;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: ((_a = supabaseUser.user_metadata) == null ? void 0 : _a.firstName) || ((_b = supabaseUser.user_metadata) == null ? void 0 : _b.first_name),
      lastName: ((_c = supabaseUser.user_metadata) == null ? void 0 : _c.lastName) || ((_d = supabaseUser.user_metadata) == null ? void 0 : _d.last_name),
      avatar: ((_e = supabaseUser.user_metadata) == null ? void 0 : _e.avatar) || ((_f = supabaseUser.user_metadata) == null ? void 0 : _f.avatar_url),
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at
    };
  }
  /**
   * Map Supabase session to our AuthSession interface
   * @param supabaseSession - Supabase session object
   * @param user - Mapped user object
   * @returns Mapped AuthSession object
   */
  mapSupabaseSessionToAuthSession(supabaseSession, user) {
    return {
      user,
      accessToken: supabaseSession.access_token,
      refreshToken: supabaseSession.refresh_token,
      expiresAt: supabaseSession.expires_at
    };
  }
}
class UserService {
  /**
   * Initialize the user service
   * @param supabaseClient - Configured Supabase client
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }
  /**
   * Update the current user's profile information
   * @param updates - Profile fields to update
   * @returns Promise resolving to Result with updated user
   */
  async updateProfile(updates) {
    try {
      const {
        data: { user },
        error: getUserError
      } = await this.supabase.auth.getUser();
      if (getUserError) {
        return createFailure(new Error(getUserError.message));
      }
      if (!user) {
        return createFailure(new Error("No authenticated user found"));
      }
      const { data, error } = await this.supabase.auth.updateUser({
        data: {
          ...user.user_metadata,
          ...updates
        }
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
  async getCurrentUser() {
    try {
      const {
        data: { user },
        error
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
  mapSupabaseUserToUser(supabaseUser) {
    var _a, _b, _c, _d, _e, _f;
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      firstName: ((_a = supabaseUser.user_metadata) == null ? void 0 : _a.firstName) || ((_b = supabaseUser.user_metadata) == null ? void 0 : _b.first_name),
      lastName: ((_c = supabaseUser.user_metadata) == null ? void 0 : _c.lastName) || ((_d = supabaseUser.user_metadata) == null ? void 0 : _d.last_name),
      avatar: ((_e = supabaseUser.user_metadata) == null ? void 0 : _e.avatar) || ((_f = supabaseUser.user_metadata) == null ? void 0 : _f.avatar_url),
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: supabaseUser.created_at,
      updatedAt: supabaseUser.updated_at
    };
  }
}
class CrudService {
  /**
   * Initialize the CRUD service
   * @param supabaseClient - Configured Supabase client
   */
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }
  /**
   * Create a new record in the specified table
   * @param table - Table name
   * @param data - Data to insert
   * @returns Promise resolving to Result with created record
   */
  async create(table, data) {
    try {
      const { data: result, error } = await this.supabase.from(table).insert(data).select().single();
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(result);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Create operation failed"));
    }
  }
  /**
   * Read a record by ID from the specified table
   * @param table - Table name
   * @param id - Record ID
   * @returns Promise resolving to Result with record or null
   */
  async read(table, id) {
    try {
      const { data, error } = await this.supabase.from(table).select("*").eq("id", id).single();
      if (error) {
        if (error.code === "PGRST116") {
          return createSuccess(null);
        }
        return createFailure(new Error(error.message));
      }
      return createSuccess(data);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Read operation failed"));
    }
  }
  /**
   * Update a record by ID in the specified table
   * @param table - Table name
   * @param id - Record ID
   * @param data - Data to update
   * @returns Promise resolving to Result with updated record
   */
  async update(table, id, data) {
    try {
      const { data: result, error } = await this.supabase.from(table).update(data).eq("id", id).select().single();
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(result);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Update operation failed"));
    }
  }
  /**
   * Delete a record by ID from the specified table
   * @param table - Table name
   * @param id - Record ID
   * @returns Promise resolving to Result indicating success or failure
   */
  async delete(table, id) {
    try {
      const { error } = await this.supabase.from(table).delete().eq("id", id);
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(void 0);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("Delete operation failed"));
    }
  }
  /**
   * List records from the specified table with optional basic filtering
   * @param table - Table name
   * @param filters - Optional filters to apply
   * @returns Promise resolving to Result with array of records
   */
  async list(table, filters) {
    try {
      let query = this.supabase.from(table).select("*");
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }
      const { data, error } = await query;
      if (error) {
        return createFailure(new Error(error.message));
      }
      return createSuccess(data || []);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("List operation failed"));
    }
  }
}
class ServiceManager {
  /**
   * Initialize the ServiceManager with Supabase configuration
   * @param config - ServiceManager configuration containing Supabase settings
   */
  constructor(config) {
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
  async signUp(email, password, profile) {
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
  async signIn(email, password) {
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
  async signOut() {
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
  async resendVerificationEmail() {
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
  async updateProfile(updates) {
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
  async getCurrentUser() {
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
  async getCurrentSession() {
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
  async create(table, data) {
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
  async read(table, id) {
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
  async update(table, id, data) {
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
  async delete(table, id) {
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
  async list(table, filters) {
    return this.crudService.list(table, filters);
  }
}
const version = "1.0.0";
export {
  AuthService,
  CrudService,
  ServiceManager,
  UserService,
  createFailure,
  createSuccess,
  isFailure,
  isSuccess,
  version
};
//# sourceMappingURL=index.js.map
