export interface PaginatedResponse<T> {
    data: T[];
    meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: { code: string; message: string; details?: unknown };
}
