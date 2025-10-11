// Request crear y actualizar metodos de pago
export interface createUpdateMethodPay {
  metodoPagoId: number;
  metodoPagoNombre: string;
  metodoPagoDescripcion: string;
  metodoPagoEstado: boolean;
}

// Response consulta metodos de pago
export interface responseAllMethodPay {
  metodoPagoId: number;
  metodoPagoNombre: string;
  metodoPagoDescripcion: string;
  metodoPagoEstado: boolean;
}
