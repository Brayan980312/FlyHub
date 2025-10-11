import React, { useEffect } from "react";
import { Snackbar, Alert, AlertTitle, IconButton, Box } from "@mui/material";
import type { AlertColor } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface NotificationProps {
  titulo: string;
  mensaje: string;
  tipo: AlertColor;
  abierto: boolean;
  onCerrar: () => void;
}

const Notification: React.FC<NotificationProps> = ({
  titulo,
  mensaje,
  tipo,
  abierto,
  onCerrar,
}) => {
  useEffect(() => {
    if (abierto) {
      const timer = setTimeout(() => {
        onCerrar();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [abierto, onCerrar]);

  return (
    <Snackbar
      open={abierto}
      onClose={onCerrar}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Box
        sx={{
          position: "relative",
          maxWidth: 400,
          width: "100%",
        }}
      >
        <Alert
          severity={tipo}
          sx={{
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
            paddingRight: "3rem", // espacio para la X
          }}
        >
          <AlertTitle>{titulo}</AlertTitle>
          {mensaje}
        </Alert>

        <IconButton
          aria-label="cerrar"
          color="inherit"
          size="small"
          onClick={onCerrar}
          sx={{
            position: "absolute",
            bottom: "50%",
            right: 8,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Snackbar>
  );
};

export default Notification;
