import React, { useEffect, useState, type ReactElement } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  IconButton,
  useTheme,
  Chip,
  Tooltip,
  TableContainer,
} from "@mui/material";
import {
  FlightTakeoff as FlightTakeoffIcon,
  FlightLand as FlightLandIcon,
} from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import AirplaneTicketIcon from "@mui/icons-material/AirplaneTicket";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";

import type { responseHistoryFlight } from "../../api/types/historyFlight";
import { useAppUI } from "../../context/useAppUI";
import type { ErrorResponse } from "../../api/types/errorResponse";
import { searchHistoryFlight } from "../../api/services/historyFlightService";

interface Props {
  open: boolean;
  vueloId: number | null;
  vueloCodigo: string;
  onClose: () => void;
}

const HistorialVuelosDialog: React.FC<Props> = ({
  open,
  vueloId,
  vueloCodigo,
  onClose,
}) => {
  const theme = useTheme();
  const { mostrarNotificacion } = useAppUI();
  const [historial, setHistorial] = useState<responseHistoryFlight[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (open && vueloId) {
      setPage(0);
      handleSearchHistorial();
    }
  }, [open, vueloId]);

  const handleSearchHistorial = async () => {
    try {
      const data = await searchHistoryFlight({ VueloId: vueloId! });
      setHistorial(data);
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
          "Error desconocido al consultar el historial.",
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

  const formatearFecha = (fecha: Date | string) =>
    new Date(fecha).toLocaleString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="lg">
      <DialogTitle
        sx={{
          backgroundColor: "#0f7c77",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)",
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          py: 1,
          px: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Historial del vuelo {vueloCodigo}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{
          backgroundColor:
            theme.palette.mode === "dark" ? "#1a1d1c" : "#f8f9f9",
          p: 3,
        }}
      >
        <TableContainer sx={{ overflowX: "auto" }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Código
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Estado
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
                  Precio
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Descuento
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Salida
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Llegada
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Usuario
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Fecha registro
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {historial
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((h, index) => (
                  <TableRow
                    key={`${h.vueloHistoricoCodigo}-${index}`}
                    hover
                    sx={{
                      transition: "background 0.3s",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#202322" : "#f5f9f8",
                      },
                    }}
                  >
                    <TableCell>{h.vueloHistoricoCodigo}</TableCell>
                    <TableCell>{getEstadoChip(h.estadoVueloId)}</TableCell>
                    <TableCell>{h.avionNombre}</TableCell>
                    <TableCell>{h.ciudadOrigenNombreNomenclatura}</TableCell>
                    <TableCell>{h.ciudadDestinoNombreNomenclatura}</TableCell>
                    <TableCell>
                      ${h.vueloHistoricoPrecio.toLocaleString()}
                    </TableCell>
                    <TableCell>{h.vueloHistoricoDescuento}%</TableCell>
                    <TableCell>
                      {formatearFecha(h.vueloHistoricoFechaHoraSalida)}
                    </TableCell>
                    <TableCell>
                      {formatearFecha(h.vueloHistoricoFechaHoraLlegada)}
                    </TableCell>
                    <TableCell>{h.usuarioNombreCompleto}</TableCell>
                    <TableCell>
                      {formatearFecha(h.vueloHistoricoFechaCreacion)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={historial.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
};

export default HistorialVuelosDialog;
