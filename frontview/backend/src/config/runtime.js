const DEFAULT_FRONTEND_URL = 'http://localhost:5173';
const DEFAULT_BACKEND_URL = `http://localhost:${process.env.PORT || 5000}`;
const VALID_SAME_SITE_VALUES = new Set(['lax', 'strict', 'none']);

function trimTrailingSlash(value = '') {
  return String(value).replace(/\/+$/, '');
}

function splitCsv(value) {
  return String(value || '')
    .split(',')
    .map(entry => trimTrailingSlash(entry.trim()))
    .filter(Boolean);
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const normalized = String(value).trim().toLowerCase();
  if (['true', '1', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
}

function normalizeSameSite(value, fallback = 'lax') {
  const normalized = String(value || fallback).trim().toLowerCase();
  return VALID_SAME_SITE_VALUES.has(normalized) ? normalized : fallback;
}

function isLocalDevOrigin(origin) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
    trimTrailingSlash(origin)
  );
}

const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = trimTrailingSlash(
  process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL
);
const backendUrl = trimTrailingSlash(
  process.env.BACKEND_URL || DEFAULT_BACKEND_URL
);
const githubCallbackUrl = trimTrailingSlash(
  process.env.GITHUB_CALLBACK_URL || `${backendUrl}/api/auth/github/callback`
);
const googleCallbackUrl = trimTrailingSlash(
  process.env.GOOGLE_CALLBACK_URL || `${backendUrl}/api/auth/google/callback`
);

const corsAllowedOrigins = new Set(
  [
    frontendUrl,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    ...splitCsv(process.env.CORS_ALLOWED_ORIGINS)
  ].filter(Boolean)
);

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = trimTrailingSlash(origin);
  return (
    corsAllowedOrigins.has(normalizedOrigin) ||
    isLocalDevOrigin(normalizedOrigin)
  );
}

const sessionCookieSameSite = normalizeSameSite(
  process.env.SESSION_COOKIE_SAME_SITE,
  'lax'
);
const sessionCookieSecure =
  sessionCookieSameSite === 'none'
    ? true
    : parseBoolean(process.env.SESSION_COOKIE_SECURE, isProduction);

module.exports = {
  backendUrl,
  corsAllowedOrigins,
  frontendUrl,
  githubCallbackUrl,
  googleCallbackUrl,
  isAllowedOrigin,
  isProduction,
  sessionCookieSameSite,
  sessionCookieSecure,
  trimTrailingSlash
};
