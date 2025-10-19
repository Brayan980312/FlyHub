import React, { useState, useEffect, type ReactElement, useMemo } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Card,
  CardContent,
  IconButton,
  Box,
  Tooltip,
  Chip,
  useTheme,
  Stack,
  TableContainer,
  Button,
  TextField,
  Autocomplete,
  Alert,
} from "@mui/material";
import {
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Lock as LockIcon,
  AirlineSeatReclineNormal as AirlineSeatReclineNormalIcon,
  PlayCircle as PlayCircleIcon,
  EventSeat as EventSeatIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import HistoryIcon from "@mui/icons-material/History";
import { useAppUI } from "../../context/useAppUI";
import type { ResponseAllFlight } from "../../api/types/flight";
import {
  createFlight,
  searchFlight,
  updateFlight,
  updateStateFlight,
} from "../../api/services/flightService";
import type { ErrorResponse } from "../../api/types/errorResponse";
import { ModalSimulacionVuelo } from "./flightSimulation";
import AsientosVueloDialog from "./seatFlight";
import type { responseAllPlane } from "../../api/types/plane";
import type { responseAllCity } from "../../api/types/city";
import { searchPlane } from "../../api/services/planeService";
import { searchCity } from "../../api/services/ciudadService";
import HistorialVuelosDialog from "./historyFlight";

const VueloForm: React.FC = () => {
  const theme = useTheme();
  const { mostrarNotificacion } = useAppUI();

  // Estados principales
  const [vuelos, setVuelos] = useState<ResponseAllFlight[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Siimulación de vuelo
  const [openSimulacion, setOpenSimulacion] = useState(false);
  const [vueloSeleccionado, setVueloSeleccionado] = useState<number | null>(
    null
  );
  const [vueloSeleccionadoCodigo, setVueloSeleccionadoCodigo] = useState<
    string | null
  >(null);
  const [vueloSeleccionadoAvion, setVueloSeleccionadoAvion] = useState<
    string | null
  >(null);

  const [aviones, setAviones] = useState<responseAllPlane[]>([]);
  const [ciudades, setCiudades] = useState<responseAllCity[]>([]);

  const [vueloId, setVueloId] = useState<number>(0);
  const [codigo, setCodigo] = useState("");
  const [avionSeleccionado, setAvionSeleccionado] =
    useState<responseAllPlane | null>(null);
  const [ciudadOrigen, setCiudadOrigen] = useState<responseAllCity | null>(
    null
  );
  const [ciudadDestino, setCiudadDestino] = useState<responseAllCity | null>(
    null
  );
  const [precio, setPrecio] = useState("");
  const [descuento, setDescuento] = useState<number | string>(0);
  const [fechaHoraSalida, setFechaHoraSalida] = useState("");
  const [fechaHoraLlegada, setFechaHoraLlegada] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [ventanaMostrar, setVentanaMostrar] = useState<
    "create" | "update" | "search"
  >("search");
  const [estadoVueloSeleccionado, setEstadoVueloSeleccionado] =
    useState<number>(0);

  // Validación de asientos
  const [openAsientos, setOpenAsientos] = useState(false);

  // Validacion historial
  const [openHistorico, setopenHistorico] = useState(false);

  useEffect(() => {
    handleSearchVuelos();
    handleSearchAviones();
    handleSearchCiudades();
  }, []);

  const handleSearchAviones = async () => {
    const data = await searchPlane({ AvionEstado: true });
    setAviones(data);
  };

  const handleSearchCiudades = async () => {
    const data = await searchCity({ CiudadEstado: true });
    setCiudades(data);
  };

  const handleSearchVuelos = async () => {
    try {
      const data: ResponseAllFlight[] = await searchFlight();
      setVuelos(data);
    } catch (error) {
      const err = error as ErrorResponse;
      if (
        (err.status === 422 || err.status === 403 || err.status === 401) &&
        err.detail
      ) {
        mostrarNotificacion(err.title, err.detail, "warning");
      } else {
        mostrarNotificacion(
          "Error en la apicación",
          "Error desconocido.",
          "error"
        );
      }
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Función que determina qué cambios de estado están permitidos
  const puedeCambiarA = (
    estadoActual: number,
    nuevoEstado: number
  ): boolean => {
    const reglas: Record<number, number[]> = {
      1: [2, 3, 8], // Programado → Disponible, Cerrado, Cancelado
      2: [3, 4, 8], // Disponible → Cerrado, En Embarque, Cancelado
      3: [2, 4, 8], // Cerrado → Disponible, En Embarque, Cancelado
      4: [5], // En Embarque → Despegado
      5: [6], // Despegado → Aterrizado
      6: [7], // Aterrizado → Finalizado
      7: [], // Finalizado → Ninguno
      8: [], // Cancelado → Ninguno
    };

    return reglas[estadoActual]?.includes(nuevoEstado) ?? false;
  };

  const handleCambiarEstado = async (vueloId: number, nuevoEstado: number) => {
    try {
      await updateStateFlight({ VueloId: vueloId, EstadoVueloId: nuevoEstado });
      mostrarNotificacion(
        "Éxito",
        "El estado del vuelo fue actualizado.",
        "success"
      );
      handleSearchVuelos();
    } catch (error) {
      const err = error as ErrorResponse;
      if (
        (err.status === 422 || err.status === 403 || err.status === 401) &&
        err.detail
      ) {
        mostrarNotificacion(err.title, err.detail, "warning");
      } else {
        mostrarNotificacion(
          "Error en la apicación",
          "Error desconocido.",
          "error"
        );
      }
    }
  };

  const getEstadoChip = (estadoId: number) => {
    const estados: Record<
      number,
      {
        nombre: string;
        bg: string;
        color: string;
        icon: ReactElement;
      }
    > = {
      1: {
        nombre: "Programado",
        bg: "rgba(59,130,246,0.1)",
        color: "#3B82F6",
        icon: <EventAvailableIcon sx={{ fontSize: 18 }} />,
      },
      2: {
        nombre: "Disponible",
        bg: "rgba(22,163,74,0.1)",
        color: "#16A34A",
        icon: <AirplaneTicketIcon sx={{ fontSize: 18 }} />,
      },
      3: {
        nombre: "Cerrado",
        bg: "rgba(249,115,22,0.1)",
        color: "#F97316",
        icon: <HourglassBottomIcon sx={{ fontSize: 18 }} />,
      },
      4: {
        nombre: "En Embarque",
        bg: "rgba(37,99,235,0.1)",
        color: "#2563EB",
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />,
      },
      5: {
        nombre: "Despegado",
        bg: "rgba(13,148,136,0.1)",
        color: "#0D9488",
        icon: <FlightTakeoffIcon sx={{ fontSize: 18 }} />,
      },
      6: {
        nombre: "Aterrizado",
        bg: "rgba(6,182,212,0.1)",
        color: "#06B6D4",
        icon: <FlightLandIcon sx={{ fontSize: 18 }} />,
      },
      7: {
        nombre: "Finalizado",
        bg: "rgba(124,58,237,0.1)",
        color: "#7C3AED",
        icon: <DoneAllIcon sx={{ fontSize: 18 }} />,
      },
      8: {
        nombre: "Cancelado",
        bg: "rgba(220,38,38,0.1)",
        color: "#DC2626",
        icon: <CancelRoundedIcon sx={{ fontSize: 18 }} />,
      },
    };

    const estado = estados[estadoId] ?? {
      nombre: "Desconocido",
      bg: "rgba(107,114,128,0.1)",
      color: "#374151",
      icon: <HourglassBottomIcon sx={{ fontSize: 18 }} />,
    };

    return (
      <Tooltip title={estado.nombre}>
        <Chip
          icon={estado.icon}
          sx={{
            fontWeight: 600,
            borderRadius: "10px",
            px: 1,
            py: 0.5,
            color: estado.color,
            backgroundColor: estado.bg,
            "& .MuiChip-icon": {
              color: estado.color,
              ml: 2,
            },
            "&:hover": {
              backgroundColor: estado.bg.replace("0.1", "0.2"),
              transform: "scale(1.05)",
              transition: "all 0.2s ease-in-out",
            },
            boxShadow: `0 0 8px ${estado.bg.replace("0.1", "0.3")}`,
          }}
        />
      </Tooltip>
    );
  };

  const formatFechaCorta = (fecha: Date) => {
    return fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatFechaLarga = (fecha: Date) => {
    return (
      fecha.toLocaleDateString("es-CO", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
      }) +
      " " +
      fecha.toLocaleTimeString("es-CO", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    );
  };

  const FechaConTooltip = ({ fecha }: { fecha: Date }) => {
    return (
      <Tooltip title={formatFechaLarga(fecha)} arrow>
        <Box
          sx={{
            display: "inline-block",
            borderRadius: "8px",
            px: 1.2,
            py: 0.6,
            cursor: "pointer",
            backgroundColor: "rgba(255, 255, 255, 0.05)", // leve fondo blanco translúcido
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.15)", // más notorio al hover
              boxShadow: "0 0 8px rgba(255, 255, 255, 0.2)", // sutil glow
              transform: "scale(1.02)",
            },
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <AccessTimeRoundedIcon
              sx={{
                fontSize: 18,
                color: "#3b82f6", // azul brillante para indicar interactividad
              }}
            />
            <span>{formatFechaCorta(fecha)}</span>
          </Stack>
        </Box>
      </Tooltip>
    );
  };

  const handleSimularVuelo = (
    vueloId: number,
    estado: number,
    codigo: string,
    avion: string
  ) => {
    setVueloSeleccionado(vueloId);
    setEstadoVueloSeleccionado(estado);
    setVueloSeleccionadoCodigo(codigo);
    setVueloSeleccionadoAvion(avion);
    setOpenSimulacion(true);
  };

  const handleCerrarSimulacion = () => {
    setOpenSimulacion(false);
    setVueloSeleccionado(null);
    handleSearchVuelos();
  };

  const handleCerrarVerAsientos = () => {
    setOpenAsientos(false);
    setVueloSeleccionado(null);
    setVueloSeleccionadoCodigo(null);
  };

  const handleCerrarHistorico = () => {
    setopenHistorico(false);
    setVueloSeleccionado(null);
    setVueloSeleccionadoCodigo(null);
  };

  const handleVerAsientosVuelo = (vueloId: number, vueloCodigo: string) => {
    setVueloSeleccionado(vueloId);
    setVueloSeleccionadoCodigo(vueloCodigo);
    setOpenAsientos(true);
  };

  const handleVerHistorico = (vueloId: number, vueloCodigo: string) => {
    setVueloSeleccionado(vueloId);
    setVueloSeleccionadoCodigo(vueloCodigo);
    setopenHistorico(true);
  };

  const handleNuevo = () => {
    setVentanaMostrar("create");
  };

  // Filtrar ciudades dependiendo de la otra selección
  const ciudadesOrigenFiltradas = useMemo(
    () => ciudades.filter((c) => c.ciudadId !== ciudadDestino?.ciudadId),
    [ciudades, ciudadDestino]
  );

  const ciudadesDestinoFiltradas = useMemo(
    () => ciudades.filter((c) => c.ciudadId !== ciudadOrigen?.ciudadId),
    [ciudades, ciudadOrigen]
  );

  // Validación de número positivo
  const handlePrecioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0))
      setPrecio(value);
  };

  const handleDescuentoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);

    // Si el campo está vacío o no es número
    if (isNaN(value)) {
      setDescuento("");
      setErrors((prev) => ({
        ...prev,
        descuento: "",
      }));
      return;
    }

    // Validaciones de rango
    if (value < 0) {
      setDescuento(0);
      setErrors((prev) => ({
        ...prev,
        descuento: "El descuento no puede ser negativo",
      }));
    } else if (value > 100) {
      setDescuento(100);
      setErrors((prev) => ({
        ...prev,
        descuento: "El descuento no puede superar 100",
      }));
    } else {
      setDescuento(value);
      setErrors((prev) => ({ ...prev, descuento: "" }));
    }
  };

  // Verificación automática del formulario completo
  useEffect(() => {
    const valid: boolean =
      codigo.trim().length > 0 &&
      codigo.trim().length <= 20 &&
      avionSeleccionado !== null &&
      ciudadOrigen !== null &&
      ciudadDestino !== null &&
      ciudadOrigen?.ciudadId !== ciudadDestino?.ciudadId &&
      precio.trim() !== "" &&
      parseFloat(precio) > 0 &&
      fechaHoraSalida !== "" &&
      fechaHoraLlegada !== "" &&
      new Date(fechaHoraSalida) < new Date(fechaHoraLlegada);

    setIsFormValid(Boolean(valid));
  }, [
    codigo,
    avionSeleccionado,
    ciudadOrigen,
    ciudadDestino,
    precio,
    fechaHoraSalida,
    fechaHoraLlegada,
  ]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!codigo.trim()) newErrors.codigo = "El código es obligatorio.";
    if (codigo.length > 20)
      newErrors.codigo = "Máximo 20 caracteres permitidos.";
    if (!avionSeleccionado) newErrors.avion = "Debe seleccionar un avión.";
    if (!ciudadOrigen)
      newErrors.ciudadOrigen = "Debe seleccionar la ciudad de origen.";
    if (!ciudadDestino)
      newErrors.ciudadDestino = "Debe seleccionar la ciudad de destino.";
    if (
      ciudadOrigen &&
      ciudadDestino &&
      ciudadOrigen.ciudadId === ciudadDestino.ciudadId
    )
      newErrors.ciudadDestino =
        "La ciudad destino no puede ser igual a la de origen.";
    if (!precio || parseFloat(precio) <= 0)
      newErrors.precio = "El precio debe ser mayor que 0.";
    if (!fechaHoraSalida)
      newErrors.fechaHoraSalida = "Debe indicar la fecha y hora de salida.";
    if (!fechaHoraLlegada)
      newErrors.fechaHoraLlegada = "Debe indicar la fecha y hora de llegada.";
    if (
      fechaHoraSalida &&
      fechaHoraLlegada &&
      new Date(fechaHoraSalida) >= new Date(fechaHoraLlegada)
    )
      newErrors.fechaHoraLlegada =
        "La hora de llegada debe ser posterior a la de salida.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      if (ventanaMostrar == "create") {
        await createFlight({
          VueloCodigo: codigo,
          AvionId: avionSeleccionado?.avionId,
          CiudadOrigenId: ciudadOrigen?.ciudadId,
          CiudadDestinoId: ciudadDestino?.ciudadId,
          VueloPrecio: Number(precio),
          VueloDescuento: Number(descuento),
          VueloFechaHoraSalida: fechaHoraSalida,
          VueloFechaHoraLlegada: fechaHoraLlegada,
        });
      } else if (ventanaMostrar == "update") {
        await updateFlight({
          VueloId: vueloId,
          VueloCodigo: codigo,
          CiudadOrigenId: ciudadOrigen?.ciudadId,
          CiudadDestinoId: ciudadDestino?.ciudadId,
          VueloPrecio: Number(precio),
          VueloDescuento: Number(descuento),
          VueloFechaHoraSalida: fechaHoraSalida,
          VueloFechaHoraLlegada: fechaHoraLlegada,
        });
      }
      mostrarNotificacion("Vuelos", "Vuelo guardado correctamente", "success");
      handleCancel();
      handleSearchVuelos();
    } catch (error) {
      const err = error as ErrorResponse;
      if (
        (err.status === 422 || err.status === 403 || err.status === 401) &&
        err.detail
      ) {
        mostrarNotificacion(err.title, err.detail, "warning");
      } else {
        mostrarNotificacion(
          "Error en la aplicación",
          "Error desconocido.",
          "error"
        );
      }
    }
  };

  const handleCancel = () => {
    setVueloId(0);
    setCodigo("");
    setAvionSeleccionado(null);
    setCiudadOrigen(null);
    setCiudadDestino(null);
    setPrecio("");
    setDescuento("");
    setFechaHoraSalida("");
    setFechaHoraLlegada("");
    setErrors({});
    setVentanaMostrar("search");
    setEstadoVueloSeleccionado(0);
  };

  const handleFechaSalidaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFechaHoraSalida(value);

    if (fechaHoraLlegada && new Date(value) >= new Date(fechaHoraLlegada)) {
      setErrors((prev) => ({
        ...prev,
        fechaHoraSalida:
          "La hora de salida no puede ser mayor o igual a la de llegada",
      }));
    } else {
      setErrors((prev) => ({ ...prev, fechaHoraSalida: "" }));
    }
  };

  const handleFechaLlegadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFechaHoraLlegada(value);

    if (fechaHoraSalida && new Date(value) <= new Date(fechaHoraSalida)) {
      setErrors((prev) => ({
        ...prev,
        fechaHoraLlegada:
          "La hora de llegada no puede ser menor o igual a la de salida",
      }));
    } else {
      setErrors((prev) => ({ ...prev, fechaHoraLlegada: "" }));
    }
  };

  const handleEditarVuelo = (objetoVuelo: ResponseAllFlight) => {
    setVueloId(objetoVuelo.vueloId);
    setCodigo(objetoVuelo.vueloCodigo);
    setAvionSeleccionado(
      aviones.find((x) => x.avionId == objetoVuelo.avionId) ?? null
    );
    setCiudadOrigen(
      ciudades.find((x) => x.ciudadId == objetoVuelo.ciudadOrigenId) ?? null
    );
    setCiudadDestino(
      ciudades.find((x) => x.ciudadId == objetoVuelo.ciudadDestinoId) ?? null
    );
    setPrecio(objetoVuelo.vueloPrecio.toString());
    setDescuento(objetoVuelo.vueloDescuento.toString());
    setFechaHoraSalida(objetoVuelo.vueloFechaHoraSalida.toString());
    setFechaHoraLlegada(objetoVuelo.vueloFechaHoraLlegada.toString());
    setEstadoVueloSeleccionado(objetoVuelo.estadoVueloId);
    setVentanaMostrar("update");
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 3,
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? "#111315" : "#ffffff",
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 3, letterSpacing: 0.5 }}
        >
          Vuelos
        </Typography>

        <CardContent sx={{ p: 0 }}>
          {ventanaMostrar == "search" && (
            <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: "#0f7c77",
                  "&:hover": { backgroundColor: "#0c6d69" },
                }}
                onClick={handleNuevo}
              >
                Nuevo Vuelo
              </Button>
            </Box>
          )}

          {ventanaMostrar != "search" && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2,
                mb: 3,
                p: 2,
                border: "1px solid #0f7c77",
                borderRadius: 2,
                backgroundColor:
                  theme.palette.mode === "dark" ? "#1a1d1c" : "#f4f9f8",
              }}
            >
              {/* Código */}
              <TextField
                label="Código"
                disabled={
                  !(
                    estadoVueloSeleccionado === 0 ||
                    estadoVueloSeleccionado === 1
                  )
                }
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.slice(0, 20))}
                error={!!errors.codigo}
                helperText={errors.codigo}
                sx={{ flex: 1, minWidth: 150 }}
              />

              {/* Avión */}
              <Autocomplete
                options={aviones}
                disabled={!(estadoVueloSeleccionado === 0)}
                getOptionLabel={(option) => option.avionNombre}
                value={avionSeleccionado}
                onChange={(_, newValue) => setAvionSeleccionado(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Avión"
                    error={!!errors.avion}
                    helperText={errors.avion}
                    sx={{ minWidth: 250 }}
                  />
                )}
                sx={{ flex: 2 }}
              />

              {/* Ciudad Origen */}
              <Autocomplete
                options={ciudadesOrigenFiltradas}
                disabled={
                  !(
                    estadoVueloSeleccionado === 0 ||
                    estadoVueloSeleccionado === 1
                  )
                }
                getOptionLabel={(option) => option.ciudadNombreNomenclatura}
                value={ciudadOrigen}
                onChange={(_, newValue) => setCiudadOrigen(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ciudad Origen"
                    error={!!errors.ciudadOrigen}
                    helperText={errors.ciudadOrigen}
                    sx={{ minWidth: 250 }}
                  />
                )}
                sx={{ flex: 2 }}
              />

              {/* Ciudad Destino */}
              <Autocomplete
                disabled={
                  !(
                    estadoVueloSeleccionado === 0 ||
                    estadoVueloSeleccionado === 1
                  )
                }
                options={ciudadesDestinoFiltradas}
                getOptionLabel={(option) => option.ciudadNombreNomenclatura}
                value={ciudadDestino}
                onChange={(_, newValue) => setCiudadDestino(newValue)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Ciudad Destino"
                    error={!!errors.ciudadDestino}
                    helperText={errors.ciudadDestino}
                    sx={{ minWidth: 250 }}
                  />
                )}
                sx={{ flex: 2 }}
              />

              {/* Precio */}
              <TextField
                label="Precio"
                value={precio}
                onChange={handlePrecioChange}
                type="number"
                inputProps={{ min: 0.01, step: 0.01 }}
                error={!!errors.precio}
                helperText={errors.precio}
                sx={{
                  flex: 1,
                  minWidth: 150,
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

              {/* Descuento */}
              <TextField
                label="Descuento"
                value={descuento}
                onChange={handleDescuentoChange}
                type="number"
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                error={!!errors.descuento}
                helperText={errors.descuento}
                sx={{
                  flex: 1,
                  minWidth: 150,
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

              {/* Fecha/Hora salida */}
              <TextField
                label="Fecha y Hora de Salida"
                disabled={
                  !(
                    estadoVueloSeleccionado === 0 ||
                    estadoVueloSeleccionado === 1
                  )
                }
                type="datetime-local"
                value={fechaHoraSalida}
                onChange={handleFechaSalidaChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fechaHoraSalida}
                helperText={errors.fechaHoraSalida}
                sx={{ flex: 1.5, minWidth: 200 }}
              />

              {/* Fecha/Hora llegada */}
              <TextField
                label="Fecha y Hora de Llegada"
                disabled={
                  !(
                    estadoVueloSeleccionado === 0 ||
                    estadoVueloSeleccionado === 1
                  )
                }
                type="datetime-local"
                value={fechaHoraLlegada}
                onChange={handleFechaLlegadaChange}
                InputLabelProps={{ shrink: true }}
                error={!!errors.fechaHoraLlegada}
                helperText={errors.fechaHoraLlegada}
                sx={{ flex: 1.5, minWidth: 200 }}
              />

              {/* Botones */}
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  sx={{
                    backgroundColor: isFormValid ? "#0f7c77" : "#9e9e9e",
                    "&:hover": {
                      backgroundColor: isFormValid ? "#0c6d69" : "#9e9e9e",
                    },
                  }}
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                >
                  {ventanaMostrar == "create" ? "Crear" : "Actualizar"}
                </Button>

                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<ArrowBackIcon />}
                  onClick={handleCancel}
                >
                  Volver
                </Button>
              </Box>

              {/* Nota */}
              {ventanaMostrar == "create" && (
                <Alert
                  severity="info"
                  sx={{
                    mt: 2,
                    backgroundColor:
                      theme.palette.mode === "dark" ? "#1e2a28" : "#e6f5f4",
                    border: "1px solid #0f7c77",
                    color:
                      theme.palette.mode === "dark" ? "#b2d8d6" : "#0f7c77",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Nota:</strong> por terminos de seguridad, no se podrá
                  cambiar el avión asociado una vez creado el vuelo.
                </Alert>
              )}
            </Box>
          )}

          {ventanaMostrar == "search" && (
            <>
              <TableContainer sx={{ overflowX: "auto" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Código
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Avión
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Origen
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Destino
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Salida
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Llegada
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Estado
                      </TableCell>
                      <TableCell
                        sx={{
                          color: "white",
                          fontWeight: "bold",
                          textAlign: "center",
                          width: 200,
                        }}
                      >
                        Acciones
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {vuelos
                      .slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage
                      )
                      .map((vuelo) => (
                        <TableRow
                          key={vuelo.vueloId}
                          hover
                          sx={{
                            transition: "background 0.3s",
                            "&:hover": {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "#202322"
                                  : "#f5f9f8",
                            },
                          }}
                        >
                          <TableCell>{vuelo.vueloCodigo}</TableCell>
                          <TableCell>{vuelo.avionNombre}</TableCell>
                          <TableCell>
                            {vuelo.ciudadOrigenNombreNomenclatura}
                          </TableCell>
                          <TableCell>
                            {vuelo.ciudadDestinoNombreNomenclatura}
                          </TableCell>
                          <TableCell>
                            {vuelo.vueloFechaHoraSalida && (
                              <FechaConTooltip
                                fecha={new Date(vuelo.vueloFechaHoraSalida)}
                              />
                            )}
                          </TableCell>

                          <TableCell>
                            {vuelo.vueloFechaHoraLlegada && (
                              <FechaConTooltip
                                fecha={new Date(vuelo.vueloFechaHoraLlegada)}
                              />
                            )}
                          </TableCell>
                          <TableCell>
                            {getEstadoChip(vuelo.estadoVueloId!)}
                          </TableCell>
                          <TableCell align="center">
                            {/* Acciones dependientes del estado */}
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 1,
                              }}
                            >
                              {/* Programar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 2) && (
                                <Tooltip title="Marcar como Disponible">
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 2)
                                    }
                                  >
                                    <ScheduleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Cerrar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 3) && (
                                <Tooltip title="Cerrar vuelo">
                                  <IconButton
                                    color="primary"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 3)
                                    }
                                  >
                                    <LockIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* En Embarque */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 4) && (
                                <Tooltip title="Pasar a En Embarque">
                                  <IconButton
                                    color="info"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 4)
                                    }
                                  >
                                    <AirlineSeatReclineNormalIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Despegar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 5) && (
                                <Tooltip title="Despegar vuelo">
                                  <IconButton
                                    color="success"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 5)
                                    }
                                  >
                                    <FlightTakeoffIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Aterrizar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 6) && (
                                <Tooltip title="Aterrizar vuelo">
                                  <IconButton
                                    color="success"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 6)
                                    }
                                  >
                                    <FlightLandIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Finalizar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 7) && (
                                <Tooltip title="Finalizar vuelo">
                                  <IconButton
                                    color="secondary"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 7)
                                    }
                                  >
                                    <DoneAllIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Cancelar */}
                              {puedeCambiarA(vuelo.estadoVueloId!, 8) && (
                                <Tooltip title="Cancelar vuelo">
                                  <IconButton
                                    color="error"
                                    onClick={() =>
                                      handleCambiarEstado(vuelo.vueloId!, 8)
                                    }
                                  >
                                    <CancelIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Simular vuelo */}
                              {[2, 3, 4, 5, 6].includes(
                                vuelo.estadoVueloId!
                              ) && (
                                <Tooltip title="Simular vuelo">
                                  <IconButton
                                    sx={{ color: "#ff9800" }}
                                    onClick={() =>
                                      handleSimularVuelo(
                                        vuelo.vueloId!,
                                        vuelo.estadoVueloId!,
                                        vuelo.vueloCodigo!,
                                        vuelo.avionNombre!
                                      )
                                    }
                                  >
                                    <PlayCircleIcon />
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Editar Vuelo */}
                              {[1, 2, 3].includes(vuelo.estadoVueloId) && (
                                <Tooltip title="Editar Vuelo">
                                  <IconButton>
                                    <EditIcon
                                      sx={{ color: "#0f7c77" }}
                                      onClick={() => handleEditarVuelo(vuelo)}
                                    ></EditIcon>
                                  </IconButton>
                                </Tooltip>
                              )}

                              {/* Ver asientos */}
                              <Tooltip title="Ver asientos del avión">
                                <IconButton
                                  sx={{ color: "#0f7c77" }}
                                  onClick={() =>
                                    handleVerAsientosVuelo(
                                      vuelo.vueloId!,
                                      vuelo.vueloCodigo
                                    )
                                  }
                                >
                                  <EventSeatIcon />
                                </IconButton>
                              </Tooltip>

                              {/* Ver asientos */}
                              <Tooltip title="Ver Historico">
                                <IconButton
                                  sx={{ color: "#0f7c77" }}
                                  onClick={() =>
                                    handleVerHistorico(
                                      vuelo.vueloId!,
                                      vuelo.vueloCodigo
                                    )
                                  }
                                >
                                  <HistoryIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={vuelos.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 25]}
              />
            </>
          )}
        </CardContent>
      </Card>
      <ModalSimulacionVuelo
        open={openSimulacion}
        onClose={handleCerrarSimulacion}
        estadoActual={estadoVueloSeleccionado}
        vueloId={vueloSeleccionado}
        vueloCodigo={vueloSeleccionadoCodigo}
        avionNombre={vueloSeleccionadoAvion}
      />
      <AsientosVueloDialog
        open={openAsientos}
        vueloId={vueloSeleccionado}
        vueloCodigo={vueloSeleccionadoCodigo!}
        onClose={handleCerrarVerAsientos}
      />
      <HistorialVuelosDialog
        open={openHistorico}
        vueloId={vueloSeleccionado}
        vueloCodigo={vueloSeleccionadoCodigo!}
        onClose={handleCerrarHistorico}
      />
    </Container>
  );
};

export default VueloForm;
