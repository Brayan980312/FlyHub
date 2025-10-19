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
  Container,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { es } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import { ExpandLess, ExpandMore, FlightTakeoff } from "@mui/icons-material";
import { useAppUI } from "../../context/useAppUI";
import type { ResponseAllFlightAvailable } from "../../api/types/flight";
import type { ResponseMostSearchFlights } from "../../api/types/mostSearchFlights";
import type { responseAllCity } from "../../api/types/city";
import { searchMostSearchFlights } from "../../api/services/mostSearchFlightsService";
import type { ErrorResponse } from "../../api/types/errorResponse";
import { searchCity } from "../../api/services/ciudadService";
import { searchFlightAvailable } from "../../api/services/flightService";

const BusquedaVuelos: React.FC = () => {
  const theme = useTheme();
  const { mostrarNotificacion } = useAppUI();

  /** Estado de busqueda de vuelos */
  const [origen, setOrigen] = useState<number | null>(0);
  const [destino, setDestino] = useState<number | null>(0);
  const [fecha, setFecha] = useState<Date | null>(null);
  const [pasajeros, setPasajeros] = useState<string>("1");
  const [vuelosDisponibles, setVuelosDisponibles] = useState<
    ResponseAllFlightAvailable[]
  >([]);

  /** Estado para abrir panel de vuelos más buscados*/
  const [open, setOpen] = useState(false);
  const [vuelosMasBuscados, setVuelosMasBuscados] = useState<
    ResponseMostSearchFlights[]
  >([]);

  const [ciudades, setCiudades] = useState<responseAllCity[]>([]);

  useEffect(() => {
    handleSearchCiudades();
  }, []);

  useEffect(() => {
    if (open) {
      handleMostSearchFlights();
    }
  }, [open]);

  const handleMostSearchFlights = async () => {
    try {
      const response = await searchMostSearchFlights();
      setVuelosMasBuscados(response);
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

  const handleSearchCiudades = async () => {
    const data = await searchCity({ ciudadEstado: true });
    setCiudades(data);
  };

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

    handleSearchFlights();
  };

  const handleSearchFlights = async () => {
    try {
      const fechaFormateada = fecha
        ? new Date(fecha).toISOString().split("T")[0]
        : null;

      const dataObtenida: ResponseAllFlightAvailable[] =
        await searchFlightAvailable({
          CiudadOrigenId: origen!,
          CiudadDestinoId: destino!,
          VueloFechaSalida: fechaFormateada!,
          CantidadPasajeros: pasajeros,
        });
      setVuelosDisponibles(dataObtenida);
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

  const getDuracionVuelo = (
    salida: Date | string,
    llegada: Date | string
  ): string => {
    const salidaDate = new Date(salida);
    const llegadaDate = new Date(llegada);

    if (isNaN(salidaDate.getTime()) || isNaN(llegadaDate.getTime())) return "";

    const diffMs = llegadaDate.getTime() - salidaDate.getTime();

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(
      (diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h ${diffMinutes}m`;
    }

    return `${diffHours}h ${diffMinutes}m`;
  };

  const formatCOP = (valor: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const isFormValid =
    origen! > 0 && destino! > 0 && fecha && Number(pasajeros) > 0;

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
          <Grid container spacing={3}>
            {/* ORIGEN */}
            <Grid item xs={12} sm={6} md={3}>
              <Autocomplete
                options={ciudades.filter((a) => a.ciudadId !== destino)}
                getOptionLabel={(option) => option.ciudadNombreNomenclatura}
                value={ciudades.find((a) => a.ciudadId === origen) || null}
                onChange={(_, newValue) => {
                  setOrigen(newValue ? newValue.ciudadId : null);
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
                options={ciudades.filter((a) => a.ciudadId !== origen)}
                getOptionLabel={(option) => option.ciudadNombreNomenclatura}
                value={ciudades.find((a) => a.ciudadId === destino) || null}
                onChange={(_, newValue) => {
                  setDestino(newValue ? newValue.ciudadId : null);
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
        </CardContent>
      </Card>
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
            Vuelos más buscados
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
                  Top vuelos más buscados
                </Typography>
                <Divider
                  sx={{ mb: 2, borderColor: "rgba(255,255,255,0.15)" }}
                />

                {vuelosMasBuscados.length > 0 ? (
                  <Grid
                    container
                    spacing={2}
                    justifyContent="center"
                    alignItems="center"
                  >
                    {vuelosMasBuscados.map((r, i) => (
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
                              {r.ciudadOrigenNomenclatura} →{" "}
                              {r.ciudadDestinoNomenclatura}
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

      {/* Resultado vuelos buscados */}
      {vuelosDisponibles.length > 0 ? (
        vuelosDisponibles.map((f) => (
          <Paper
            key={f.vueloId}
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
                {f.vueloFechaHoraSalida &&
                  new Date(f.vueloFechaHoraSalida).toLocaleTimeString("es-CO", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  })}
              </Typography>
              <Typography variant="subtitle1" color="rgba(255,255,255,0.6)">
                {f.ciudadOrigenNomenclatura}
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
                  Directo
                </Typography>
                <Typography variant="body2" color="rgba(255,255,255,0.6)">
                  |{" "}
                  {getDuracionVuelo(
                    f.vueloFechaHoraSalida,
                    f.vueloFechaHoraLlegada
                  )}
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
                label="Operado por FlyHub"
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
                {f.vueloFechaHoraLlegada &&
                  new Date(f.vueloFechaHoraLlegada).toLocaleTimeString(
                    "es-CO",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    }
                  )}
              </Typography>
              <Typography variant="subtitle1" color="rgba(255,255,255,0.6)">
                {f.ciudadDestinoNomenclatura}
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
              spacing={0.8}
              alignItems="center"
              justifyContent="center"
              sx={{
                minWidth: 160,
                p: 1,
                position: "relative",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255,255,255,0.6)",
                  letterSpacing: "0.4px",
                  fontSize: "0.7rem",
                }}
              >
                Desde
              </Typography>

              {f.vueloDescuento && f.vueloDescuento > 0 ? (
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.2,
                  }}
                >
                  {/* Precio original tachado */}
                  <Typography
                    variant="body2"
                    sx={{
                      color: "rgba(255,255,255,0.4)",
                      textDecoration: "line-through",
                      fontSize: "0.8rem",
                    }}
                  >
                    {formatCOP(f.vueloPrecio)}
                  </Typography>

                  {/* Precio con descuento */}
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      color: "#00e676",
                      textShadow: "0 0 6px rgba(0,230,118,0.25)",
                      fontSize: "1.1rem",
                      animation: "fadeIn 0.4s ease-in-out",
                      "@keyframes fadeIn": {
                        from: {
                          opacity: 0,
                          transform: "translateY(4px)",
                        },
                        to: { opacity: 1, transform: "translateY(0)" },
                      },
                    }}
                  >
                    {formatCOP(
                      Math.round(f.vueloPrecio * (1 - f.vueloDescuento / 100))
                    )}
                  </Typography>

                  {/* Etiqueta de descuento */}
                  <Chip
                    label={`-${f.vueloDescuento}%`}
                    size="small"
                    sx={{
                      mt: 0.2,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: "#00e676",
                      borderColor: "rgba(0,230,118,0.3)",
                      borderWidth: 1,
                      borderStyle: "solid",
                      background: "rgba(15,124,119,0.15)",
                      px: 0.6,
                      py: 0,
                      height: 20,
                      borderRadius: 1.5,
                    }}
                  />
                </Box>
              ) : (
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{
                    color: "#fff",
                    fontSize: "1.1rem",
                    textShadow: "0 0 4px rgba(255,255,255,0.2)",
                  }}
                >
                  {formatCOP(f.vueloPrecio)}
                </Typography>
              )}

              {/* Botón comprar */}
              <Button
                variant="contained"
                sx={{
                  mt: 0.6,
                  backgroundColor: "#0f7c77",
                  textTransform: "none",
                  px: 2.2,
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: "0.8rem",
                  borderRadius: 1.5,
                  boxShadow: "0 0 6px rgba(15,124,119,0.3)",
                  "&:hover": {
                    backgroundColor: "#0c615e",
                    transform: "translateY(-1px)",
                    boxShadow: "0 0 10px rgba(15,124,119,0.4)",
                  },
                }}
                onClick={() => alert(`Comprar vuelo`)}
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
    </Container>
  );
};

export default BusquedaVuelos;
