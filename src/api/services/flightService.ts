import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type {
  createFlight,
  updateFlight,
  ResponseAllFlight,
  ResponseAllFlightAvailable,
  updateStateFlight,
} from "../types/flight";

/**
 * Llama al MS General, para crear el vuelo.
 * Retorna la información de todos los vuelos
 */
export async function createFlight(
  data: createFlight
): Promise<ResponseAllFlight> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.CREATEFLIGHT}`;

  return httpPost<createFlight, ResponseAllFlight>(url, data);
}

/**
 * Llama al MS General, para actualizar el vuelo.
 * Retorna la información de todos los vuelos
 */
export async function updateFlight(
  data: updateFlight
): Promise<ResponseAllFlight> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.UPDATEFLIGHT}`;

  return httpPost<updateFlight, ResponseAllFlight>(url, data);
}

/**
 * Llama al MS General, para realizar la actualización del estado de un vuelo.
 * Retorna la información del vuelo modificado
 */
export async function updateStateFlight(
  data: updateStateFlight
): Promise<ResponseAllFlight> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.UPDATESTATEFLIGHT}`;

  return httpPost<updateStateFlight, ResponseAllFlight>(url, data);
}

/**
 * Consulta los vuelos utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de vuelos encontrados.
 */
export async function searchFlight(
  filters: Record<string, string | number | boolean> = {}
): Promise<ResponseAllFlight[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.SEARCHFLIGHT}`;

  return httpGet<ResponseAllFlight[]>(url, filters);
}

/**
 * Consulta todos los vuelos disponibles utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de vuelos encontrados.
 */
export async function searchFlightAvailable(
  filters: Record<string, string | number | boolean | Date> = {}
): Promise<ResponseAllFlightAvailable[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.VUELO}/${ENDPOINT.SEARCHFLIGHTSAVAILABLE}`;

  return httpGet<ResponseAllFlightAvailable[]>(url, filters);
}
