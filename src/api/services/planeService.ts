import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type { createUpdatePlane, responseAllPlane } from "../types/plane";

/**
 * Llama al MS General, para crear o actualizar el avión.
 * Retorna la información de todos los aviones
 */
export async function createUpdatePlane(
  data: createUpdatePlane
): Promise<responseAllPlane> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.AVION}/${ENDPOINT.CREATEUPDATEPLANE}`;

  return httpPost<createUpdatePlane, responseAllPlane>(url, data);
}

/**
 * Consulta los aviones utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de aviones encontrados.
 */
export async function searchPlane(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllPlane[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.AVION}/${ENDPOINT.SEARCHPLANE}`;

  return httpGet<responseAllPlane[]>(url, filters);
}
