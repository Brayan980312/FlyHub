import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Button,
  TextField,
  Card,
  CardContent,
  IconButton,
  Box,
  Checkbox,
  Tooltip,
  Autocomplete,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  AirlineSeatReclineExtra as SeatIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAppUI } from "../../context/useAppUI";
import { searchCity } from "../../api/services/ciudadService";
import type { responseAllCity } from "../../api/types/city";
import type { responseAllPlane } from "../../api/types/plane";
import {
  createUpdatePlane,
  searchPlane,
} from "../../api/services/planeService";
import type { ErrorResponse } from "../../api/types/errorResponse";
import AsientoAvionDialog from "./seatPlane";

const AvionForm: React.FC = () => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  const [aviones, setAviones] = useState<responseAllPlane[]>([]);
  const [ciudades, setCiudades] = useState<responseAllCity[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedAvion, setSelectedAvion] = useState<responseAllPlane | null>(
    null
  );
  const [modoNuevo, setModoNuevo] = useState(false);

  // Campos
  const [avionId, setAvionId] = useState(0);
  const [avionNombre, setAvionNombre] = useState("");
  const [ciudadSeleccionada, setCiudadSeleccionada] =
    useState<responseAllCity | null>(null);
  const [avionEstado, setAvionEstado] = useState(true);
  const [openAsientos, setOpenAsientos] = useState(false);

  useEffect(() => {
    handleSearchAviones();
    handleSearchCiudades();
  }, []);

  const handleSearchAviones = async () => {
    const data = await searchPlane();
    setAviones(data);
  };

  const handleSearchCiudades = async () => {
    const data = await searchCity();
    setCiudades(data);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFormulario = () => {
    setAvionId(0);
    setAvionNombre("");
    setCiudadSeleccionada(null);
    setAvionEstado(true);
    setSelectedAvion(null);
    setModoNuevo(false);
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModoNuevo(true);
  };

  const handleEdit = (avion: responseAllPlane) => {
    const ciudad = ciudades.find((c) => c.ciudadId === avion.ciudadId) || null;
    setSelectedAvion(avion);
    setAvionId(avion.avionId);
    setAvionNombre(avion.avionNombre);
    setCiudadSeleccionada(ciudad);
    setAvionEstado(avion.avionEstado);
    setModoNuevo(false);
  };

  const handleCancel = () => limpiarFormulario();

  const handleSave = async () => {
    try {
      if (!ciudadSeleccionada) {
        mostrarNotificacion(
          "Validación",
          "Debe seleccionar una ciudad.",
          "warning"
        );
        return;
      }

      await createUpdatePlane({
        avionId,
        avionNombre,
        ciudadId: ciudadSeleccionada.ciudadId,
        avionEstado,
      });

      mostrarNotificacion(
        modoNuevo ? "Avión creado" : "Avión actualizado",
        "La información del avión se guardó correctamente.",
        "success"
      );

      limpiarFormulario();
      handleSearchAviones();
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

  const handleVerAsientos = (avion: responseAllPlane) => {
    setSelectedAvion(avion);
    setOpenAsientos(true);
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
          sx={{ mb: 3 }}
        >
          Aviones
        </Typography>

        {!selectedAvion && !modoNuevo && (
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
              Nuevo Avión
            </Button>
          </Box>
        )}

        {(selectedAvion || modoNuevo) && (
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
            <TextField
              label="Nombre del avión"
              value={avionNombre}
              onChange={(e) => setAvionNombre(e.target.value)}
              sx={{ flex: 2, minWidth: 250 }}
            />

            <Autocomplete
              options={ciudades}
              getOptionLabel={(option) =>
                `${
                  option.ciudadNombre + " (" + option.ciudadNomenclatura + ")"
                }`
              }
              value={ciudadSeleccionada}
              onChange={(_, val) => setCiudadSeleccionada(val)}
              renderInput={(params) => (
                <TextField {...params} label="Ciudad Actual" />
              )}
              sx={{ flex: 2 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Activo</Typography>
              <Checkbox
                checked={avionEstado}
                onChange={(e) => setAvionEstado(e.target.checked)}
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
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<ArrowBackIcon />}
                onClick={handleCancel}
              >
                Volver
              </Button>
            </Box>
          </Box>
        )}

        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Avión
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Ciudad
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Activo
                </TableCell>
                <TableCell
                  sx={{
                    color: "white",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: 150,
                  }}
                >
                  Acciones
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {aviones
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((avion) => {
                  const ciudad = ciudades.find(
                    (c) => c.ciudadId === avion.ciudadId
                  );
                  return (
                    <TableRow key={avion.avionId} hover>
                      <TableCell>{avion.avionNombre}</TableCell>
                      <TableCell>
                        {ciudad?.ciudadNombre +
                          " (" +
                          ciudad?.ciudadNomenclatura +
                          ")" || "—"}
                      </TableCell>
                      <TableCell>
                        <Checkbox checked={avion.avionEstado} disabled />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar avión">
                          <IconButton
                            onClick={() => handleEdit(avion)}
                            sx={{ color: "#0f7c77" }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver asientos">
                          <IconButton
                            onClick={() => handleVerAsientos(avion)}
                            sx={{ color: "#0f7c77" }}
                          >
                            <SeatIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={aviones.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>

      {/* Dialogo de Asientos */}
      {selectedAvion && (
        <AsientoAvionDialog
          open={openAsientos}
          avion={selectedAvion}
          onClose={() => setOpenAsientos(false)}
        />
      )}
    </Container>
  );
};

export default AvionForm;
