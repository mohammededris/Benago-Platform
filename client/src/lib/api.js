/**
 * Centralized API configuration & URL builder.
 * Ensures VITE_API_URL trailing slashes don't cause double slashes (e.g. //api/...)
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(
  /\/+$/,
  "",
);

/**
 * Builds a full API URL given a relative endpoint path.
 * @param {string} endpoint - Path relative to API base, e.g. "/api/courses/123"
 * @returns {string} Fully qualified URL string
 */
export function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}

export async function fetchWithTimeout(url, options = {}, timeoutMs = 30000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function request(endpoint, options = {}) {
  const url = buildApiUrl(endpoint);
  const res = await fetchWithTimeout(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
    mode: "cors",
    ...options,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return { data: await res.json() };
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: "GET" }),
  post: (endpoint, data, options = {}) => request(endpoint, { ...options, method: "POST", body: JSON.stringify(data) }),
  patch: (endpoint, data, options = {}) => request(endpoint, { ...options, method: "PATCH", body: JSON.stringify(data) }),
  put: (endpoint, data, options = {}) => request(endpoint, { ...options, method: "PUT", body: JSON.stringify(data) }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: "DELETE" }),
};
