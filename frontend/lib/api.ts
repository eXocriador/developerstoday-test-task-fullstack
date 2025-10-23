import type { ApiError } from '../types/quiz';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '') ?? 'http://localhost:4000';

interface ApiFetchOptions extends RequestInit {
  parseJson?: boolean;
}

class ApiClientError extends Error {
  public readonly status: number;

  public readonly data: ApiError | null;

  constructor(status: number, message: string, data: ApiError | null = null) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.data = data;
  }
}

const parseJsonResponse = async <T>(response: Response): Promise<T> => {
  const text = await response.text();
  if (!text) {
    return undefined as T;
  }
  return JSON.parse(text) as T;
};

export const apiFetch = async <T>(
  path: string,
  { parseJson = true, headers, ...init }: ApiFetchOptions = {}
): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  });

  if (!response.ok) {
    const errorBody = parseJson
      ? await parseJsonResponse<ApiError>(response).catch(() => null)
      : null;

    throw new ApiClientError(
      response.status,
      errorBody?.message ?? 'Request failed',
      errorBody
    );
  }

  if (!parseJson || response.status === 204) {
    return undefined as T;
  }

  return parseJsonResponse<T>(response);
};

export { ApiClientError, API_BASE_URL };

