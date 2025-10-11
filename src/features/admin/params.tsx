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
  useTheme,
  Tooltip,
} from "@mui/material";
import {
  Save as SaveIcon,
  Edit as EditIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import type { responseAllParams } from "../../api/types/params";
import type { ErrorResponse } from "../../api/types/errorResponse";
import {
  searchParams,
  updateParams,
} from "../../api/services/parametrosService";
import { useAppUI } from "../../context/useAppUI";

const ParametrosForm: React.FC = () => {
  const { mostrarNotificacion } = useAppUI();
  const theme = useTheme();

  const [parametros, setParametros] = useState<responseAllParams[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedParametro, setSelectedParametro] =
    useState<responseAllParams | null>(null);
  const [valorValor, setValorValor] = useState("");
  const [valorNombre, setValorNombre] = useState("");
  const [valorDescripcion, setValorDescripcion] = useState("");
  const [valorId, setValorId] = useState(0);

  useEffect(() => {
    handleSearchParams();
  }, []);

  const handleSearchParams = async () => {
    const dataObtenida: responseAllParams[] = await searchParams();
    setParametros(dataObtenida);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleEdit = (parametro: responseAllParams) => {
    setSelectedParametro(parametro);
    setValorId(parametro.parametrosId);
    setValorNombre(parametro.parametrosNombre.toString());
    setValorValor(parametro.parametrosValor.toString());
    setValorDescripcion(parametro.parametrosDescripcion.toString());
  };

  const handleCancel = () => {
    setSelectedParametro(null);
    setValorValor("");
  };

  const handleUpdate = async () => {
    if (!selectedParametro) return;

    try {
      await updateParams({
        parametrosId: valorId,
        parametrosNombre: valorNombre,
        parametrosValor: valorValor,
        parametrosDescripcion: valorDescripcion,
      });
      mostrarNotificacion(
        "Actualización exitosa",
        "Parámetro actualizado correctamente.",
        "success"
      );

      setSelectedParametro(null);
      setValorValor("");
      handleSearchParams();
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
          Parámetros del Sistema
        </Typography>

        {/* Sección de edición compacta */}
        {selectedParametro && (
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
              label="Nombre"
              value={selectedParametro.parametrosNombre}
              InputProps={{ readOnly: true }}
              sx={{ flex: 2, minWidth: 220 }}
            />
            <TextField
              label="Valor"
              value={valorValor}
              onChange={(e) => {
                const newValue = e.target.value;
                if (/^\d*$/.test(newValue)) setValorValor(newValue);
              }}
              sx={{ flex: 1, minWidth: 120 }}
            />
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#0f7c77",
                  "&:hover": { backgroundColor: "#0c6d69" },
                }}
                startIcon={<SaveIcon />}
                onClick={handleUpdate}
              >
                Guardar
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
                  Descripción
                </TableCell>
                <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                  Valor
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
              {parametros
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((parametro) => (
                  <TableRow
                    key={parametro.parametrosId}
                    hover
                    sx={{
                      transition: "background 0.3s",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#202322" : "#f5f9f8",
                      },
                    }}
                  >
                    <TableCell>{parametro.parametrosNombre}</TableCell>
                    <TableCell>
                      {parametro.parametrosDescripcion || "—"}
                    </TableCell>
                    <TableCell>{parametro.parametrosValor}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar parámetro">
                        <IconButton
                          sx={{
                            color: "#0f7c77",
                            "&:hover": { backgroundColor: "#0f7c7714" },
                          }}
                          onClick={() => handleEdit(parametro)}
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
            count={parametros.length}
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

export default ParametrosForm;
