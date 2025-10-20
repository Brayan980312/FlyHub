import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Grid,
  TextField,
  Chip,
  Tooltip,
  useTheme,
  Alert,
} from "@mui/material";
import { Chair as ChairIcon, Star as StarIcon } from "@mui/icons-material";
import type { ResponseAllFlightAvailable } from "../../api/types/flight";
import type { ErrorResponse } from "../../api/types/errorResponse";
import { useAppUI } from "../../context/useAppUI";
import { searchParams } from "../../api/services/parametrosService";
import type { responseAllParams } from "../../api/types/params";
import type { responseSeatFlight } from "../../api/types/seatFlight";
import { searchSeatFlight } from "../../api/services/seatFlight";
import type {
  requestCompraAsientos,
  requestReservarAsientos,
} from "../../api/types/buySeatFlight";
import {
  buySeatFlight,
  reserveSeatFlight,
} from "../../api/services/buySeatsFlightsService";

interface Props {
  vuelo?: ResponseAllFlightAvailable | null;
  pasajeros: number;
  cancelar: () => void;
}

const CompraAsientosForm: React.FC<Props> = ({
  vuelo,
  pasajeros,
  cancelar,
}) => {
  const theme = useTheme();
  const { mostrarNotificacion } = useAppUI();
  const [activeStep, setActiveStep] = useState(0);
  //   const [asientos, setAsientos] = useState<Asiento[]>([]);
  const [asientosSeleccionados, setAsientosSeleccionados] = useState<
    responseSeatFlight[]
  >([]);
  const [asientos, setAsientos] = useState<responseSeatFlight[]>([]);
  const [datosPasajeros, setDatosPasajeros] = useState<
    { asientoId: number; nombre: string; identificacion: string }[]
  >([]);
  const [tiempoRestante, setTiempoRestante] = useState<number>(0);
  const [parametros, setParametros] = useState<responseAllParams>();

  const steps = ["Seleccionar Asientos", "Datos de Pasajeros", "Resumen"];

  const handleCancelarCompra = () => {
    setActiveStep(0);
    setAsientosSeleccionados([]);
    setDatosPasajeros([]);
    setTiempoRestante(0);
    cancelar();
  };

  // Simulación de asientos (en tu caso esto vendrá del API)
  useEffect(() => {
    handleSearchSeatsFlights();
    handleSearchParametros();
  }, []);

  // Control del temporizador
  useEffect(() => {
    if (tiempoRestante > 0) {
      const timer = setTimeout(
        () => setTiempoRestante(tiempoRestante - 1),
        1000
      );
      return () => clearTimeout(timer);
    } else if (tiempoRestante === 0 && activeStep > 0) {
      handleCancelarCompra();
    }
  }, [tiempoRestante]);

  // Sincronizar pasajeros con asientos seleccionados
  useEffect(() => {
    const nuevosDatos = asientosSeleccionados.map((a) => {
      const existente = datosPasajeros.find(
        (p) => p.asientoId === a.vueloAsientoId
      );
      return (
        existente || {
          asientoId: a.vueloAsientoId,
          nombre: "",
          identificacion: "",
        }
      );
    });
    setDatosPasajeros(nuevosDatos);
  }, [asientosSeleccionados]);

  const handleSelectAsiento = (asiento: responseSeatFlight) => {
    if (asiento.vueloAsientoEstado !== "Disponible") return;
    const yaSeleccionado = asientosSeleccionados.find(
      (a) => a.vueloAsientoId === asiento.vueloAsientoId
    );
    if (yaSeleccionado) {
      setAsientosSeleccionados(
        asientosSeleccionados.filter(
          (a) => a.vueloAsientoId !== asiento.vueloAsientoId
        )
      );
    } else {
      if (asientosSeleccionados.length >= pasajeros) return;
      setAsientosSeleccionados([...asientosSeleccionados, asiento]);
    }
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (asientosSeleccionados.length !== pasajeros) return;
      setTiempoRestante(Number(parametros?.parametrosValor)); // 5 minutos
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => prev - 1);

  const handleChangeDato = (
    asientoId: number,
    field: "nombre" | "identificacion",
    value: string
  ) => {
    setDatosPasajeros((prev) => {
      const copia = [...prev];
      const idx = copia.findIndex((p) => p.asientoId === asientoId);
      if (idx !== -1) copia[idx][field] = value;
      return copia;
    });
  };

  const calcularPrecioAsiento = (a: responseSeatFlight) => {
    const precioBase = vuelo!.vueloPrecio;
    const descuento = vuelo!.vueloDescuento || 0; // Porcentaje
    const precioConDescuento = precioBase - (precioBase * descuento) / 100;

    // Si es VIP, se aplica el porcentaje adicional sobre el precio con descuento
    if (a.asientoAvionVIP) {
      const porcentajeVip = Number(a.asientoAvionVIPPorcentaje) || 0;
      return precioConDescuento + (precioConDescuento * porcentajeVip) / 100;
    }

    return precioConDescuento;
  };

  const totalCompra = asientosSeleccionados.reduce(
    (acc, a) => acc + calcularPrecioAsiento(a),
    0
  );

  const formatCOP = (valor: number): string => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  };

  const pasajerosCompletos =
    datosPasajeros.length === asientosSeleccionados.length &&
    datosPasajeros.every(
      (p) => p.nombre.trim() !== "" && p.identificacion.trim() !== ""
    );

  // Función para construir el objeto de reserva de asientos
  const handleReservarAsientos = async () => {
    const bloqueadoHasta = new Date(
      Date.now() + Number(parametros?.parametrosValor) * 1000
    ).toISOString();

    const reserva: requestReservarAsientos = {
      vueloId: vuelo!.vueloId,
      listaAsientoVuelo: asientosSeleccionados.map((a) => ({
        vueloAsientoId: a.vueloAsientoId,
        rowVersion: a.rowVersion,
        bloqueadoHasta,
      })),
    };

    try {
      const dataObtenida: responseSeatFlight[] = await reserveSeatFlight(
        reserva
      );

      // Actualiza los rowVersion en los asientosSeleccionados
      const asientosActualizados = asientosSeleccionados.map((asiento) => {
        const actualizado = dataObtenida.find(
          (a) => a.vueloAsientoId === asiento.vueloAsientoId
        );
        return actualizado
          ? { ...asiento, rowVersion: actualizado.rowVersion }
          : asiento;
      });

      // Actualiza el estado de los asientos con su rowVersion alterada
      setAsientosSeleccionados(asientosActualizados);
      handleNext();
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

  // Función para construir el objeto de compra final
  const handleGuardarCompra = async () => {
    const compra: requestCompraAsientos = {
      vueloId: vuelo!.vueloId,
      compraTotal: totalCompra,
      detalleAsientos: asientosSeleccionados.map((a) => {
        const pasajero = datosPasajeros.find(
          (p) => p.asientoId === a.vueloAsientoId
        );
        return {
          vueloAsientoId: a.vueloAsientoId,
          compraDetalleNombrePasajero: pasajero?.nombre || "",
          compraDetalleIdentificacionPasajero: pasajero?.identificacion || "",
          compraDetallePrecio: calcularPrecioAsiento(a),
          rowVersion: a.rowVersion,
        };
      }),
    };

    try {
      await buySeatFlight(compra);
      mostrarNotificacion(
        "Compra vuelo.",
        "Se registro correctamente la compra de los asientos.",
        "success"
      );
      handleCancelarCompra();
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

  // Función para obtener el parametro de tiempo que tiene el usuario para realizar la compra de los asientos una vez pasa al paso 2
  const handleSearchParametros = async () => {
    try {
      const dataObtenida: responseAllParams[] = await searchParams({
        ParametrosNombre: "TiempoCompraVuelo",
      });
      setParametros(dataObtenida[0]);
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

  // Función para obtener los asientos del vuelo
  const handleSearchSeatsFlights = async () => {
    try {
      const data = await searchSeatFlight({ VueloId: vuelo!.vueloId });
      setAsientos(data);
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

  return (
    <Container maxWidth={false} sx={{ mt: 4 }}>
      <Card
        elevation={8}
        sx={{
          borderRadius: 3,
          p: 3,
          backgroundColor:
            theme.palette.mode === "dark" ? "#111315" : "#ffffff",
        }}
      >
        <Typography variant="h5" align="center" fontWeight={700} sx={{ mb: 3 }}>
          Compra de Asientos del Vuelo {vuelo!.ciudadOrigenNombreNomenclatura} -{" "}
          {vuelo!.ciudadDestinoNombreNomenclatura}
        </Typography>

        <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Cronómetro visible en pasos 2 y 3 */}
        {activeStep > 0 && tiempoRestante > 0 && (
          <Typography
            align="center"
            color="#0f7c77"
            sx={{ mb: 2, fontWeight: 600 }}
          >
            Tiempo restante: {Math.floor(tiempoRestante / 60)}:
            {(tiempoRestante % 60).toString().padStart(2, "0")}
          </Typography>
        )}

        {/* PASO 1 */}
        {activeStep === 0 && (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Selecciona {pasajeros} asiento(s)
            </Typography>

            <Grid container spacing={1.5} justifyContent="center">
              {asientos.map((a) => {
                const seleccionado = asientosSeleccionados.some(
                  (s) => s.vueloAsientoId === a.vueloAsientoId
                );
                const color =
                  a.vueloAsientoEstado === "Comprado" ||
                  a.vueloAsientoEstado === "Reservado"
                    ? "#585858ff"
                    : seleccionado
                    ? "#4caf50"
                    : a.asientoAvionVIP
                    ? "#d4af37"
                    : "#ffffff";

                return (
                  <Grid item key={a.vueloAsientoId}>
                    <Tooltip
                      title={
                        a.vueloAsientoEstado === "Comprado" ||
                        a.vueloAsientoEstado === "Reservado"
                          ? "Asiento bloqueado"
                          : a.asientoAvionVIP
                          ? "Asiento VIP"
                          : "Disponible"
                      }
                    >
                      <Box
                        onClick={() => handleSelectAsiento(a)}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: 0.5,
                          cursor:
                            a.vueloAsientoEstado === "Disponible"
                              ? "pointer"
                              : "not-allowed",
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            transform:
                              a.vueloAsientoEstado === "Disponible"
                                ? "scale(1.05)"
                                : "none",
                          },
                        }}
                      >
                        {/* Ícono del asiento */}
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "1px solid #bbb",
                            backgroundColor: color,
                            color: seleccionado ? "#fff" : "#000",
                            boxShadow: seleccionado
                              ? "0 0 10px rgba(15,124,119,0.6)"
                              : "0 2px 5px rgba(0,0,0,0.1)",
                            transition: "all 0.25s ease-in-out",
                          }}
                        >
                          {a.asientoAvionVIP ? (
                            <StarIcon fontSize="small" />
                          ) : (
                            <ChairIcon fontSize="small" />
                          )}
                        </Box>

                        {/* Nombre del asiento */}
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 600,
                            color: color,
                          }}
                        >
                          {a.asientoAvionNombre}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                );
              })}
            </Grid>

            {asientosSeleccionados.length === pasajeros ? (
              <Button
                variant="contained"
                sx={{
                  mt: 3,
                  backgroundColor: "#0f7c77",
                  "&:hover": { backgroundColor: "#0c6d69" },
                }}
                onClick={async () => {
                  try {
                    await handleReservarAsientos();
                  } catch (error) {
                    const err = error as ErrorResponse;
                    if (
                      (err.status === 422 ||
                        err.status === 403 ||
                        err.status === 401) &&
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
                }}
              >
                Continuar
              </Button>
            ) : (
              <Alert sx={{ mt: 3 }} severity="info">
                Selecciona {pasajeros - asientosSeleccionados.length} asiento(s)
                restante(s)
              </Alert>
            )}
          </Box>
        )}

        {/* PASO 2 */}
        {activeStep === 1 && (
          <Box>
            <Grid container spacing={2}>
              {asientosSeleccionados.map((a) => (
                <Grid item xs={12} sm={6} key={a.vueloAsientoId}>
                  <Card
                    variant="outlined"
                    sx={{
                      border: "2px solid",
                      borderColor: a.asientoAvionVIP ? "#d4af37" : "#0f7c77",
                      backgroundColor: a.asientoAvionVIP
                        ? "rgba(212,175,55,0.08)"
                        : theme.palette.mode === "dark"
                        ? "#1a1d1c"
                        : "#f4f9f8",
                      p: 2.5,
                      borderRadius: 3,
                      transition: "all 0.3s ease-in-out",
                    }}
                  >
                    {/* Encabezado con nombre y precio */}
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography
                        fontWeight={700}
                        color={a.asientoAvionVIP ? "#d4af37" : "#0f7c77"}
                      >
                        {a.asientoAvionNombre}
                      </Typography>

                      {a.asientoAvionVIP && (
                        <Tooltip title="Asiento VIP">
                          <StarIcon
                            sx={{ color: "#d4af37" }}
                            fontSize="small"
                          />
                        </Tooltip>
                      )}

                      <Chip
                        size="small"
                        label={formatCOP(calcularPrecioAsiento(a))}
                        sx={{
                          ml: "auto",
                          fontSize: "0.75rem",
                          backgroundColor: a.asientoAvionVIP
                            ? "#d4af37"
                            : "#0f7c77",
                          color: a.asientoAvionVIP ? "#000" : "#fff",
                          fontWeight: 600,
                        }}
                      />
                    </Box>

                    {/* Campos de pasajero */}
                    <TextField
                      label="Nombre del pasajero"
                      size="small"
                      fullWidth
                      sx={{
                        mt: 1.5,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#d4af37"
                              : "#0f7c77",
                          },
                          "&:hover fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#c5a623"
                              : "#0c6d69",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#d4af37"
                              : "#0f7c77",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: a.asientoAvionVIP ? "#d4af37" : "#0f7c77",
                        },
                      }}
                      value={
                        datosPasajeros.find(
                          (p) => p.asientoId === a.vueloAsientoId
                        )?.nombre || ""
                      }
                      onChange={(e) =>
                        handleChangeDato(
                          a.vueloAsientoId,
                          "nombre",
                          e.target.value
                        )
                      }
                    />

                    <TextField
                      label="Identificación"
                      size="small"
                      fullWidth
                      sx={{
                        mt: 1.5,
                        "& .MuiOutlinedInput-root": {
                          "& fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#d4af37"
                              : "#0f7c77",
                          },
                          "&:hover fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#c5a623"
                              : "#0c6d69",
                          },
                          "&.Mui-focused fieldset": {
                            borderColor: a.asientoAvionVIP
                              ? "#d4af37"
                              : "#0f7c77",
                          },
                        },
                        "& .MuiInputLabel-root.Mui-focused": {
                          color: a.asientoAvionVIP ? "#d4af37" : "#0f7c77",
                        },
                      }}
                      value={
                        datosPasajeros.find(
                          (p) => p.asientoId === a.vueloAsientoId
                        )?.identificacion || ""
                      }
                      onChange={(e) =>
                        handleChangeDato(
                          a.vueloAsientoId,
                          "identificacion",
                          e.target.value
                        )
                      }
                    />
                  </Card>
                </Grid>
              ))}
            </Grid>

            {!pasajerosCompletos && (
              <Alert sx={{ mt: 2 }} severity="warning">
                Debes completar los datos de todos los pasajeros antes de
                continuar.
              </Alert>
            )}

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button variant="outlined" onClick={handleBack}>
                Volver
              </Button>
              <Button
                variant="contained"
                disabled={!pasajerosCompletos}
                sx={{
                  backgroundColor: pasajerosCompletos ? "#0f7c77" : "#ccc",
                  "&:hover": {
                    backgroundColor: pasajerosCompletos ? "#0c6d69" : "#ccc",
                  },
                }}
                onClick={handleNext}
              >
                Siguiente
              </Button>
            </Box>
          </Box>
        )}

        {/* PASO 3 */}
        {activeStep === 2 && (
          <Box>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Detalle de la compra
            </Typography>

            {asientosSeleccionados.map((a) => {
              const pasajero = datosPasajeros.find(
                (p) => p.asientoId === a.vueloAsientoId
              );
              return (
                <Card
                  key={a.vueloAsientoId}
                  variant="outlined"
                  sx={{
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    borderColor: a.asientoAvionVIP ? "#d4af37" : "#0f7c77",
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography fontWeight={700}>
                        Asiento {a.asientoAvionNombre}{" "}
                        {a.asientoAvionVIP && "⭐ VIP"}
                      </Typography>
                      <Typography variant="body2">
                        {pasajero?.nombre} - {pasajero?.identificacion}
                      </Typography>
                    </Box>
                    <Typography fontWeight={600}>
                      {formatCOP(calcularPrecioAsiento(a))}
                    </Typography>
                  </Box>
                </Card>
              );
            })}

            <Typography align="right" variant="h6" fontWeight={700}>
              Total: {formatCOP(totalCompra)}
            </Typography>

            <Box display="flex" justifyContent="space-between" mt={3}>
              <Button variant="outlined" onClick={handleBack}>
                Volver
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#0f7c77",
                  "&:hover": { backgroundColor: "#0c6d69" },
                }}
                onClick={handleGuardarCompra}
              >
                Guardar Compra
              </Button>
            </Box>
          </Box>
        )}
      </Card>
      {/* BOTÓN GLOBAL CANCELAR COMPRA */}
      <Box textAlign="center" mt={2}>
        <Button
          variant="outlined"
          color="error"
          size="large"
          onClick={cancelar}
        >
          Cancelar compra
        </Button>
      </Box>
    </Container>
  );
};

export default CompraAsientosForm;
