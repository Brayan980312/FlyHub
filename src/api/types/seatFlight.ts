// Response buscar asiento de vuelos
export interface responseSeatFlight {
  vueloAsientoId: number;
  asientoAvionId: number;
  vueloAsientoEstado: string;
  asientoAvionNombre: string;
  asientoAvionVIP: string;
  asientoAvionVIPPorcentaje: number;
  compraDetalleNombrePasajero: string;
  compraDetalleIdentificacionPasajero: string;
  rowVersion: string;
}
