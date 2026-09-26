const API_URL = import.meta.env.VITE_API_URL;

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Strapi v5's flat REST response shape for a collection endpoint. */
type StrapiListResponse<T> = {
  data: T[];
  meta: { pagination: { page: number; pageSize: number; pageCount: number; total: number } };
};

export async function fetchAPI<T>(path: string): Promise<StrapiListResponse<T>> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) {
    throw new ApiError(`Request to ${path} failed`, res.status);
  }
  return res.json() as Promise<StrapiListResponse<T>>;
}

/** Strapi media fields return a path relative to the API origin. */
export function mediaUrl(path: string): string {
  return path.startsWith('http') ? path : `${API_URL}${path}`;
}
