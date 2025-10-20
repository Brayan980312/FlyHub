import { BASE_URLS, CONTROLLER, ENDPOINT } from "../constans";
import { httpGet, httpPost } from "../httpClient";
import type {
  requestCompraAsientos,
  requestReservarAsientos,
  responseComprasRealizadasUsuario,
  responseCompra,
} from "../types/buySeatFlight";
import type { responseSeatFlight } from "../types/seatFlight";

/**
 * Llama al MS General, para realizar la reserva de los asientos.
 * Retorna la información de todos los asientos reservados
 */
export async function reserveSeatFlight(
  data: requestReservarAsientos
): Promise<responseSeatFlight[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.COMPRAS}/${ENDPOINT.RESERVESEATFLIGHT}`;

  return httpPost<requestReservarAsientos, responseSeatFlight[]>(url, data);
}

/**
 * Llama al MS General, para realizar la compra de los asientos de un vuelo.
 * Retorna la información de la compra realizada
 */
export async function buySeatFlight(
  data: requestCompraAsientos
): Promise<responseCompra> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.COMPRAS}/${ENDPOINT.BUYSEATFLIGHT}`;

  return httpPost<requestCompraAsientos, responseCompra>(url, data);
}

/**
 * Consulta todas las compras realizadas por el usuario utilizando una petición GET con posibles filtros.
 * @param filters Objeto con filtros opcionales como query params.
 * @returns Lista de compras encontradas.
 */
export async function searchBuySeatFlight(
  filters: Record<string, string | number | boolean | Date> = {}
): Promise<responseComprasRealizadasUsuario[]> {
  const url = `${BASE_URLS.MSGENERAL}/${CONTROLLER.COMPRAS}/${ENDPOINT.SEARCHBUYSEATFLIGHT}`;

  return httpGet<responseComprasRealizadasUsuario[]>(url, filters);
}
