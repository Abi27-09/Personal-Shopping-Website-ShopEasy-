
const API = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:4000/api"
).replace(/\/$/, "");

export async function apiFetch(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API}${normalizedPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `API request failed: ${response.status}`);
  }

  if (response.status === 204) return null;

  return response.json();
}

export function getToken() {
  return localStorage.getItem("market_token") || "";
}

export async function api(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  const response = await fetch(`${API}${normalizedPath}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}

export { API };
