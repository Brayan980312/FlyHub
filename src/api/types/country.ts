// Request crear y actualizar paises
export interface createUpdateCountry {
  paisId: number;
  paisNombre: string;
  paisNomenclatura: string;
  paisInternacional: boolean;
  paisEstado: boolean;
}

// Response consulta paises
export interface responseAllCountry {
  paisId: number;
  paisNombre: string;
  paisNomenclatura: string;
  paisInternacional: boolean;
  paisEstado: boolean;
}
