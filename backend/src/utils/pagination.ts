export interface PaginationParams {
    page: number;
    limit: number;
}

export interface PaginatedResult<T> {
    data: T[];
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
}

export function parsePagination(query: Record<string, unknown>): PaginationParams {
    const page = Math.max(1, parseInt(String(query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(query.limit || '10'), 10)));
    return { page, limit };
}

export function paginatedResponse<T>(
    data: T[],
    total: number,
    params: PaginationParams
): PaginatedResult<T> {
    return {
        data,
        page: params.page,
        limit: params.limit,
        totalRecords: total,
        totalPages: Math.ceil(total / params.limit),
    };
}
