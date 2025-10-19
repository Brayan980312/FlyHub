import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import HourglassBottomRoundedIcon from "@mui/icons-material/HourglassBottomRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import type { responseSeatFlight } from "../../api/types/seatFlight";
import { useAppUI } from "../../context/useAppUI";
import { searchSeatFlight } from "../../api/services/seatFlight";
import type { ErrorResponse } from "../../api/types/errorResponse";

interface Props {
  open: boolean;
  vueloId: number | null;
  vueloCodigo: string;
  onClose: () => void;
}

const AsientosVueloDialog: React.FC<Props> = ({
  open,
  vueloId,
  vueloCodigo,
  onClose,
}) => {
  const theme = useTheme();
  const { mostrarNotificacion } = useAppUI();
  const [asientos, setAsientos] = useState<responseSeatFlight[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    if (open && vueloId) {
      setPage(0);
      handleSearchAsientos();
    }
  }, [open, vueloId]);

  const handleSearchAsientos = async () => {
    try {
      const data = await searchSeatFlight({ VueloId: vueloId! });
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

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getEstadoChip = (estado: string) => {
    switch (estado) {
      case "Disponible":
        return (
          <Chip
            icon={<CheckCircleRoundedIcon sx={{ fontSize: 18 }} />}
            label="Disponible"
            sx={{
              fontWeight: 600,
              borderRadius: "10px",
              px: 1,
              py: 0.5,
              color: "#166534",
              backgroundColor: "rgba(22, 101, 52, 0.1)",
              "& .MuiChip-icon": { color: "#16a34a", ml: 0.5 },
            }}
          />
        );
      case "Reservado":
        return (
          <Chip
            icon={<HourglassBottomRoundedIcon sx={{ fontSize: 18 }} />}
            label="Reservado"
            sx={{
              fontWeight: 600,
              borderRadius: "10px",
              px: 1,
              py: 0.5,
              color: "#92400e",
              backgroundColor: "rgba(234, 179, 8, 0.1)",
              "& .MuiChip-icon": { color: "#f59e0b", ml: 0.5 },
            }}
          />
        );
      case "Comprado":
        return (
          <Chip
            icon={<CancelRoundedIcon sx={{ fontSize: 18 }} />}
            label="Comprado"
            sx={{
              fontWeight: 600,
              borderRadius: "10px",
              px: 1,
              py: 0.5,
              color: "#991b1b",
              backgroundColor: "rgba(153, 27, 27, 0.1)",
              "& .MuiChip-icon": { color: "#dc2626", ml: 0.5 },
            }}
          />
        );
      default:
        return null;
    }
  };

  const getVIPChip = (vip: string) => {
    if (vip === "VIP") {
      return (
        <Chip
          label="VIP"
          sx={{
            fontWeight: 700,
            borderRadius: "10px",
            px: 1.5,
            py: 0.5,
            color: "#b45309",
            backgroundColor: "rgba(234, 179, 8, 0.15)",
            boxShadow: "0 0 10px rgba(234, 179, 8, 0.2)",
          }}
        />
      );
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
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
          Asientos del vuelo {vueloCodigo}
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
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#0f7c77" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Asiento
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Tipo
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Estado
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Pasajero
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Identificación
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {asientos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((asiento) => (
                <TableRow
                  key={asiento.vueloAsientoId}
                  hover
                  sx={{
                    transition: "background 0.3s",
                    "&:hover": {
                      backgroundColor:
                        theme.palette.mode === "dark" ? "#202322" : "#f5f9f8",
                    },
                  }}
                >
                  <TableCell>{asiento.asientoAvionNombre}</TableCell>
                  <TableCell>{getVIPChip(asiento.asientoAvionVIP)}</TableCell>
                  <TableCell>
                    {getEstadoChip(asiento.vueloAsientoEstado)}
                  </TableCell>
                  <TableCell>
                    {asiento.compraDetalleNombrePasajero || "-"}
                  </TableCell>
                  <TableCell>
                    {asiento.compraDetalleIdentificacionPasajero || "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <TablePagination
          component="div"
          count={asientos.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AsientosVueloDialog;
