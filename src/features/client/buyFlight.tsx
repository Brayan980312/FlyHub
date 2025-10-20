import React, { useEffect, useState, type ReactElement } from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Box,
  IconButton,
  Chip,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  TableContainer,
  Paper,
  useTheme,
} from "@mui/material";
import {
  CheckCircleRounded as CheckCircleRoundedIcon,
  CancelRounded as CancelRoundedIcon,
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
} from "@mui/icons-material";
import { useAppUI } from "../../context/useAppUI";
import type { ErrorResponse } from "../../api/types/errorResponse";
import type {
  responseAsientosAsociadosACompra,
  responseComprasRealizadasUsuario,
} from "../../api/types/buySeatFlight";
import { searchBuySeatFlight } from "../../api/services/buySeatsFlightsService";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

const ComprasRealizadasUsuario: React.FC = () => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  const [compras, setCompras] = useState<responseComprasRealizadasUsuario[]>(
    []
  );
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Nuevo: estado para dialog
  const [openDialog, setOpenDialog] = useState(false);
  const [detalleCompraSeleccionada, setDetalleCompraSeleccionada] =
    useState<responseComprasRealizadasUsuario | null>(null);

  useEffect(() => {
    handleSearchCompras();
  }, []);

  const handleSearchCompras = async () => {
    try {
      const data = await searchBuySeatFlight();
      setCompras(data);
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
          "No fue posible obtener las compras del usuario.",
          "error"
        );
      }
    }
  };

  const handleOpenDialog = (compra: responseComprasRealizadasUsuario) => {
    setDetalleCompraSeleccionada(compra);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setDetalleCompraSeleccionada(null);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEstadoChip = (estadoId: number) => {
    const estados: Record<
      number,
      { nombre: string; bg: string; color: string; icon: ReactElement }
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
          label={estado.nombre}
          sx={{
            fontWeight: 600,
            borderRadius: "10px",
            px: 1,
            py: 0.5,
            color: estado.color,
            backgroundColor: estado.bg,
            "& .MuiChip-icon": { color: estado.color },
            boxShadow: `0 0 8px ${estado.bg.replace("0.1", "0.3")}`,
          }}
        />
      </Tooltip>
    );
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
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
          Compras Realizadas
        </Typography>

        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Fecha Compra
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Método de Pago
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Total
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Vuelo
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Avión
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Estado
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Origen → Destino
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Salida / Llegada
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: 130,
                  }}
                >
                  Acción
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {compras
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((compra, index) => (
                  <TableRow
                    hover
                    key={index}
                    sx={{
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#202322" : "#f4f9f8",
                      },
                    }}
                  >
                    <TableCell>
                      {formatFechaLarga(new Date(compra.compraFecha))}
                    </TableCell>
                    <TableCell>{compra.metodoPagoNombre}</TableCell>
                    <TableCell>
                      ${compra.compraTotal.toLocaleString()}
                    </TableCell>
                    <TableCell>{compra.vueloCodigo}</TableCell>
                    <TableCell>{compra.avionNombre}</TableCell>
                    <TableCell>{getEstadoChip(compra.estadoVueloId)}</TableCell>
                    <TableCell>
                      {compra.ciudadOrigenNombreNomenclatura} →{" "}
                      {compra.ciudadDestinoNombreNomenclatura}
                    </TableCell>
                    <TableCell>
                      <Box>
                        <strong>Salida:</strong>{" "}
                        {formatFechaLarga(
                          new Date(compra.vueloFechaHoraSalida)
                        )}
                      </Box>
                      <Box>
                        <strong>Llegada:</strong>{" "}
                        {formatFechaLarga(
                          new Date(compra.vueloFechaHoraLlegada)
                        )}
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Ver detalle de asientos">
                        <IconButton
                          sx={{
                            color: "#0f7c77",
                            "&:hover": { backgroundColor: "#0f7c7714" },
                          }}
                          onClick={() => handleOpenDialog(compra)}
                        >
                          <AirplaneTicketIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={compras.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Dialog de Detalle de Asientos */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{
            fontWeight: 700,
            backgroundColor: "#0f7c77",
            color: "white",
          }}
        >
          Detalle de Asientos
        </DialogTitle>

        <DialogContent
          dividers
          sx={{
            backgroundColor:
              theme.palette.mode === "dark" ? "#111315" : "#ffffff",
            p: 3,
          }}
        >
          {detalleCompraSeleccionada && (
            <>
              <TableContainer
                component={Paper}
                elevation={6}
                sx={{
                  borderRadius: 0.8,
                  overflow: "hidden",
                  backgroundColor:
                    theme.palette.mode === "dark" ? "#1a1d1c" : "#f8fdfc",
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Asiento
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        VIP
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Pasajero
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Identificación
                      </TableCell>
                      <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                        Precio
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {detalleCompraSeleccionada.compraDetalle.map(
                      (
                        detalle: responseAsientosAsociadosACompra,
                        i: number
                      ) => (
                        <TableRow
                          key={i}
                          hover
                          sx={{
                            "&:hover": {
                              backgroundColor:
                                theme.palette.mode === "dark"
                                  ? "#202322"
                                  : "#f4f9f8",
                            },
                          }}
                        >
                          <TableCell>{detalle.asientoAvionNombre}</TableCell>
                          <TableCell>
                            {detalle.asientoAvionVIP ? "Sí" : "No"}
                          </TableCell>
                          <TableCell>
                            {detalle.compraDetalleNombrePasajero}
                          </TableCell>
                          <TableCell>
                            {detalle.compraDetalleIdentificacionPasajero}
                          </TableCell>
                          <TableCell>
                            ${detalle.compraDetallePrecio.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      )
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Botón de volver */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  mt: 3,
                }}
              >
                <button
                  onClick={handleCloseDialog}
                  style={{
                    backgroundColor: "#0f7c77",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "8px",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "all 0.2s ease-in-out",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0c625e")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#0f7c77")
                  }
                >
                  Volver
                </button>
              </Box>
            </>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ComprasRealizadasUsuario;
