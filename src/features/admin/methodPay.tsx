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
  Card,
  CardContent,
  useTheme,
  Chip,
} from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import type { responseAllMethodPay } from "../../api/types/methodPay";
import { searchMetodoPago } from "../../api/services/metodoPagoService";

const MetodoPagoForm: React.FC = () => {
  const theme = useTheme();

  const [metodosPago, setMetodosPago] = useState<responseAllMethodPay[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    handleSearchMetodoPago();
  }, []);

  const handleSearchMetodoPago = async () => {
    const dataObtenida: responseAllMethodPay[] = await searchMetodoPago();
    setMetodosPago(dataObtenida);
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
          Métodos de Pago
        </Typography>

        {/* Tabla de solo lectura */}
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
                  Estado
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {metodosPago
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((metodo) => (
                  <TableRow
                    key={metodo.metodoPagoId}
                    hover
                    sx={{
                      transition: "background 0.3s",
                      "&:hover": {
                        backgroundColor:
                          theme.palette.mode === "dark" ? "#202322" : "#f5f9f8",
                      },
                    }}
                  >
                    <TableCell>{metodo.metodoPagoNombre}</TableCell>
                    <TableCell>{metodo.metodoPagoDescripcion || "—"}</TableCell>
                    <TableCell>
                      <Chip
                        icon={
                          metodo.metodoPagoEstado ? (
                            <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                          ) : (
                            <CancelRoundedIcon sx={{ fontSize: 18 }} />
                          )
                        }
                        label={metodo.metodoPagoEstado ? "Activo" : "Inactivo"}
                        sx={{
                          fontWeight: 600,
                          borderRadius: "10px",
                          px: 1,
                          py: 0.5,
                          color: metodo.metodoPagoEstado
                            ? "#166534"
                            : "#991b1b", // texto
                          backgroundColor: metodo.metodoPagoEstado
                            ? "rgba(22, 101, 52, 0.1)" // verde suave translúcido
                            : "rgba(153, 27, 27, 0.1)", // rojo suave translúcido
                          "& .MuiChip-icon": {
                            color: metodo.metodoPagoEstado
                              ? "#16a34a"
                              : "#dc2626", // icono con tono fuerte
                            ml: 0.5,
                          },
                          "&:hover": {
                            backgroundColor: metodo.metodoPagoEstado
                              ? "rgba(22, 101, 52, 0.15)"
                              : "rgba(153, 27, 27, 0.15)",
                            transform: "scale(1.02)",
                            transition: "all 0.2s ease-in-out",
                          },
                          boxShadow: metodo.metodoPagoEstado
                            ? "0 0 10px rgba(34, 197, 94, 0.15)"
                            : "0 0 10px rgba(239, 68, 68, 0.15)",
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          <TablePagination
            component="div"
            count={metodosPago.length}
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

export default MetodoPagoForm;
