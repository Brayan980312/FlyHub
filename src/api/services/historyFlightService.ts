import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpGet } from "../httpClient";
import type { responseHistoryFlight } from "../types/historyFlight";

/**
 * Consulta el historico de un vuelo utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de historico de un vuelo encontrados.
 */
export async function searchHistoryFlight(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseHistoryFlight[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.SEARCHHISTORYFLIGHT}`;

  return httpGet<responseHistoryFlight[]>(url, filters);
}
