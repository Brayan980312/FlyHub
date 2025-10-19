// Response buscar asiento de vuelos
export interface responseSeatFlight {
  vueloAsientoId: number;
  asientoAvionId: number;
  vueloAsientoEstado: string;
  asientoAvionNombre: string;
  asientoAvionVIP: string;
  compraDetalleNombrePasajero: string;
  compraDetalleIdentificacionPasajero: string;
}
