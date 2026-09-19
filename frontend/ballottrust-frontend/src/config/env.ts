/**
 * API and asset base URLs.
 *
 * docs/05 §2 specifies `/api/v1` as the API base path, so services
 * declare routes relative to it (`/elections`, `/public/elections`).
 *
 * Uploaded files are served by the backend's static middleware at
 * `/uploads`, which sits *outside* that prefix — hence a separate base.
 * Deriving it from API_URL keeps the two in step when only one variable
 * is configured.
 *
 * Leave VITE_API_URL as `/api/v1` to issue same-origin requests, which
 * the Vite dev proxy forwards to the backend (see vite.config.ts).
 */
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api/v1';

export const ENV = {
  API_URL,

  /** Origin serving /uploads — API_URL with the version prefix removed. */
  ASSET_URL:
    import.meta.env.VITE_ASSET_URL ?? API_URL.replace(/\/api\/v\d+\/?$/, ''),
};
