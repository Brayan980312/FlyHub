// Request crear y actualizar ciudades
export interface createUpdateCity {
  ciudadId: number;
  ciudadNombre: string;
  ciudadNomenclatura: string;
  paisId: number;
  ciudadEstado: boolean;
}

// Response consulta ciudades
export interface responseAllCity {
  ciudadId: number;
  ciudadNombre: string;
  ciudadNomenclatura: string;
  paisId: number;
  ciudadEstado: boolean;
}
