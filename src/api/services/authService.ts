import { BASE_URLS, ENDPOINT, CONTROLLER } from "../constans";
import { httpPost } from "../httpClient";
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "../types/auth";

/**
 * Llama al MS de seguridad para loguear un usuario.
 * Devuelve el token JWT e información del usuario (usuarioId, nombres, etc).
 */
export async function loginUser(data: LoginRequest): Promise<LoginResponse> {
  const url = `${BASE_URLS.MSSEGURIDAD}/${CONTROLLER.SEGURIDAD}/${ENDPOINT.LOGINUSER}`;

  return httpPost<LoginRequest, LoginResponse>(url, data);
}

/**
 * Llama al MS de seguridad para registrar un usuario nuevo.
 * Devuelve un mensaje de éxito.
 */
export async function registerUser(
  data: RegisterRequest
): Promise<RegisterResponse> {
  const url = `${BASE_URLS.MSSEGURIDAD}/${CONTROLLER.SEGURIDAD}/${ENDPOINT.REGISTERUSER}`;

  return httpPost<RegisterRequest, RegisterResponse>(url, data);
}
