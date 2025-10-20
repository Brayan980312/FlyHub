// Request: reservar uno o varios asientos en un vuelo
export interface requestReservarAsientos {
  vueloId: number;
  listaAsientoVuelo: requestAsientoVuelo[];
}

// Detalle de cada asiento dentro de la reserva
export interface requestAsientoVuelo {
  vueloAsientoId: number;
  rowVersion: string;
  bloqueadoHasta: string;
}

// Request: realizar la compra de uno o varios asientos en un vuelo
export interface requestCompraAsientos {
  vueloId: number;
  compraTotal: number;
  detalleAsientos: requestCompraDetalle[];
}

// Detalle de cada asiento dentro de la compra
export interface requestCompraDetalle {
  vueloAsientoId: number;
  compraDetalleNombrePasajero: string;
  compraDetalleIdentificacionPasajero: string;
  compraDetallePrecio: number;
  rowVersion: string;
}

// Representa la información de una compra de vuelo
export interface responseCompra {
  compraId?: number;
  usuarioId?: number;
  vueloId?: number;
  estadoCompraId?: number;
  compraFecha?: string;
  metodoPagoId?: number;
  compraTotal?: number;
}

// Representa la información de una compra realizada por un usuario, junto con los detalles de los asientos adquiridos
export interface responseComprasRealizadasUsuario {
  compraFecha: string;
  metodoPagoNombre: string;
  compraTotal: number;
  vueloCodigo: string;
  avionNombre: string;
  estadoVueloNombre: string;
  estadoVueloId: number;
  ciudadOrigenNombreNomenclatura: string;
  ciudadDestinoNombreNomenclatura: string;
  vueloFechaHoraSalida: string;
  vueloFechaHoraLlegada: string;
  compraDetalle: responseAsientosAsociadosACompra[];
}

// Representa el detalle individual de una compra, incluyendo el asiento, pasajero y precio correspondiente
export interface responseAsientosAsociadosACompra {
  asientoAvionNombre: string;
  asientoAvionVIP: string;
  compraDetallePrecio: number;
  compraDetalleNombrePasajero: string;
  compraDetalleIdentificacionPasajero: string;
}
