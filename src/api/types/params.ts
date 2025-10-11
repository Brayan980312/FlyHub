// Request actualizar parametro
export interface updateParam {
  parametrosId: number;
  parametrosNombre: string;
  parametrosValor: string;
  parametrosDescripcion: string;
}

// Response consulta parametros
export interface responseAllParams {
  parametrosId: number;
  parametrosNombre: string;
  parametrosValor: string;
  parametrosDescripcion: string;
  parametrosEstado: boolean;
}
