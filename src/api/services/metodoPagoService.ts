import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpPost, httpGet } from "../httpClient";
import type {
  createUpdateMethodPay,
  responseAllMethodPay,
} from "../types/methodPay";

/**
 * Llama al MS General, para crear o actualizar el metodo de pago.
 * Retorna la información de todos los pais
 */
export async function createUpdateMetodoPago(
  data: createUpdateMethodPay
): Promise<responseAllMethodPay> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.CREATEUPDATEMETHODPAY}`;

  return httpPost<createUpdateMethodPay, responseAllMethodPay>(url, data);
}

/**
 * Consulta los metodos de pago utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de paises encontrados.
 */
export async function searchMetodoPago(
  filters: Record<string, string | number | boolean> = {}
): Promise<responseAllMethodPay[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.ADMINISTRACION}/${ENDPOINT.SEARCHMETHODPAY}`;

  return httpGet<responseAllMethodPay[]>(url, filters);
}
