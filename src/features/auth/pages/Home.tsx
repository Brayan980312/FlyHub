import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  TextField,
  Autocomplete,
  Chip,
  Divider,
  Stack,
  type AlertColor,
  Tooltip,
  IconButton,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandLess, ExpandMore, FlightTakeoff } from "@mui/icons-material";
import AnimatedContainer from "../../components/AnimatedContainer";
import LoadingModal from "../../components/LoadingModal";
import Notification from "../../components/Notification";
import { STORAGE_KEYS } from "../../../api/constans";
import type { ErrorResponse } from "../../../api/types/errorResponse";
import { loginUser, registerUser } from "../../../api/services/authService";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  /** Estado de la vista que se debe visualizar */
  const [view, setView] = useState<"home" | "login" | "register">("home");

  /** Estado de busqueda de vuelos */
  const [origen, setOrigen] = useState("");
  const [destino, setDestino] = useState("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [pasajeros, setPasajeros] = useState<string>("1");

  /** Estado de mensaje para modal de espera */
  const [loading, setLoading] = useState(true);
  const [message, setMessageLoading] = useState("Cargando...");

  /** Estado para abrir panel  */
  const [open, setOpen] = useState(false);

  /** Login */
  const [formDataLogin, setFormDataLogin] = useState({
    usuario: "",
    clave: "",
  });
  const [errorsLogin, setErrorsLogin] = useState<Record<string, string>>({});

  /** Estados para el manejo de notificaciones tipo Toast */
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState<AlertColor>("warning");

  /** Estados para el registro de nuevo usuario */
  const initialFormData = {
    identificacion: "",
    nombresApellidos: "",
    telefono: "",
    correo: "",
    clave: "",
    confirmarClave: "",
  };
  const [formData, setFormData] = useState({
    identificacion: "",
    nombresApellidos: "",
    telefono: "",
    correo: "",
    clave: "",
    confirmarClave: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /** Login */
  const handleChangeLogin = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormDataLogin({
      ...formDataLogin,
      [e.target.name]: e.target.value,
    });

    setErrorsLogin({
      ...errorsLogin,
      [e.target.name]: "",
    });
  };
  const handleSubmitLogin = async () => {
    const newErrors: Record<string, string> = {};

    // Validar campos vacíos
    if (!formDataLogin.usuario.trim()) {
      newErrors.usuario = "El usuario es obligatorio";
    }

    if (!formDataLogin.clave.trim()) {
      newErrors.clave = "La clave es obligatoria";
    }

    setErrorsLogin(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        /** Si todo está en orden entonces se realiza la petición para registrar el usuario */
        const response = await loginUser({
          usuarioIdentificacion: formDataLogin.usuario,
          usuarioClave: formDataLogin.clave,
        });

        // Agrega la información al localSotrage
        localStorage.setItem(STORAGE_KEYS.TOKEN, response.tokenJWT);
        localStorage.setItem("usuarioId", response.usuarioId.toString());
        localStorage.setItem(
          "usuarioIdentificacion",
          response.usuarioIdentificacion
        );
        localStorage.setItem("usuarioNombres", response.usuarioNombreCompleto);
        localStorage.setItem("usuarioCorreo", response.usuarioCorreo);
        localStorage.setItem("usuarioTelefono", response.usuarioTelefono);
        localStorage.setItem("roles", JSON.stringify(response.roles));

        navigate("/");
      } catch (error) {
        const err = error as ErrorResponse;

        if (err.status === 422 && err.detail) {
          setTitulo("Validación de logueo.");
          setMensaje(err.detail);
          setTipo("warning");
          setAbierto(true);
        } else {
          setTitulo("Error en la apicación.");
          setMensaje("Error desconocido.");
          setTipo("error");
          setAbierto(true);
        }
      }
    }
  };

  useEffect(() => {
    // Simular un proceso de carga, por ejemplo 2 segundos
    const timer = setTimeout(() => {
      setMessageLoading("Cargando...");
      setLoading(false); // Oculta el modal automáticamente
    }, 5000);

    return () => clearTimeout(timer); // Limpiar timer al desmontar
  }, []);

  const aeropuertos = [
    { codigo: "BOG", nombre: "Bogotá (BOG)" },
    { codigo: "MDE", nombre: "Medellín (MDE)" },
    { codigo: "CTG", nombre: "Cartagena (CTG)" },
    { codigo: "CLO", nombre: "Cali (CLO)" },
  ];

  const flights = [
    {
      id: 4,
      departTime: "10:39",
      departCode: "BOG",
      arriveTime: "12:08",
      arriveCode: "SMR",
      duration: "1h 29m",
      type: "Directo",
      operator: "Operado por Avianca Express",
      price: "COP 690.430",
    },
  ];

  interface Ruta {
    origen: string;
    destino: string;
    precio: string;
    operador: string;
    duracion: string;
    salida: string;
    llegada: string;
  }

  const rutas: Ruta[] = [
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca Express",
      duracion: "1h 38m",
      salida: "06:05",
      llegada: "07:43",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 30m",
      salida: "08:14",
      llegada: "09:44",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 31m",
      salida: "09:30",
      llegada: "11:01",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca Express",
      duracion: "1h 39m",
      salida: "11:45",
      llegada: "13:24",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 32m",
      salida: "14:00",
      llegada: "15:32",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 34m",
      salida: "16:00",
      llegada: "17:34",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca Express",
      duracion: "1h 28m",
      salida: "18:00",
      llegada: "19:28",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 31m",
      salida: "20:00",
      llegada: "21:31",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca",
      duracion: "1h 35m",
      salida: "22:00",
      llegada: "23:35",
    },
    {
      origen: "BOG",
      destino: "SMR",
      precio: "690.430",
      operador: "Avianca Express",
      duracion: "1h 30m",
      salida: "23:45",
      llegada: "01:15",
    },
  ];

  const handleBuscar = () => {
    const numPasajeros = parseInt(pasajeros);
    if (
      !origen ||
      !destino ||
      !fecha ||
      isNaN(numPasajeros) ||
      numPasajeros <= 0
    )
      return;

    alert(
      `Buscando vuelos de ${origen} a ${destino} el ${fecha.toLocaleDateString()} para ${numPasajeros} pasajero(s)`
    );
  };

  const cerrarNotificacion = () => {
    setAbierto(false);
  };

  /** Nuevo usuario */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const validarClaveSegura = (clave: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[~`!@#$%^&*()_\-+=\[\]{}|\\:;"',.<>?/]).{8,}$/;
    return regex.test(clave);
  };

  const validarCorreo = (correo: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};

    Object.entries(formData).forEach(([key, value]) => {
      if (!value.trim()) {
        newErrors[key] = "Este campo es obligatorio";
      }
    });

    if (formData.clave && !validarClaveSegura(formData.clave)) {
      newErrors.clave = "La clave no es fuerte";
    }

    if (formData.correo && !validarCorreo(formData.correo)) {
      newErrors.correo = "El correo no tiene un formato valido";
    }

    if (
      formData.clave &&
      formData.confirmarClave &&
      formData.clave !== formData.confirmarClave
    ) {
      newErrors.confirmarClave = "Las claves no coinciden";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        /** Si todo está en orden entonces se realiza la petición para registrar el usuario */
        await registerUser({
          usuarioIdentificacion: formData.identificacion,
          usuarioNombreCompleto: formData.nombresApellidos,
          usuarioTelefono: formData.telefono,
          usuarioCorreo: formData.correo,
          usuarioClave: formData.clave,
          usuarioClaveConfirmar: formData.confirmarClave,
        });

        setTitulo("Registro de usuario.");
        setMensaje("Usuario registrado exitosamente");
        setTipo("success");
        setAbierto(true);
        setFormData(initialFormData);
        setView("login");
      } catch (error) {
        const err = error as ErrorResponse;

        if (err.status === 422 && err.detail) {
          setTitulo("Validación de registro.");
          setMensaje(err.detail);
          setTipo("warning");
          setAbierto(true);
        } else {
          setTitulo("Error en la apicación.");
          setMensaje("Error desconocido.");
          setTipo("error");
          setAbierto(true);
        }
      }
    }
  };

  const isFormValid =
    origen.trim() !== "" &&
    destino.trim() !== "" &&
    fecha !== null &&
    !isNaN(parseInt(pasajeros)) &&
    parseInt(pasajeros) > 0;

  return (
    <AnimatedContainer>
      <Box
        sx={{
          minHeight: "100vh",
          backgroundImage: "url('FondoHome.png')",
          backgroundRepeat: "repeat",
          backgroundSize: "auto",
          backgroundPosition: "top left",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
          pt: "12vh",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            background: "rgba(10, 25, 41, 0.8)",
          },
        }}
      >
        {/* Botones de login y registro */}
        <Box
          sx={{
            position: "absolute",
            top: 20,
            right: 30,
            zIndex: 3,
            display: "flex",
            gap: 2,
          }}
        >
          {view !== "login" && view !== "register" && (
            <Button
              variant="contained"
              onClick={() => {
                setView("login");
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                backgroundColor: "#0f7c77",
                "&:hover": {
                  backgroundColor: "#0c615e",
                },
              }}
            >
              Iniciar sesión
            </Button>
          )}
          {view !== "register" && view !== "login" && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setView("register");
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                color: "#fff",
                borderColor: "#fff",
              }}
            >
              Registrarse
            </Button>
          )}
        </Box>

        {/* Validacion para saber que vista mostrar */}
        <Paper
          elevation={10}
          sx={{
            position: "relative",
            zIndex: 2,
            p: 3,
            width: "auto",
            maxWidth: 1200,
            borderRadius: 3,
            backdropFilter: "blur(12px)",
            background: "rgba(255,255,255,0.08)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          }}
        >
          {view === "home" && (
            <>
              <Typography
                variant="h5"
                align="center"
                fontWeight={600}
                gutterBottom
                sx={{ mb: 2, color: "#fff" }}
              >
                Encuentra tu próximo destino ✈️
              </Typography>

              <Grid container spacing={3}>
                {/* ORIGEN */}
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={aeropuertos.filter((a) => a.codigo !== destino)}
                    getOptionLabel={(option) => option.nombre}
                    value={aeropuertos.find((a) => a.codigo === origen) || null}
                    onChange={(_, newValue) => {
                      if (!newValue) return;
                      setOrigen(newValue.codigo);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Origen"
                        variant="filled"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ alignItems: "center" }}
                            >
                              <FlightTakeoffIcon
                                sx={{
                                  color: "#fff",
                                  fontSize: 22,
                                  position: "relative",
                                  top: "-7px", // leve ajuste vertical
                                }}
                              />
                            </InputAdornment>
                          ),
                          disableUnderline: true,
                        }}
                        sx={{
                          width: 270,
                          "& .MuiFilledInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                            alignItems: "center",
                            py: 0.4,
                            fontSize: "0.99rem",
                            paddingTop: 2,
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.8)",
                          },
                          "& .MuiSvgIcon-root": { color: "#fff" },
                        }}
                      />
                    )}
                    componentsProps={{
                      paper: {
                        sx: {
                          backgroundColor: "rgba(0,0,0,0.9)",
                          color: "#fff",
                          fontSize: "0.85rem",
                        },
                      },
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 4],
                            },
                          },
                        ],
                      },
                    }}
                  />
                </Grid>

                {/* DESTINO */}
                <Grid item xs={12} sm={6} md={3}>
                  <Autocomplete
                    options={aeropuertos.filter((a) => a.codigo !== origen)}
                    getOptionLabel={(option) => option.nombre}
                    value={
                      aeropuertos.find((a) => a.codigo === destino) || null
                    }
                    onChange={(_, newValue) => {
                      if (!newValue) return;
                      setDestino(newValue.codigo);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Destino"
                        variant="filled"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <InputAdornment
                              position="start"
                              sx={{ alignItems: "center" }}
                            >
                              <FlightLandIcon
                                sx={{
                                  color: "#fff",
                                  fontSize: 20,
                                  position: "relative",
                                  top: "-7px",
                                }}
                              />
                            </InputAdornment>
                          ),
                          disableUnderline: true,
                        }}
                        sx={{
                          width: 270,
                          "& .MuiFilledInput-root": {
                            backgroundColor: "rgba(255,255,255,0.1)",
                            color: "#fff",
                            borderTopLeftRadius: 15,
                            borderTopRightRadius: 15,
                            alignItems: "center",
                            py: 0.4,
                            fontSize: "0.99rem",
                            paddingTop: 2,
                          },
                          "& .MuiInputLabel-root": {
                            color: "rgba(255,255,255,0.8)",
                          },
                          "& .MuiSvgIcon-root": { color: "#fff" },
                        }}
                      />
                    )}
                    componentsProps={{
                      paper: {
                        sx: {
                          backgroundColor: "rgba(0,0,0,0.9)",
                          color: "#fff",
                          fontSize: "0.85rem",
                        },
                      },
                      popper: {
                        modifiers: [
                          {
                            name: "offset",
                            options: {
                              offset: [0, 4],
                            },
                          },
                        ],
                      },
                    }}
                  />
                </Grid>

                {/* FECHA */}
                <Grid item xs={12} sm={6} md={3}>
                  <LocalizationProvider
                    dateAdapter={AdapterDateFns}
                    adapterLocale={es}
                  >
                    <DatePicker
                      label="Fecha"
                      disablePast
                      value={fecha}
                      onChange={(newValue) => setFecha(newValue)}
                      slotProps={{
                        textField: {
                          variant: "filled",
                          sx: {
                            width: 170,
                            "& .MuiFilledInput-root": {
                              backgroundColor: "rgba(255,255,255,0.1)",
                              color: "#fff",
                              fontSize: "0.8rem",
                            },
                            "& .MuiFormLabel-root": {
                              color: "rgba(255,255,255,0.7)",
                            },
                          },
                        },
                      }}
                    />
                  </LocalizationProvider>
                </Grid>

                {/* PASAJEROS */}
                <Grid item xs={12} sm={6} md={2}>
                  <TextField
                    label="Pasajeros"
                    type="number"
                    value={pasajeros}
                    onChange={(e) => setPasajeros(e.target.value)}
                    onBlur={() => {
                      let val = parseInt(pasajeros);
                      if (isNaN(val) || val < 1) val = 1;
                      else if (val > 9) val = 9;
                      setPasajeros(val.toString());
                    }}
                    inputProps={{ min: 1, max: 9 }}
                    variant="filled"
                    sx={{
                      width: 90,
                      "& .MuiFilledInput-root": {
                        backgroundColor: "rgba(255,255,255,0.1)",
                        color: "#fff",
                      },
                      "& .MuiFormLabel-root": {
                        color: "rgba(255,255,255,0.7)",
                      },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                      "& input[type=number]::-webkit-outer-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                      "& input[type=number]::-webkit-inner-spin-button": {
                        WebkitAppearance: "none",
                        margin: 0,
                      },
                    }}
                  />
                </Grid>

                {/* BOTÓN BUSCAR */}
                <Grid item xs={12} md={1} display="flex" alignItems="center">
                  <Button
                    disabled={!isFormValid}
                    onClick={handleBuscar}
                    sx={{
                      height: "100%",
                      fontWeight: 700,
                      textTransform: "none",
                      borderRadius: 2,
                      color: "#fff",
                      backgroundColor: "#0f7c77",
                      "&:hover": {
                        backgroundColor: "#0c615e",
                      },
                      width: "150px",
                    }}
                  >
                    Buscar
                  </Button>
                </Grid>
              </Grid>
            </>
          )}

          {view === "login" && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={0}
            >
              <Typography variant="h5" fontWeight={600}>
                Iniciar sesión
              </Typography>

              <TextField
                label="Usuario"
                name="usuario"
                type="email"
                variant="filled"
                fullWidth
                value={formDataLogin.usuario}
                onChange={handleChangeLogin}
                error={!!errorsLogin.usuario}
                helperText={errorsLogin.usuario}
                sx={{
                  mb: 1,
                  "& .MuiInputBase-input": { fontSize: "0.85rem" },
                  "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                }}
              />

              <TextField
                label="Clave"
                name="clave"
                type="password"
                variant="filled"
                fullWidth
                value={formDataLogin.clave}
                onChange={handleChangeLogin}
                error={!!errorsLogin.clave}
                helperText={errorsLogin.clave}
                sx={{
                  mb: 1,
                  "& .MuiInputBase-input": { fontSize: "0.85rem" },
                  "& .MuiInputLabel-root": { fontSize: "0.85rem" },
                }}
              />

              <Button
                variant="contained"
                onClick={handleSubmitLogin}
                sx={{
                  mt: 2,
                  width: "100%",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Iniciar sesión
              </Button>

              <Button
                onClick={() => setView("register")}
                sx={{ color: "#0f7c77" }}
              >
                ¿No tienes cuenta? Regístrate
              </Button>

              <Button onClick={() => setView("home")} sx={{ color: "#bbb" }}>
                ← Volver al inicio
              </Button>
            </Box>
          )}
          {view === "register" && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              gap={0}
              sx={{ width: "100%", maxWidth: 458 }}
            >
              <Typography variant="h5" fontWeight={600}>
                Crear cuenta
              </Typography>

              <Grid container spacing={1} sx={{ width: "100%" }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Identificación"
                    name="identificacion"
                    variant="filled"
                    size="small"
                    value={formData.identificacion}
                    onChange={handleChange}
                    error={!!errors.identificacion}
                    helperText={errors.identificacion}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Nombre Completo"
                    name="nombresApellidos"
                    variant="filled"
                    size="small"
                    value={formData.nombresApellidos}
                    onChange={handleChange}
                    error={!!errors.nombresApellidos}
                    helperText={errors.nombresApellidos}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    label="Teléfono"
                    name="telefono"
                    variant="filled"
                    size="small"
                    value={formData.telefono}
                    onChange={handleChange}
                    error={!!errors.telefono}
                    helperText={errors.telefono}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Correo electrónico"
                    name="correo"
                    variant="filled"
                    size="small"
                    value={formData.correo}
                    onChange={handleChange}
                    error={!!errors.correo}
                    helperText={errors.correo}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box sx={{ position: "relative" }}>
                    <TextField
                      type="password"
                      label="Clave"
                      name="clave"
                      variant="filled"
                      size="small"
                      value={formData.clave}
                      onChange={handleChange}
                      error={!!errors.clave}
                      helperText={errors.clave}
                      fullWidth
                    />

                    <Tooltip
                      arrow
                      placement="left"
                      title={
                        <Box sx={{ fontSize: "0.8rem", lineHeight: 1.4 }}>
                          <strong>La clave debe tener:</strong>
                          <ul style={{ margin: 4, paddingLeft: 16 }}>
                            <li>Al menos 8 caracteres</li>
                            <li>Una letra mayúscula</li>
                            <li>Una letra minúscula</li>
                            <li>Un número</li>
                            <li>Un carácter especial (!@#$%^&*)</li>
                          </ul>
                        </Box>
                      }
                    >
                      <IconButton
                        size="small"
                        sx={{
                          position: "absolute",
                          right: 4,
                          top: "50%",
                          transform: "translateY(-50%)",
                          color: "rgba(255,255,255,0.6)",
                          "&:hover": { color: "#fff" },
                        }}
                      >
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    type="password"
                    label="Confirmar clave"
                    name="confirmarClave"
                    variant="filled"
                    size="small"
                    value={formData.confirmarClave}
                    onChange={handleChange}
                    error={!!errors.confirmarClave}
                    helperText={errors.confirmarClave}
                  />
                </Grid>
              </Grid>

              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  mt: 2,
                  width: "100%",
                  fontWeight: 600,
                  textTransform: "none",
                }}
              >
                Registrar
              </Button>

              <Button
                onClick={() => setView("login")}
                sx={{ color: "#0f7c77" }}
              >
                ¿Tienes cuenta? Inicia sesión
              </Button>

              <Button onClick={() => setView("home")} sx={{ color: "#bbb" }}>
                ← Volver al inicio
              </Button>
            </Box>
          )}
        </Paper>

        {/* Vuelos más buscados */}
        {view === "home" && (
          <Box
            sx={{
              position: "relative",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              zIndex: 10,
            }}
          >
            {/* Texto con icono */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                cursor: "pointer",
                mt: 2,
                color: "rgba(255,255,255,0.9)",
                "&:hover": { color: "#00bcd4" },
                userSelect: "none",
              }}
              onClick={() => setOpen(!open)}
            >
              <Typography
                variant="body1"
                fontWeight={600}
                sx={{ letterSpacing: 0.3, color: "#0f7c77" }}
              >
                Más buscados
              </Typography>
              {open ? (
                <ExpandLess sx={{ transition: "0.3s", color: "#0f7c77" }} />
              ) : (
                <ExpandMore sx={{ transition: "0.3s", color: "#0f7c77" }} />
              )}
            </Box>

            {/* Panel animado */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, y: -20, scaleY: 0 }}
                  animate={{ opacity: 1, y: 0, scaleY: 1 }}
                  exit={{ opacity: 0, y: -20, scaleY: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 125,
                    damping: 14,
                  }}
                  style={{
                    position: "absolute",
                    top: "100%",
                    transformOrigin: "top center",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <Paper
                    elevation={12}
                    sx={{
                      width: { xs: "95vw", sm: "80vw", md: "65vw" },
                      mt: 3,
                      p: 3,
                      borderRadius: 4,
                      background: "rgba(15, 15, 15, 0.6)",
                      backdropFilter: "blur(16px)",
                      border: "1px solid rgba(255,255,255,0.15)",
                      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.6)",
                      color: "white",
                    }}
                  >
                    <Typography
                      variant="h6"
                      textAlign="center"
                      fontWeight={600}
                      mb={2}
                      sx={{ color: "#0f7c77" }}
                    >
                      ✈️ Top 10 rutas más buscadas
                    </Typography>
                    <Divider
                      sx={{ mb: 2, borderColor: "rgba(255,255,255,0.15)" }}
                    />

                    {rutas.length > 0 ? (
                      <Grid
                        container
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                      >
                        {rutas.map((r, i) => (
                          <Grid item xs={12} sm={6} md={4} key={i}>
                            <Paper
                              sx={{
                                p: 2,
                                borderRadius: 3,
                                background: "rgba(0,0,0,0.45)",
                                border: "1px solid rgba(255,255,255,0.15)",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                minHeight: 30,
                                transition:
                                  "transform 0.3s, background 0.3s, box-shadow 0.3s",
                                "&:hover": {
                                  transform: "translateY(-4px)",
                                  background: "rgba(255,255,255,0.08)",
                                  boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
                                },
                              }}
                            >
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={2}
                                justifyContent="center"
                              >
                                <FlightTakeoff
                                  sx={{ color: "#0f7c77", fontSize: 26 }}
                                />
                                <Typography
                                  fontWeight={600}
                                  sx={{ color: "rgba(255,255,255,0.95)" }}
                                >
                                  {r.origen} → {r.destino}
                                </Typography>
                              </Box>

                              <Typography
                                variant="body2"
                                sx={{
                                  mt: 1,
                                  color: "rgba(255,255,255,0.7)",
                                  fontWeight: 400,
                                }}
                              ></Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Paper
                        elevation={0}
                        sx={{
                          mt: 2,
                          p: 4,
                          borderRadius: 3,
                          textAlign: "center",
                          background: "rgba(0,0,0,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          backdropFilter: "blur(10px)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        <Typography variant="h6" fontWeight={600}>
                          No se encontraron rutas más buscadas
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "rgba(255,255,255,0.6)" }}
                        >
                          Aún no hay información disponible sobre las rutas más
                          consultadas. Intenta nuevamente más tarde.
                        </Typography>
                      </Paper>
                    )}
                  </Paper>
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        )}

        {/* Resultado vuelos buscados */}
        {view === "home" && (
          <>
            {/* Resultado de vuelos buscados */}
            {flights.length > 0 ? (
              flights.map((f) => (
                <Paper
                  key={f.id}
                  elevation={10}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    marginTop: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    cursor: "pointer",
                    transition: "all 0.25s ease-in-out",
                    border: "1px solid transparent",
                    background: "rgba(0,0,0,0.45)",
                    backdropFilter: "blur(8px)",
                    "&:hover": {
                      boxShadow: 8,
                      borderColor: "#0f7c77",
                      transform: "translateY(-3px)",
                      background: "rgba(15,124,119,0.1)",
                    },
                  }}
                >
                  {/* Origen */}
                  <Stack spacing={0.5} alignItems="flex-start">
                    <Typography variant="h4" fontWeight={700} color="#fff">
                      {f.departTime}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="rgba(255,255,255,0.6)"
                    >
                      {f.departCode}
                    </Typography>
                  </Stack>

                  {/* Línea central */}
                  <Box
                    sx={{
                      flex: 1,
                      px: { xs: 2, sm: 3 },
                      minWidth: 220,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Typography
                        variant="body2"
                        sx={{ color: "#0f7c77", fontWeight: 600 }}
                      >
                        {f.type}
                      </Typography>
                      <Typography variant="body2" color="rgba(255,255,255,0.6)">
                        | {f.duration}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "100%",
                        position: "relative",
                      }}
                    >
                      <Box
                        sx={{
                          height: 2,
                          flex: 1,
                          background:
                            "linear-gradient(to right, #0f7c77 40%, transparent 100%)",
                          opacity: 0.5,
                        }}
                      />
                      <FlightTakeoffIcon
                        sx={{
                          mx: 1,
                          color: "#0f7c77",
                          transform: "rotate(90deg)",
                        }}
                      />
                      <Box
                        sx={{
                          height: 2,
                          flex: 1,
                          background:
                            "linear-gradient(to left, #0f7c77 40%, transparent 100%)",
                          opacity: 0.5,
                        }}
                      />
                    </Box>

                    <Chip
                      label={f.operator}
                      size="small"
                      variant="outlined"
                      sx={{
                        mt: 1,
                        fontSize: "0.7rem",
                        borderColor: "rgba(255,255,255,0.25)",
                        color: "rgba(255,255,255,0.8)",
                      }}
                    />
                  </Box>

                  {/* Destino */}
                  <Stack spacing={0.5} alignItems="flex-end">
                    <Typography variant="h4" fontWeight={700} color="#fff">
                      {f.arriveTime}
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="rgba(255,255,255,0.6)"
                    >
                      {f.arriveCode}
                    </Typography>
                  </Stack>

                  <Divider
                    orientation="vertical"
                    flexItem
                    sx={{
                      mx: 3,
                      height: 50,
                      display: { xs: "none", sm: "block" },
                      borderColor: "#0f7c77",
                    }}
                  />

                  {/* Precio y botón */}
                  <Stack
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    sx={{
                      minWidth: 180,
                    }}
                  >
                    <Typography variant="caption" color="rgba(255,255,255,0.7)">
                      Desde
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="#fff">
                      {f.price}
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{
                        mt: 0.5,
                        backgroundColor: "#0f7c77",
                        textTransform: "none",
                        px: 3,
                        fontWeight: 600,
                        borderRadius: 2,
                        "&:hover": {
                          backgroundColor: "#0c615e",
                        },
                      }}
                      onClick={() =>
                        alert(`Comprar vuelo ${f.departCode} - ${f.arriveCode}`)
                      }
                    >
                      Comprar
                    </Button>
                  </Stack>
                </Paper>
              ))
            ) : (
              <Paper
                elevation={6}
                sx={{
                  mt: 3,
                  p: 4,
                  borderRadius: 3,
                  textAlign: "center",
                  background: "rgba(0,0,0,0.5)",
                  backdropFilter: "blur(8px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.85)",
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  No se encontraron resultados de vuelos
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ mt: 1, color: "rgba(255,255,255,0.6)" }}
                >
                  Intenta ajustar los filtros o realizar una nueva búsqueda.
                </Typography>
              </Paper>
            )}
          </>
        )}
      </Box>
      <LoadingModal open={loading} message={message} />
      <Notification
        titulo={titulo}
        mensaje={mensaje}
        tipo={tipo}
        abierto={abierto}
        onCerrar={cerrarNotificacion}
      />
    </AnimatedContainer>
  );
};

export default Home;
