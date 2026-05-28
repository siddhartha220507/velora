const LOCAL_BACKEND_ORIGIN = 'http://localhost:5000';

const trimTrailingSlash = (value = '') => String(value).replace(/\/+$/, '');

const getBrowserOrigin = () =>
  typeof window === 'undefined' ? '' : window.location.origin;

const isLocalBrowser = () => {
  if (typeof window === 'undefined') return false;
  return ['localhost', '127.0.0.1'].includes(window.location.hostname);
};

const resolveApiBaseUrl = () => {
  const configured = import.meta.env.VITE_API_URL;
  if (configured) return trimTrailingSlash(configured);

  if (isLocalBrowser()) {
    return `${LOCAL_BACKEND_ORIGIN}/api`;
  }

  const origin = getBrowserOrigin();
  return origin ? `${trimTrailingSlash(origin)}/api` : '/api';
};

const resolveSocketOrigin = () => {
  const configured = import.meta.env.VITE_SOCKET_URL;
  if (configured) return trimTrailingSlash(configured);

  if (isLocalBrowser()) {
    return LOCAL_BACKEND_ORIGIN;
  }

  return trimTrailingSlash(getBrowserOrigin()) || '/';
};

export const API_BASE_URL = resolveApiBaseUrl();
export const SOCKET_ORIGIN = resolveSocketOrigin();

export const buildApiUrl = (path = '') => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};
