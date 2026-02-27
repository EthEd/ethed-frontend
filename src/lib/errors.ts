import { logger } from "@/lib/monitoring";

/**
 * Custom error classes for consistent error handling
 */

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode = 500,
    code = 'INTERNAL_ERROR',
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 400, 'VALIDATION_ERROR');
    if (details) {
      Object.assign(this, { details });
    }
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded. Please try again later.') {
    super(message, 429, 'RATE_LIMITED');
  }
}

export class BlockchainError extends AppError {
  public readonly txHash?: string;
  public readonly contractAddress?: string;

  constructor(
    message: string,
    details?: { txHash?: string; contractAddress?: string }
  ) {
    super(message, 503, 'BLOCKCHAIN_ERROR');
    this.txHash = details?.txHash;
    this.contractAddress = details?.contractAddress;
  }
}

export class WalletError extends AppError {
  constructor(message: string) {
    super(message, 400, 'WALLET_ERROR');
  }
}

export class ExternalServiceError extends AppError {
  public readonly service: string;

  constructor(service: string, message?: string) {
    super(message || `${service} service is unavailable`, 503, 'SERVICE_UNAVAILABLE');
    this.service = service;
  }
}

/**
 * Type guard to check if error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Safely extract error message from any error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  return 'An unexpected error occurred';
}

/**
 * Safely extract error code from any error type
 */
export function getErrorCode(error: unknown): string {
  if (isAppError(error)) {
    return error.code;
  }
  return 'UNKNOWN_ERROR';
}

/**
 * Log error with context (useful for server-side logging)
 */
export function logError(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const errorInfo = {
    message: getErrorMessage(error),
    code: getErrorCode(error),
    stack: error instanceof Error ? error.stack : undefined,
    ...context,
  };

  // In production, this could send to a logging service
  logger.error(errorInfo.message, "ErrorHandler", errorInfo, error);
}

/**
 * Wrap async operations with standardized error handling
 */
export async function tryCatch<T>(
  promise: Promise<T>,
  errorMessage?: string
): Promise<[T, null] | [null, AppError]> {
  try {
    const data = await promise;
    return [data, null];
  } catch (error) {
    if (isAppError(error)) {
      return [null, error];
    }
    return [null, new AppError(errorMessage || getErrorMessage(error))];
  }
}
