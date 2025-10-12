import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type {
  createUpdateSeatPlane,
  responseAllSeatPlane,
} from "../types/seatPlane";

/**
 * Llama al MS General, para crear o actualizar el asiento del avión.
 * Retorna la información de todos los asientos de un avion
 */
export async function createUpdateSeatPlane(
  data: createUpdateSeatPlane
): Promise<responseAllSeatPlane> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.AVION}/${ENDPOINT.CREATEUPDATESEATPLANE}`;

  return httpPost<createUpdateSeatPlane, responseAllSeatPlane>(url, data);
}

/**
 * Consulta los aviones utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de aviones encontrados.
 */
export async function searchSeatPlane(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllSeatPlane[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.AVION}/${ENDPOINT.SEARCHSEATPLANE}`;

  return httpGet<responseAllSeatPlane[]>(url, filters);
}
