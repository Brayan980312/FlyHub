// response vuelo historico
export interface responseHistoryFlight {
  vueloHistoricoCodigo: string;
  estadoVueloNombre: string;
  estadoVueloId: number;
  avionNombre: string;
  ciudadOrigenNombre: string;
  ciudadOrigenNomenclatura: string;
  ciudadOrigenNombreNomenclatura: string;
  ciudadDestinoNombre: string;
  ciudadDestinoNomenclatura: string;
  ciudadDestinoNombreNomenclatura: string;
  vueloHistoricoPrecio: number;
  vueloHistoricoDescuento: number;
  vueloHistoricoFechaHoraSalida: Date;
  vueloHistoricoFechaHoraLlegada: Date;
  usuarioNombreCompleto: string;
  vueloHistoricoFechaCreacion: Date;
}
