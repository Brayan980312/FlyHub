import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Box,
  Button,
  TextField,
  Checkbox,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Tooltip,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { useAppUI } from "../../context/useAppUI";
import type { ErrorResponse } from "../../api/types/errorResponse";
import type { responseAllPlane } from "../../api/types/plane";
import type { responseAllSeatPlane } from "../../api/types/seatPlane";
import {
  createUpdateSeatPlane,
  searchSeatPlane,
} from "../../api/services/seatPlaneService";

interface Props {
  open: boolean;
  avion: responseAllPlane;
  onClose: () => void;
}

const AsientoAvionDialog: React.FC<Props> = ({ open, avion, onClose }) => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  const [asientos, setAsientos] = useState<responseAllSeatPlane[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const [selectedAsiento, setSelectedAsiento] =
    useState<responseAllSeatPlane | null>(null);
  const [modoNuevo, setModoNuevo] = useState(false);

  // Campos del formulario
  const [asientoId, setAsientoId] = useState(0);
  const [asientoNombre, setAsientoNombre] = useState("");
  const [asientoVIP, setAsientoVIP] = useState(false);
  const [asientoVIPPorcentaje, setAsientoVIPPorcentaje] = useState(0);
  const [asientoEstado, setAsientoEstado] = useState(true);

  useEffect(() => {
    if (open) {
      setPage(0);
      handleSearchAsientos();
    }
  }, [open]);

  const handleSearchAsientos = async () => {
    const data = await searchSeatPlane({ avionId: avion.avionId });
    console.log(data, "Data asientos");
    setAsientos(data);
  };

  const limpiarFormulario = () => {
    setAsientoId(0);
    setAsientoNombre("");
    setAsientoVIP(false);
    setAsientoVIPPorcentaje(0);
    setAsientoEstado(true);
    setSelectedAsiento(null);
    setModoNuevo(false);
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModoNuevo(true);
  };

  const handleEdit = (asiento: responseAllSeatPlane) => {
    setSelectedAsiento(asiento);
    setAsientoId(asiento.asientoAvionId);
    setAsientoNombre(asiento.asientoAvionNombre);
    setAsientoVIP(asiento.asientoAvionVIP);
    setAsientoVIPPorcentaje(asiento.asientoAvionVIPPorcentaje);
    setAsientoEstado(asiento.asientoAvionEstado);
    setModoNuevo(false);
  };

  const handleCancel = () => limpiarFormulario();

  const handleSave = async () => {
    try {
      if (!asientoNombre.trim()) {
        mostrarNotificacion(
          "Validación",
          "Debe ingresar el nombre del asiento.",
          "warning"
        );
        return;
      }

      if (asientoVIP && asientoVIPPorcentaje <= 0) {
        mostrarNotificacion(
          "Validación",
          "Si el asiento es VIP, debe asignar un porcentaje adicional.",
          "warning"
        );
        return;
      }

      await createUpdateSeatPlane({
        asientoAvionId: asientoId,
        avionId: avion.avionId,
        asientoAvionNombre: asientoNombre,
        asientoAvionVIP: asientoVIP,
        asientoAvionVIPPorcentaje: asientoVIP ? asientoVIPPorcentaje : 0,
        asientoAvionEstado: asientoEstado,
      });

      mostrarNotificacion(
        modoNuevo ? "Asiento creado" : "Asiento actualizado",
        modoNuevo
          ? "El asiento fue creado correctamente."
          : "El asiento fue actualizado correctamente.",
        "success"
      );

      limpiarFormulario();
      handleSearchAsientos();
    } catch (error) {
      const err = error as ErrorResponse;
      if (err.status === 422 && err.detail) {
        mostrarNotificacion("Validación de negocio", err.detail, "warning");
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

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle
        sx={{
          backgroundColor: "#0f7c77",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid rgba(255,255,255,0.1)", // crea una línea divisoria sutil
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          py: 1, // padding vertical
          px: 3,
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Asientos del avión: {avion.avionNombre}
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
          borderTop: "1px solid rgba(255,255,255,0.1)",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          marginTop: 0,
        }}
      >
        {!selectedAsiento && !modoNuevo && (
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
              Nuevo Asiento
            </Button>
          </Box>
        )}

        {(selectedAsiento || modoNuevo) && (
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
                theme.palette.mode === "dark" ? "#1a1d1c" : "#eefaf8",
            }}
          >
            <TextField
              label="Nombre del asiento"
              value={asientoNombre}
              onChange={(e) => setAsientoNombre(e.target.value)}
              sx={{ flex: 2, minWidth: 200 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>VIP</Typography>
              <Checkbox
                checked={asientoVIP}
                onChange={(e) => {
                  setAsientoVIPPorcentaje(0);
                  setAsientoVIP(e.target.checked);
                }}
              />
            </Box>

            <TextField
              label="Porcentaje VIP (%)"
              type="number"
              value={asientoVIPPorcentaje === 0 ? "" : asientoVIPPorcentaje}
              onChange={(e) => {
                const raw = e.target.value;
                // Si el campo está vacío, permitimos el valor vacío
                if (raw === "") {
                  setAsientoVIPPorcentaje(0);
                  return;
                }

                // Convertimos y forzamos límites 0-100
                const value = Math.max(0, Math.min(100, Number(raw)));
                setAsientoVIPPorcentaje(value);
              }}
              disabled={!asientoVIP}
              inputProps={{
                min: 0,
                max: 100,
                step: 1,
                inputMode: "numeric",
                pattern: "[0-9]*",
                style: { MozAppearance: "textfield" },
              }}
              sx={{
                flex: 1,
                minWidth: 120,
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                  {
                    WebkitAppearance: "none",
                    margin: 0,
                  },
              }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Activo</Typography>
              <Checkbox
                checked={asientoEstado}
                onChange={(e) => setAsientoEstado(e.target.checked)}
              />
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                sx={{
                  backgroundColor: "#0f7c77",
                  "&:hover": { backgroundColor: "#0c6d69" },
                }}
                onClick={handleSave}
              >
                {modoNuevo ? "Crear" : "Guardar"}
              </Button>
              <Button variant="outlined" color="inherit" onClick={handleCancel}>
                Cancelar
              </Button>
            </Box>
          </Box>
        )}

        {/* Tabla principal */}
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
                Porcentaje
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Activo
              </TableCell>
              <TableCell
                sx={{
                  color: "white",
                  fontWeight: "bold",
                  textAlign: "center",
                  width: 120,
                }}
              >
                Acciones
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {asientos
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((asiento) => (
                <TableRow
                  key={asiento.asientoAvionId}
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
                  <TableCell>{asiento.asientoAvionVIP ? "Sí" : "No"}</TableCell>
                  <TableCell>{asiento.asientoAvionVIPPorcentaje}%</TableCell>
                  <TableCell>
                    <Checkbox checked={asiento.asientoAvionEstado} disabled />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar asiento">
                      <IconButton
                        sx={{
                          color: "#0f7c77",
                          "&:hover": { backgroundColor: "#0f7c7714" },
                        }}
                        onClick={() => handleEdit(asiento)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
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

export default AsientoAvionDialog;
