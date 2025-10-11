import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type { createUpdateCity, responseAllCity } from "../types/city";

/**
 * Llama al MS General, para crear o actualizar la ciudad.
 * Retorna la información de todos los pais
 */
export async function createUpdateCity(
  data: createUpdateCity
): Promise<responseAllCity> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.CREATEUPDATECITY}`;

  return httpPost<createUpdateCity, responseAllCity>(url, data);
}

/**
 * Consulta las ciudades utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de ciudades encontrados.
 */
export async function searchCity(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllCity[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.SEARCHCITY}`;

  return httpGet<responseAllCity[]>(url, filters);
}
