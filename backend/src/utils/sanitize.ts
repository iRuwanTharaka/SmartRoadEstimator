import xss from 'xss';

/**
 * Recursively sanitize all string values in an object to strip HTML/script tags.
 */
export function sanitize<T>(data: T): T {
    if (typeof data === 'string') {
        return xss(data) as unknown as T;
    }
    if (Array.isArray(data)) {
        return data.map((item) => sanitize(item)) as unknown as T;
    }
    if (data !== null && typeof data === 'object') {
        const sanitized: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
            sanitized[key] = sanitize(value);
        }
        return sanitized as T;
    }
    return data;
}
