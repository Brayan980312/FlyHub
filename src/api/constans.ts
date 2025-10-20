// URL base de cada microservicio
export const BASE_URLS = {
  MSSEGURIDAD: "https://localhost:7241/api",
  MSGENERAL: "https://localhost:7271/api",
} as const;

// Nombres de Controllers
export const CONTROLLER = {
  SEGURIDAD: "Seguridad",
  CONFIGURACION: "Configuracion",
  ADMINISTRACION: "Administracion",
  CREDITOS: "Creditos",
  AVION: "Avion",
  VUELO: "Vuelo",
  METRICAS: "Metricas",
  COMPRAS: "Compras",
} as const;

// Nombres de endpoint
export const ENDPOINT = {
  REGISTERUSER: "RegistrarUsuario",
  LOGINUSER: "LoginUsuario",
  SEARCHPARAMS: "ConsultarParametros",
  UPDATEPARAM: "ActualizarParametro",
  SEARCHCOUNTRY: "ConsultarPais",
  CREATEUPDATECOUNTRY: "CrearActualizarPais",
  SEARCHCITY: "ConsultarCiudad",
  CREATEUPDATECITY: "CrearActualizarCiudad",
  SEARCHMETHODPAY: "ConsultarMetodoPago",
  CREATEUPDATEMETHODPAY: "CrearActualizarMetodoPago",
  SEARCHPLANE: "ConsultarAvion",
  CREATEUPDATEPLANE: "CrearActualizarAvion",
  SEARCHSEATPLANE: "ConsultarAsientoAvion",
  CREATEUPDATESEATPLANE: "CrearActualizarAsientoAvion",
  SEARCHFLIGHT: "ConsultarVueloPersonalizado",
  CREATEFLIGHT: "CrearVuelo",
  UPDATEFLIGHT: "ActualizarVuelo",
  SEARCHSEATFLIGHT: "ConsultarVueloAsientos",
  UPDATESTATEFLIGHT: "ActualizarEstadoVuelo",
  MOSTSEARCHFLIGHTS: "ConsultarVuelosMasBuscados",
  SEARCHFLIGHTSAVAILABLE: "ConsultarVueloDisponibles",
  SEARCHHISTORYFLIGHT: "ConsultarVueloHistorico",
  RESERVESEATFLIGHT: "ReservaAsientosVuelo",
  BUYSEATFLIGHT: "CompraAsientosVuelo",
  SEARCHBUYSEATFLIGHT: "BuscarComprasUsuario",
} as const;

// Timeout por defecto para fetch
export const DEFAULT_TIMEOUT = 10000;

// Nombre de la clave que usaremos en localStorage para guardar el token JWT
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
};
