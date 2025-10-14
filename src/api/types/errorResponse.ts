/** Respuesta de petición de cualquier MS que retorne validaciones de negocio */
export interface ErrorResponse {
  type: string;
  title: string;
  status: number;
  detail: string;
}
