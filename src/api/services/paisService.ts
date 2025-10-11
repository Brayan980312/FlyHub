import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type { responseAllCountry, createUpdateCountry } from "../types/country";

/**
 * Llama al MS General, para crear o actualizar el pais.
 * Retorna la información de todos los pais
 */
export async function createUpdatePaises(
  data: createUpdateCountry
): Promise<responseAllCountry> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.CREATEUPDATECOUNTRY}`;

  return httpPost<createUpdateCountry, responseAllCountry>(url, data);
}

/**
 * Consulta los paises utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de paises encontrados.
 */
export async function searchPaises(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllCountry[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.SEARCHCOUNTRY}`;

  return httpGet<responseAllCountry[]>(url, filters);
}
