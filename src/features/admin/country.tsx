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
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useAppUI } from "../../context/useAppUI";
import type { responseAllCountry } from "../../api/types/country";
import {
  createUpdatePaises,
  searchPaises,
} from "../../api/services/paisService";
import type { ErrorResponse } from "../../api/types/errorResponse";

const PaisForm: React.FC = () => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  const [paises, setPaises] = useState<responseAllCountry[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedPais, setSelectedPais] = useState<responseAllCountry | null>(
    null
  );

  const [paisId, setPaisId] = useState(0);
  const [paisNombre, setPaisNombre] = useState("");
  const [paisNomenclatura, setPaisNomenclatura] = useState("");
  const [paisInternacional, setPaisInternacional] = useState(false);
  const [paisEstado, setPaisEstado] = useState(true);
  const [modoNuevo, setModoNuevo] = useState(false);

  useEffect(() => {
    handleSearchPaises();
  }, []);

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
    setPaisId(0);
    setPaisNombre("");
    setPaisNomenclatura("");
    setPaisInternacional(false);
    setPaisEstado(true);
    setSelectedPais(null);
    setModoNuevo(false);
  };

  const handleEdit = (pais: responseAllCountry) => {
    setSelectedPais(pais);
    setPaisId(pais.paisId);
    setPaisNombre(pais.paisNombre);
    setPaisNomenclatura(pais.paisNomenclatura);
    setPaisInternacional(pais.paisInternacional);
    setPaisEstado(pais.paisEstado);
    setModoNuevo(false);
  };

  const handleNuevo = () => {
    limpiarFormulario();
    setModoNuevo(true);
  };

  const handleCancel = () => limpiarFormulario();

  const handleSave = async () => {
    try {
      if (modoNuevo) {
        await createUpdatePaises({
          paisId,
          paisNombre,
          paisNomenclatura,
          paisInternacional,
          paisEstado,
        });
        mostrarNotificacion(
          "País creado",
          "El nuevo país fue registrado correctamente.",
          "success"
        );
      } else if (selectedPais) {
        await createUpdatePaises({
          paisId,
          paisNombre,
          paisNomenclatura,
          paisInternacional,
          paisEstado,
        });
        mostrarNotificacion(
          "Actualización exitosa",
          "País actualizado correctamente.",
          "success"
        );
      }

      limpiarFormulario();
      handleSearchPaises();
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
          Países
        </Typography>

        {/* Botón para crear nuevo país */}
        {!selectedPais && !modoNuevo && (
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
              Nuevo País
            </Button>
          </Box>
        )}

        {/* Sección de edición / creación */}
        {(selectedPais || modoNuevo) && (
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
              label="Nombre del País"
              value={paisNombre}
              onChange={(e) => setPaisNombre(e.target.value)}
              sx={{ flex: 2, minWidth: 200 }}
            />
            <TextField
              label="Nomenclatura"
              value={paisNomenclatura}
              onChange={(e) => setPaisNomenclatura(e.target.value)}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Internacional</Typography>
              <Checkbox
                checked={paisInternacional}
                onChange={(e) => setPaisInternacional(e.target.checked)}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography>Activo</Typography>
              <Checkbox
                checked={paisEstado}
                onChange={(e) => setPaisEstado(e.target.checked)}
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
                  Nombre
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Nomenclatura
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Internacional
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
              {paises
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((pais) => (
                  <TableRow
                    key={pais.paisId}
                    hover
                    sx={{
                      transition: "background 0.3s",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#202322" : "#f5f9f8",
                      },
                    }}
                  >
                    <TableCell>{pais.paisNombre}</TableCell>
                    <TableCell>{pais.paisNomenclatura}</TableCell>
                    <TableCell>
                      <Checkbox checked={pais.paisInternacional} disabled />
                    </TableCell>
                    <TableCell>
                      <Checkbox checked={pais.paisEstado} disabled />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar país">
                        <IconButton
                          sx={{
                            color: "#0f7c77",
                            "&:hover": { backgroundColor: "#0f7c7714" },
                          }}
                          onClick={() => handleEdit(pais)}
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
            count={paises.length}
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

export default PaisForm;
