import { workspaceBffUrl } from './endpoints';

type ApiOptions = RequestInit & {
  timeoutMs?: number;
};

export async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { timeoutMs = 5000, ...requestOptions } = options;
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(workspaceBffUrl(endpoint), {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(requestOptions.headers ?? {}),
      },
      ...requestOptions,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`BFF request failed: ${response.status}`);
    }

    return await response.json() as T;
  } finally {
    window.clearTimeout(timeout);
  }
}
