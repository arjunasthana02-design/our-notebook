export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://our-notebook.onrender.com");

export function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}
