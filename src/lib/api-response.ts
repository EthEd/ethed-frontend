import { NextResponse } from 'next/server';

/**
 * Standard API response types for consistent error handling
 */

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * HTTP status codes as constants
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMITED: 429,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error codes for client handling
 */
export const ErrorCode = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  BLOCKCHAIN_ERROR: 'BLOCKCHAIN_ERROR',
  WALLET_ERROR: 'WALLET_ERROR',
} as const;

/**
 * Helper functions to create consistent API responses
 */
export function successResponse<T>(
  data: T,
  message?: string,
  status: number = HttpStatus.OK
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true as const,
      data,
      ...(message && { message }),
    },
    { status }
  );
}

export function errorResponse(
  error: string,
  status: number = HttpStatus.INTERNAL_ERROR,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false as const,
      error,
      ...(code && { code }),
      ...(details && { details }),
    },
    { status }
  );
}

/**
 * Convenience methods for common responses
 */
export const ApiResponses = {
  success: <T>(data: T, message?: string) => 
    successResponse(data, message, HttpStatus.OK),
    
  created: <T>(data: T, message?: string) => 
    successResponse(data, message, HttpStatus.CREATED),
    
  badRequest: (error: string, details?: Record<string, unknown>) =>
    errorResponse(error, HttpStatus.BAD_REQUEST, ErrorCode.VALIDATION_ERROR, details),
    
  unauthorized: (error = 'Unauthorized') =>
    errorResponse(error, HttpStatus.UNAUTHORIZED, ErrorCode.UNAUTHORIZED),
    
  forbidden: (error = 'Forbidden') =>
    errorResponse(error, HttpStatus.FORBIDDEN, ErrorCode.FORBIDDEN),
    
  notFound: (resource = 'Resource') =>
    errorResponse(`${resource} not found`, HttpStatus.NOT_FOUND, ErrorCode.NOT_FOUND),
    
  conflict: (error: string) =>
    errorResponse(error, HttpStatus.CONFLICT, ErrorCode.ALREADY_EXISTS),
    
  rateLimited: (error = 'Rate limit exceeded. Please try again later.') =>
    errorResponse(error, HttpStatus.RATE_LIMITED, ErrorCode.RATE_LIMITED),
    
  internalError: (error = 'Internal server error') =>
    errorResponse(error, HttpStatus.INTERNAL_ERROR, ErrorCode.INTERNAL_ERROR),
    
  serviceUnavailable: (error = 'Service temporarily unavailable') =>
    errorResponse(error, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.SERVICE_UNAVAILABLE),
    
  blockchainError: (error: string, details?: Record<string, unknown>) =>
    errorResponse(error, HttpStatus.SERVICE_UNAVAILABLE, ErrorCode.BLOCKCHAIN_ERROR, details),
};
