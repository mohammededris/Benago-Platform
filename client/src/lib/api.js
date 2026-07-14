/**
 * Centralized API configuration & URL builder.
 * Ensures VITE_API_URL trailing slashes don't cause double slashes (e.g. //api/...)
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

/**
 * Builds a full API URL given a relative endpoint path.
 * @param {string} endpoint - Path relative to API base, e.g. "/api/courses/123"
 * @returns {string} Fully qualified URL string
 */
export function buildApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${API_BASE_URL}${cleanEndpoint}`;
}
