import { DEFAULT_TIMEOUT, STORAGE_KEYS } from "./constans";
import type { ErrorResponse } from "./types/errorResponse";
/**
 * Obtiene el token JWT actual almacenado en localStorage.
 * @returns Token como string o null si no existe.
 */
export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

/**
 * Guarda el token JWT en localStorage.
 * @param token Token JWT a guardar.
 */
export function setAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, token);
}

/**
 * Elimina el token JWT de localStorage (por ejemplo, en logout o error 401).
 */
export function clearAuthToken(): void {
  localStorage.clear();
}

/**
 * Función genérica para manejar la respuesta de un `fetch`.
 * Si la respuesta es exitosa (status 200-299), parsea y devuelve el JSON como tipo T.
 * Si la respuesta es un error (status >= 400), lanza un `ErrorResponse`.
 *
 * @param response - La respuesta devuelta por `fetch`.
 * @returns Una promesa con el cuerpo parseado como tipo T.
 * @throws Un objeto `ErrorResponse` en caso de error HTTP.
 */
export async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Manejo global de 401
    if (response.status === 401) {
      clearAuthToken();
      window.location.href = "/login";
    }

    // Determinar si la respuesta es JSON
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.includes("application/json")) {
      const errorJson: ErrorResponse = await response.json();

      throw errorJson;
    } else {
      // Si no es JSON → fallback a texto
      const errorText = await response.text();

      const fallbackError: ErrorResponse = {
        status: response.status,
        detail: errorText || `HTTP error! status: ${response.status}`,
      };

      throw fallbackError;
    }
  }

  // Si todo bien → devuelve el cuerpo parseado como T
  return response.json() as Promise<T>;
}

/**
 * Ejecuta una petición fetch con un timeout configurable.
 * Si la respuesta tarda más de DEFAULT_TIMEOUT ms, se cancela la petición.
 * @param resource URL a la cual se hace la petición.
 * @param options Opciones de la petición fetch (método, headers, body, etc).
 * @returns Response de la petición.
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
 * Maneja la respuesta HTTP.
 * Si es exitosa (2..), devuelve el cuerpo de la respuesta como JSON.
 * Si es error (por ejemplo, 401), lanza una excepción.
 * @param response Response de la petición.
 * @returns Cuerpo de la respuesta como tipo T.
 */

/**
 * Obtiene los headers por defecto para la petición.
 * Incluye 'Content-Type: application/json' y 'Authorization: Bearer <token>' si existe.
 * @returns Objeto con headers.
 */
function getDefaultHeaders(): Record<string, string> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Hace una petición HTTP GET.
 * @template TResponse Tipo de dato esperado en la respuesta.
 * @param url URL base a la cual se realizará la petición.
 * @param params Parámetros opcionales que se agregarán como query string en la URL.
 * @param customHeaders Headers adicionales opcionales que se incluirán en la petición.
 * @returns Una promesa que resuelve con el cuerpo de la respuesta como tipo TResponse.
 */
export async function httpGet<TResponse>(
  url: string,
  params: Record<string, string | number | boolean> = {},
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  // Construimos los query params si existen
  const queryString = new URLSearchParams(
    Object.entries(params).reduce<Record<string, string>>(
      (acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      },
      {}
    )
  ).toString();

  // Agregamos los params a la URL si existen
  const urlWithParams = queryString ? `${url}?${queryString}` : url;

  const response = await fetchWithTimeout(urlWithParams, {
    method: "GET",
    headers: {
      ...getDefaultHeaders(),
      ...customHeaders,
    },
  });

  return handleResponse<TResponse>(response);
}

/**
 * Hace una petición HTTP POST.
 * @param url URL completa de la petición.
 * @param data Objeto a enviar en el cuerpo como JSON.
 * @param customHeaders Headers adicionales opcionales.
 * @returns Cuerpo de la respuesta como tipo TResponse.
 */
export async function httpPost<TRequest, TResponse>(
  url: string,
  data: TRequest,
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: {
      ...getDefaultHeaders(),
      ...customHeaders,
    },
    body: JSON.stringify(data),
  });

  return handleResponse<TResponse>(response);
}

/**
 * Hace una petición HTTP PUT.
 * @param url URL completa de la petición.
 * @param data Objeto a enviar en el cuerpo como JSON.
 * @param customHeaders Headers adicionales opcionales.
 * @returns Cuerpo de la respuesta como tipo TResponse.
 */
export async function httpPut<TRequest, TResponse>(
  url: string,
  data: TRequest,
  customHeaders: Record<string, string> = {}
): Promise<TResponse> {
  const response = await fetchWithTimeout(url, {
    method: "PUT",
    headers: {
      ...getDefaultHeaders(),
      ...customHeaders,
    },
    body: JSON.stringify(data),
  });

  return handleResponse<TResponse>(response);
}
