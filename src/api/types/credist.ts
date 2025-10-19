// Request crear y actualizar los creditos del usuario en el sistema
export interface createUpdateCreditUser {
  creditoUsuarioCreditos: number;
  accion: number;
}

// Response consulta los creditos del cliente logueado
export interface responseAllCreditUser {
  creditoUsuarioId: number;
  usuarioId: number;
  creditoUsuarioCreditos: number;
}
