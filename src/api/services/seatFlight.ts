import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpGet } from "../httpClient";
import type { responseSeatFlight } from "../types/seatFlight";

/**
 * Consulta los asientos de los aviones utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de los asientos del vuelo encontrados.
 */
export async function searchSeatFlight(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseSeatFlight[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.SEARCHSEATFLIGHT}`;

  return httpGet<responseSeatFlight[]>(url, filters);
}
