export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://our-notebook.onrender.com");

export const AUTH_STORAGE_KEY = "notebookAuthToken";

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function getAuthToken() {
  return localStorage.getItem(AUTH_STORAGE_KEY) || "";
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(AUTH_STORAGE_KEY, token);
    localStorage.setItem("loggedIn", "true");
  } else {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("loggedIn");
  }
}

export function isLoggedIn() {
  return Boolean(getAuthToken());
}

export function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(apiUrl(path), {
    ...options,
    headers
  });
}

export function mediaUrl(path) {
  if (!path) return "";

  const normalizedPath = String(path).replaceAll("\\", "/").trim();

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://") ||
    normalizedPath.startsWith("blob:") ||
    normalizedPath.startsWith("data:")
  ) {
    return encodeURI(normalizedPath);
  }

  const pathWithSlash = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;

  const url = new URL(`${API_BASE_URL}${pathWithSlash}`);
  const token = getAuthToken();

  if (token) {
    url.searchParams.set("auth_token", token);
  }

  return encodeURI(url.toString());
}
