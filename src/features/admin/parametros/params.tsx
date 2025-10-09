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
  Paper,
  Stack,
  Box,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import type { responseAllParams } from "../../../api/types/params";
import Notification from "../../../components/Notification";
import type { ErrorResponse } from "../../../api/types/errorResponse";
import type { AlertColor } from "@mui/material/Alert";
import {
  searchParams,
  updateParams,
} from "../../../api/services/parametrosService";

const ParametrosForm: React.FC = () => {
  // Estado de la tabla
  const [parametros, setParametros] = useState<responseAllParams[]>([]);

  // Estado de paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Estado de edición
  const [selectedParametro, setSelectedParametro] =
    useState<responseAllParams | null>(null);
  const [valorValor, setValorValor] = useState("");
  const [valorNombre, setValorNombre] = useState("");
  const [valorId, setValorId] = useState(0);

  /** Estados para el manejo de notificaciones tipo Toast */
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [tipo, setTipo] = useState<AlertColor>("warning");

  useEffect(() => {
    // Hace la petición para obtener los parametros del sistema
    handleSearchParams();
  }, []);

  const handleSearchParams = async () => {
    const dataObtenida: responseAllParams[] = await searchParams();
    setParametros(dataObtenida);
  };

  // Handlers de paginación
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handler al actualizar
  const handleUpdate = async () => {
    if (selectedParametro) {
      parametros.map((param) =>
        param.parametrosId === selectedParametro.parametrosId
          ? {
              ...param,
              parametrosvalor: valorValor,
              parametrosNombre: valorNombre,
              parametrosId: valorId,
            }
          : param
      );

      try {
        await updateParams({
          parametrosId: valorId,
          parametrosValor: valorValor,
        });

        generarNotificacion(
          "Actualización.",
          "Parametro guardado correctamente",
          "success"
        );

        handleSearchParams();

        setSelectedParametro(null); // ocultar controles
        setValorNombre("");
        setValorValor("");
        setValorId(0);

        handleSearchParams();
      } catch (error) {
        const err = error as ErrorResponse;

        if (err.status === 422 && err.detail) {
          generarNotificacion("Actualización.", err.detail, "warning");
        } else {
          generarNotificacion(
            "Error en la apicación.",
            "Error desconocido.",
            "error"
          );
        }
      }
    }
  };

  const cerrarNotificacion = () => {
    setAbierto(false);
  };

  const generarNotificacion = (
    titulo: string,
    mensaje: string,
    tipo: "error" | "success" | "info" | "warning"
  ) => {
    setTitulo(titulo);
    setMensaje(mensaje);
    setTipo(tipo);
    setAbierto(true);
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 2, // margen inferior opcional
        }}
      >
        <Typography variant="h4" gutterBottom>
          Parametros
        </Typography>
      </Box>

      {/* Controles de edición */}
      {selectedParametro && (
        <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Editar Parámetro
          </Typography>

          <Stack spacing={2}>
            <TextField
              label="Nombre"
              value={selectedParametro.parametrosNombre}
              InputProps={{ readOnly: true }}
            />

            <TextField
              label="Valor"
              value={valorValor}
              onChange={(e) => {
                const newValue = e.target.value;
                if (/^\d*$/.test(newValue)) {
                  setValorValor(newValue);
                }
              }}
            />

            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleUpdate}
            >
              Actualizar
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Tabla */}
      <Paper elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Nombre
              </TableCell>
              <TableCell sx={{ color: "white", fontWeight: "bold" }}>
                Valor
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {parametros
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((parametro) => (
                <TableRow key={parametro.parametrosId}>
                  <TableCell>{parametro.parametrosNombre}</TableCell>
                  <TableCell>{parametro.parametrosValor}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        {/* Paginación */}
        <TablePagination
          component="div"
          count={parametros.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>
      <Notification
        titulo={titulo}
        mensaje={mensaje}
        tipo={tipo}
        abierto={abierto}
        onCerrar={cerrarNotificacion}
      />
    </Container>
  );
};

export default ParametrosForm;
