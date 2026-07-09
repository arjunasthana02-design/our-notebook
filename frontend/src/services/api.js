export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://our-notebook.onrender.com");

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
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

  return encodeURI(`${API_BASE_URL}${pathWithSlash}`);
}
