/**
 * Problem Details - RFC 7807
 */
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
  [key: string]: any;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  pageNumber?: number;
  pageSize?: number;
  orderBy?: string;
  fields?: string;
}

/**
 * Paginated response
 */
export interface PagedResponse<T> {
  value: T[];
  pageNumber: number;
  pageSize: number;
  recordsFiltered: number;
  recordsTotal: number;
  isSuccess: boolean;
  isFailure: boolean;
  message?: string;
  errors: string[];
  executionTimeMs: number;
}

/**
 * Query parameters for filtering
 */
export interface QueryParams extends PaginationParams {
  [key: string]: any;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailure: boolean;
  message?: string;
  errors: string[];
  executionTimeMs?: number;
}
