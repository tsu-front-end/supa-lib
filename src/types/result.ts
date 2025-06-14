/**
 * @fileoverview Result pattern types for error handling without exceptions
 * @category Types
 */

/**
 * Success result containing data
 */
export interface Success<T> {
  success: true;
  data: T;
}

/**
 * Failure result containing error
 */
export interface Failure<E = Error> {
  success: false;
  error: E;
}

/**
 * Result type that can be either success or failure
 * @template T - Type of success data
 * @template E - Type of error (defaults to Error)
 */
export type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Creates a success result
 * @param data - The success data
 * @returns Success result
 */
export function createSuccess<T>(data: T): Success<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Creates a failure result
 * @param error - The error
 * @returns Failure result
 */
export function createFailure<E = Error>(error: E): Failure<E> {
  return {
    success: false,
    error,
  };
}

/**
 * Type guard to check if result is successful
 * @param result - Result to check
 * @returns True if result is successful
 */
export function isSuccess<T, E>(result: Result<T, E>): result is Success<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is a failure
 * @param result - Result to check
 * @returns True if result is a failure
 */
export function isFailure<T, E>(result: Result<T, E>): result is Failure<E> {
  return result.success === false;
}
