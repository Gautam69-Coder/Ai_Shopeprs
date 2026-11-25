const stripTrailingSlash = (url: string): string => url.replace(/\/+$/, '');

const LOCAL_API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_LOCAL_API_BASE_URL?.trim() || 'http://localhost:5000/api'
);
const PROD_API_BASE_URL = stripTrailingSlash(
  import.meta.env.VITE_PROD_API_BASE_URL?.trim() || 'https://ai-shopeprs.onrender.com/api'
);

/**
 * Resolves the backend API base URL in priority order:
 * 1. Explicit `VITE_API_BASE_URL` build/runtime override
 * 2. `VITE_LOCAL_API_BASE_URL` when running Vite dev server or accessed from localhost/127.0.0.1
 * 3. `VITE_PROD_API_BASE_URL` otherwise (e.g., Cloudflare Pages)
 */
const resolveApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    return stripTrailingSlash(envUrl);
  }

  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (import.meta.env.DEV || isLocalHost) {
    return LOCAL_API_BASE_URL;
  }

  return PROD_API_BASE_URL;
};

export const API_BASE_URL = resolveApiBaseUrl();
export const BACKEND_ORIGIN = API_BASE_URL.replace(/\/api$/, '');
