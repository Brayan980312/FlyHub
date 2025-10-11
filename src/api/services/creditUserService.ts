import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type {
  createUpdateCreditUser,
  responseAllCreditUser,
} from "../types/credist";

/**
 * Llama al MS General, para crear o actualizar los creditos del usuario.
 * Retorna la información de los creditos asociados al usuario
 */
export async function createUpdateCreditoUsuario(
  data: createUpdateCreditUser
): Promise<responseAllCreditUser> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.CREDITOS}/${ENDPOINT.CREATEUPDATECREDITS}`;
  console.log(data, "data guardar");
  return httpPost<createUpdateCreditUser, responseAllCreditUser>(url, data);
}

/**
 * Consulta los creditos que tiene el usuario en el sistema utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de los creditos asociados al usuario.
 */
export async function searchCreditoUsuario(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllCreditUser> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.CREDITOS}/${ENDPOINT.SEARCHCREDITS}`;

  // Obtener usuarioId del localStorage
  const usuarioId = localStorage.getItem("usuarioId");

  if (usuarioId) {
    filters.usuarioId = Number(usuarioId);
  }
  console.log(filters, "filtros");
  return httpGet<responseAllCreditUser>(url, filters);
}
