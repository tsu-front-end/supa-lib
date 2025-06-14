/**
 * @fileoverview Basic CRUD operations service
 * @category CRUD Operations
 */

import {SupabaseClient} from "@supabase/supabase-js";
import type {Result} from "../types/result";
import {createSuccess, createFailure} from "../types/result";

/**
 * CRUD service handling basic database operations
 */
export class CrudService {
  private supabase: SupabaseClient;

  /**
   * Initialize the CRUD service
   * @param supabaseClient - Configured Supabase client
   */
  constructor(supabaseClient: SupabaseClient) {
    this.supabase = supabaseClient;
  }

  /**
   * Create a new record in the specified table
   * @param table - Table name
   * @param data - Data to insert
   * @returns Promise resolving to Result with created record
   */
  async create(table: string, data: Record<string, any>): Promise<Result<any>> {
    try {
      const {data: result, error} = await this.supabase.from(table).insert(data).select().single();

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
  async read(table: string, id: string): Promise<Result<any | null>> {
    try {
      const {data, error} = await this.supabase.from(table).select("*").eq("id", id).single();

      if (error) {
        // Handle "not found" as success with null
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
  async update(table: string, id: string, data: Record<string, any>): Promise<Result<any>> {
    try {
      const {data: result, error} = await this.supabase.from(table).update(data).eq("id", id).select().single();

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
  async delete(table: string, id: string): Promise<Result<void>> {
    try {
      const {error} = await this.supabase.from(table).delete().eq("id", id);

      if (error) {
        return createFailure(new Error(error.message));
      }

      return createSuccess(undefined);
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
  async list(table: string, filters?: Record<string, any>): Promise<Result<any[]>> {
    try {
      let query = this.supabase.from(table).select("*");

      // Apply basic filters if provided
      if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
          query = query.eq(key, value);
        });
      }

      const {data, error} = await query;

      if (error) {
        return createFailure(new Error(error.message));
      }

      return createSuccess(data || []);
    } catch (error) {
      return createFailure(error instanceof Error ? error : new Error("List operation failed"));
    }
  }
}
