/**
 * Shapes shared by every backend response.
 *
 * The API wraps all handler results in an envelope (see the backend's
 * ResponseInterceptor), which is why every service reads
 * `response.data.data` rather than `response.data`.
 */
export interface ApiEnvelope<T> {
  success: true;
  timestamp: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  timestamp: string;
  path: string;
  message: string | string[];
}

/** Pagination metadata returned by the list endpoints. */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

/** Minimal user shape embedded in related records. */
export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
  role?: string;
  avatarUrl?: string | null;
}
