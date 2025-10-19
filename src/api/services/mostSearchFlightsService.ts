import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpGet } from "../httpClient";
import type { ResponseMostSearchFlights } from "../types/mostSearchFlights";

/**
 * Consulta los vuelos más buscados en el sistema.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de vuelos más buscados encontrados.
 */
export async function searchMostSearchFlights(
  filters: Record<string, string | number | boolean> = {}
): Promise<ResponseMostSearchFlights[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.METRICAS}/${ENDPOINT.MOSTSEARCHFLIGHTS}`;

  return httpGet<ResponseMostSearchFlights[]>(url, filters);
}
