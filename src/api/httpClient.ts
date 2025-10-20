import {
  DEFAULT_TIMEOUT,
  STORAGE_KEYS,
  BASE_URLS,
  CONTROLLER,
  ENDPOINT,
} from "./constans";
import type { ErrorResponse } from "./types/errorResponse";

// 🔒 Control global para evitar múltiples llamadas simultáneas a RefreshToken
let refreshInProgress: Promise<string | null> | null = null;

/** Obtiene el token JWT actual almacenado */
export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/** Guarda el token JWT en localStorage */
export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

/** Elimina tokens y limpia sesión */
export function clearAuthToken(): void {
  localStorage.clear();
}

/** Guarda el refresh token */
export function setRefreshToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
}

/** Obtiene el refresh token */
export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/** Elimina el refresh token */
export function clearRefreshToken(): void {
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Maneja respuesta HTTP genérica.
 * Si hay error 401, intenta refrescar token (una sola vez concurrente).
 */
export async function handleResponse<T>(
  response: Response,
  retryRequest?: () => Promise<Response>
): Promise<T> {
  if (!response.ok) {
    if (
      response.status === 401 &&
      !window.location.pathname.includes("/login")
    ) {
      const newToken = await tryRefreshToken();

      if (newToken && retryRequest) {
        const retryResponse = await retryRequest();
        if (retryResponse.ok) return retryResponse.json() as Promise<T>;
      }

      clearAuthToken();
      clearRefreshToken();
      window.location.href = "/login";
      return Promise.reject("Sesión expirada. Inicie sesión nuevamente.");
    }

    const contentType = response.headers.get("content-type");
    if (contentType?.includes("application/json")) {
      const errorJson: ErrorResponse = await response.json();
      throw errorJson;
    } else {
      const errorText = await response.text();
      throw {
        status: response.status,
        detail: errorText || `HTTP error! status: ${response.status}`,
      } as ErrorResponse;
    }
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch con timeout configurable.
 */
async function fetchWithTimeout(
  resource: RequestInfo,
  options: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if ((error as Error).name === "AbortError") {
      throw new Error("Request timeout");
    }
    throw error;
  }
}

/**
 * 🔄 Intenta refrescar el token (solo una vez concurrente).
 */
async function tryRefreshToken(): Promise<string | null> {
  if (refreshInProgress) {
    // Esperar a que termine la llamada actual si ya hay una en curso
    return refreshInProgress;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  // Guardamos la promesa activa
  refreshInProgress = (async () => {
    try {
      const response = await fetch(
        `${BASE_URLS.MSSEGURIDAD}/${CONTROLLER.SEGURIDAD}/${ENDPOINT.REFRESHTOKEN}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        }
      );

      if (!response.ok) {
        refreshInProgress = null;
        return null;
      }

      const data = await response.json();
      setAuthToken(data.accessToken);
      setRefreshToken(data.refreshToken);

      refreshInProgress = null;
      return data.accessToken;
    } catch {
      refreshInProgress = null;
      return null;
    }
  })();

  return refreshInProgress;
}

/** Headers por defecto con token JWT */
function getDefaultHeaders(): Record<string, string> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

/** GET */
export async function httpGet<TResponse>(
  url: string,
  params: Record<string, string | number | boolean | Date> = {},
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  const queryString = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {}
    )
  ).toString();

  const urlWithParams = queryString ? `${url}?${queryString}` : url;

  const doRequest = () =>
    fetchWithTimeout(urlWithParams, {
      method: "GET",
      headers: { ...getDefaultHeaders(), ...customHeaders },
    });

  const response = await doRequest();
  return handleResponse<TResponse>(response, doRequest);
}

/** POST */
export async function httpPost<TRequest, TResponse>(
  url: string,
  data: TRequest,
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  const doRequest = () =>
    fetchWithTimeout(url, {
      method: "POST",
      headers: { ...getDefaultHeaders(), ...customHeaders },
      body: JSON.stringify(data),
    });

  const response = await doRequest();
  return handleResponse<TResponse>(response, doRequest);
}

/** PUT */
export async function httpPut<TRequest, TResponse>(
  url: string,
  data: TRequest,
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  const doRequest = () =>
    fetchWithTimeout(url, {
      method: "PUT",
      headers: { ...getDefaultHeaders(), ...customHeaders },
      body: JSON.stringify(data),
    });

  const response = await doRequest();
  return handleResponse<TResponse>(response, doRequest);
}
