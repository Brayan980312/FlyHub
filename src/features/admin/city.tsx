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
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

const CiudadForm: React.FC = () => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  // Estados principales
  const [ciudades, setCiudades] = useState<responseAllCity[]>([]);
  const [paises, setPaises] = useState<responseAllCountry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedCiudad, setSelectedCiudad] = useState<responseAllCity | null>(
    null
  );

  // Campos de formulario
  const [ciudadId, setCiudadId] = useState(0);
  const [ciudadNombre, setCiudadNombre] = useState("");
  const [ciudadNomenclatura, setCiudadNomenclatura] = useState("");
  const [paisSeleccionado, setPaisSeleccionado] =
    useState<responseAllCountry | null>(null);
  const [ciudadEstado, setCiudadEstado] = useState(true);
  const [modoNuevo, setModoNuevo] = useState(false);

  useEffect(() => {
    handleSearchCiudades();
    handleSearchPaises();
  }, []);

  const handleSearchCiudades = async () => {
    const dataObtenida: responseAllCity[] = await searchCity();
    setCiudades(dataObtenida);
  };

  const handleSearchPaises = async () => {
    const dataObtenida: responseAllCountry[] = await searchPaises();
    setPaises(dataObtenida);
  };

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const limpiarFormulario = () => {
    setCiudadId(0);
    setCiudadNombre("");
    setCiudadNomenclatura("");
    setPaisSeleccionado(null);
    setCiudadEstado(true);
    setSelectedCiudad(null);
    setModoNuevo(false);
  };

  const handleEdit = (ciudad: responseAllCity) => {
    const pais = paises.find((p) => p.paisId === ciudad.paisId) || null;
    setSelectedCiudad(ciudad);
    setCiudadId(ciudad.ciudadId);
    setCiudadNombre(ciudad.ciudadNombre);
    setCiudadNomenclatura(ciudad.ciudadNomenclatura);
    setPaisSeleccionado(pais);
    setCiudadEstado(ciudad.ciudadEstado);
    setModoNuevo(false);
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModoNuevo(true);
  };

  const handleCancel = () => limpiarFormulario();

  const handleSave = async () => {
    try {
      if (!paisSeleccionado) {
        mostrarNotificacion(
          "Validación",
          "Debe seleccionar un país para la ciudad.",
          "warning"
        );
        return;
      }

      await createUpdateCity({
        ciudadId,
        ciudadNombre,
        ciudadNomenclatura,
        paisId: paisSeleccionado.paisId,
        ciudadEstado,
      });

      mostrarNotificacion(
        modoNuevo ? "Ciudad creada" : "Ciudad actualizada",
        modoNuevo
          ? "La nueva ciudad fue registrada correctamente."
          : "La ciudad fue actualizada correctamente.",
        "success"
      );

      limpiarFormulario();
      handleSearchCiudades();
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
        {/* Título principal */}
        <Typography
          variant="h4"
          align="center"
          fontWeight={700}
          gutterBottom
          sx={{ mb: 3, letterSpacing: 0.5 }}
        >
          Ciudades
        </Typography>

        {/* Botón para crear nueva ciudad */}
        {!selectedCiudad && !modoNuevo && (
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
              Nueva Ciudad
            </Button>
          </Box>
        )}

        {/* Formulario de creación / edición */}
        {(selectedCiudad || modoNuevo) && (
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
              label="Nombre de la Ciudad"
              value={ciudadNombre}
              onChange={(e) => setCiudadNombre(e.target.value)}
              sx={{ flex: 2, minWidth: 200 }}
            />
            <TextField
              label="Nomenclatura"
              value={ciudadNomenclatura}
              onChange={(e) => setCiudadNomenclatura(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            />

            <Autocomplete
              options={paises}
              getOptionLabel={(option) =>
                `${option.paisNombre} (${option.paisNomenclatura})`
              }
              value={paisSeleccionado}
              onChange={(_, newValue) => setPaisSeleccionado(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="País" sx={{ minWidth: 250 }} />
              )}
              sx={{ flex: 2 }}
            />

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Activo</Typography>
              <Checkbox
                checked={ciudadEstado}
                onChange={(e) => setCiudadEstado(e.target.checked)}
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

        {/* Tabla principal */}
        <CardContent sx={{ p: 0 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#0f7c77" }}>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Ciudad
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Nomenclatura
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  País
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
              {ciudades
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((ciudad) => {
                  const pais = paises.find((p) => p.paisId === ciudad.paisId);
                  return (
                    <TableRow
                      key={ciudad.ciudadId}
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
                      <TableCell>{ciudad.ciudadNombre}</TableCell>
                      <TableCell>{ciudad.ciudadNomenclatura}</TableCell>
                      <TableCell>{pais ? pais.paisNombre : "—"}</TableCell>
                      <TableCell>
                        <Checkbox checked={ciudad.ciudadEstado} disabled />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Editar ciudad">
                          <IconButton
                            sx={{
                              color: "#0f7c77",
                              "&:hover": { backgroundColor: "#0f7c7714" },
                            }}
                            onClick={() => handleEdit(ciudad)}
                          >
                            <EditIcon />
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
            count={ciudades.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </CardContent>
      </Card>
    </Container>
  );
};
import { useAppUI } from "../../context/useAppUI";
import type { responseAllCity } from "../../api/types/city";
import type { responseAllCountry } from "../../api/types/country";
import { createUpdateCity, searchCity } from "../../api/services/ciudadService";
import { searchPaises } from "../../api/services/paisService";
import type { ErrorResponse } from "../../api/types/errorResponse";

export default CiudadForm;
