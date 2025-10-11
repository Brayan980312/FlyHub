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
} from "@mui/material";
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
                      {metodo.metodoPagoEstado ? "Activo" : "Inactivo"}
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
