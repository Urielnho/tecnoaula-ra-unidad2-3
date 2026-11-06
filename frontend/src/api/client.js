import { getTokens, setTokens, removeTokens, tokenExpiresAt } from "./token";
export const API_URL =
  import.meta.env.VITE_BASE_API_URL || "http://127.0.0.1:8001";
let refreshPromise;
export class ApiError extends Error {
  constructor(message, status, fields = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}
export async function request(
  path,
  { method = "GET", body, token, signal } = {},
) {
  const response = await fetch(`${API_URL}/api/v1${path}`, {
    method,
    signal,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.detail ||
      Object.entries(data)
        .map(
          ([key, value]) =>
            `${key}: ${Array.isArray(value) ? value.join(" ") : value}`,
        )
        .join(" ") ||
      "No se pudo completar la solicitud.";
    throw new ApiError(message, response.status, data);
  }
  return data;
}
export async function refreshAccess() {
  if (!refreshPromise) {
    const stored = getTokens();
    if (!stored?.refresh)
      throw new ApiError("Inicia sesión para continuar.", 401);
    const refreshToken = stored.refresh;
    refreshPromise = request("/auth/token/refresh/", {
      method: "POST",
      body: { refresh: refreshToken },
    })
      .then((data) => {
        if (getTokens()?.refresh !== refreshToken)
          throw new ApiError("La sesión terminó.", 401);
        setTokens({
          access: data.access,
          refresh: data.refresh || refreshToken,
        });
        return data.access;
      })
      .catch((error) => {
        if (error.status === 401 && getTokens()?.refresh === refreshToken)
          removeTokens();
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}
export async function authRequest(path, options = {}) {
  const tokens = getTokens();
  if (!tokens?.access) throw new ApiError("Inicia sesión para continuar.", 401);
  let access = tokens.access;
  if (tokenExpiresAt(access) <= Date.now() + 10000)
    access = await refreshAccess();
  try {
    return await request(path, { ...options, token: access });
  } catch (error) {
    if (error.status !== 401) throw error;
    access = await refreshAccess();
    return request(path, { ...options, token: access });
  }
}
