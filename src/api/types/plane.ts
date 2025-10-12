// Request crear y actualizar información del avión
export interface createUpdatePlane {
  avionId: number;
  avionNombre: string;
  ciudadId: number;
  avionEstado: boolean;
}

// Response consulta de aviones
export interface responseAllPlane {
  avionId: number;
  avionNombre: string;
  ciudadId: number;
  avionEstado: boolean;
}
