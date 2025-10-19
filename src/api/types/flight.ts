// Request crear vuelos
export interface createFlight {
  VueloCodigo?: string;
  AvionId?: number;
  CiudadOrigenId?: number;
  CiudadDestinoId?: number;
  VueloPrecio?: number;
  VueloDescuento?: number;
  VueloFechaHoraSalida?: string;
  VueloFechaHoraLlegada?: string;
}

// Request actualizar vuelos
export interface updateFlight {
  VueloId?: number;
  VueloCodigo?: string;
  CiudadOrigenId?: number;
  CiudadDestinoId?: number;
  VueloPrecio?: number;
  VueloDescuento?: number;
  VueloFechaHoraSalida?: string;
  VueloFechaHoraLlegada?: string;
}

// Request actualizar estado de vuelo
export interface updateStateFlight {
  VueloId: number;
  EstadoVueloId: number;
}

// Response consulta de vuelos
export interface ResponseAllFlight {
  vueloId: number;
  vueloCodigo: string;
  estadoVueloId: number;
  estadoVueloNombre: string;
  avionId: number;
  avionNombre: string;
  ciudadOrigenId: number;
  ciudadOrigenNombre: string;
  ciudadOrigenNomenclatura: string;
  ciudadOrigenNombreNomenclatura: string;
  paisOrigenId: number;
  paisOrigenNombre: string;
  paisOrigenNomenclatura: string;
  paisOrigenNombreNomenclatura: string;
  paisDestinoId: number;
  paisDestinoNombre: string;
  paisDestinoNomenclatura: string;
  paisDestinoNombreNomenclatura: string;
  ciudadDestinoId: number;
  ciudadDestinoNombre: string;
  ciudadDestinoNomenclatura: string;
  ciudadDestinoNombreNomenclatura: string;
  vueloPrecio: number;
  vueloDescuento: number;
  vueloFechaHoraSalida: Date;
  vueloFechaHoraLlegada: Date;
}

// Response consulta de vuelos disponibles
export interface ResponseAllFlightAvailable {
  vueloId: number;
  ciudadOrigenNombre: string;
  ciudadOrigenNomenclatura: string;
  ciudadOrigenNombreNomenclatura: string;
  paisOrigenNombre: string;
  paisOrigenNomenclatura: string;
  paisOrigenNombreNomenclatura: string;
  paisDestinoNombre: string;
  paisDestinoNomenclatura: string;
  paisDestinoNombreNomenclatura: string;
  ciudadDestinoNombre: string;
  ciudadDestinoNomenclatura: string;
  ciudadDestinoNombreNomenclatura: string;
  vueloPrecio: number;
  vueloDescuento: number;
  vueloFechaHoraSalida: Date;
  vueloFechaHoraLlegada: Date;
}
