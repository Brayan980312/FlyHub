// Request de login
export interface LoginRequest {
  usuarioIdentificacion: string;
  usuarioClave: string;
}

// Roles de usuario
interface RolesUsuario {
  usuarioRolId: number;
  usuarioId: number;
  rolId: number;
}

// Response de login
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiraEn: Date;
  usuarioId: number;
  usuarioIdentificacion: string;
  usuarioNombreCompleto: string;
  usuarioCorreo: string;
  usuarioTelefono: string;
  roles: RolesUsuario[];
}

// Request de registro
export interface RegisterRequest {
  usuarioIdentificacion: string;
  usuarioNombreCompleto: string;
  usuarioCorreo: string;
  usuarioTelefono: string;
  usuarioClave: string;
  usuarioClaveConfirmar: string;
}

// Response de registro
export interface RegisterResponse {
  usuarioId: number;
  usuarioIdentificacion: string;
  usuarioNombreCompleto: string;
  usuarioCorreo: string;
  usuarioCelular: string;
}
