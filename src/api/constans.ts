// URL base de cada microservicio
export const BASE_URLS = {
  MSSEGURIDAD: "https://localhost:7241/api",
  MSGENERAL:
    "https://microservicioprincipal-grbfdudgbwh2ebag.brazilsouth-01.azurewebsites.net/api",
} as const;

// Nombres de Controllers
export const CONTROLLER = {
  SEGURIDAD: "Seguridad",
  PARAMETROS: "Parametros",
} as const;

// Nombres de endpoint
export const ENDPOINT = {
  REGISTERUSER: "RegistrarUsuario",
  LOGINUSER: "LoginUsuario",
  SEARCHPARAMS: "ConsultarParametros",
  UPDATEPARAM: "ActualizarParametro",
} as const;

// Timeout por defecto para fetch
export const DEFAULT_TIMEOUT = 10000;

// Nombre de la clave que usaremos en localStorage para guardar el token JWT
export const STORAGE_KEYS = {
  TOKEN: "auth_token",
};
