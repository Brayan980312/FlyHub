// Request crear y actualizar información del asiento del avion
export interface createUpdateSeatPlane {
  asientoAvionId: number;
  avionId: number;
  asientoAvionNombre: string;
  asientoAvionVIP: boolean;
  asientoAvionVIPPorcentaje: number;
  asientoAvionEstado: boolean;
}

// Response consulta asiento de aviones
export interface responseAllSeatPlane {
  asientoAvionId: number;
  avionId: number;
  asientoAvionNombre: string;
  asientoAvionVIP: boolean;
  asientoAvionVIPPorcentaje: number;
  asientoAvionEstado: boolean;
}
