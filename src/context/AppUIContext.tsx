import React, { createContext, useState } from "react";
import type { ReactNode } from "react";
import type { AlertColor } from "@mui/material";
import Notification from "../features/components/Notification";
import LoadingModal from "../features/components/LoadingModal";
interface AppUIContextProps {
  mostrarNotificacion: (
    titulo: string,
    mensaje: string,
    tipo?: AlertColor
  ) => void;
  mostrarLoading: (mensaje?: string) => void;
  ocultarLoading: () => void;
}

const AppUIContext = createContext<AppUIContextProps | undefined>(undefined);

export const AppUIProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notificacion, setNotificacion] = useState({
    abierto: false,
    titulo: "",
    mensaje: "",
    tipo: "info" as AlertColor,
  });

  const [loading, setLoading] = useState({
    abierto: false,
    mensaje: "Cargando...",
  });

  const mostrarNotificacion = (
    titulo: string,
    mensaje: string,
    tipo: AlertColor = "info"
  ) => {
    setNotificacion({ abierto: true, titulo, mensaje, tipo });
  };

  const mostrarLoading = (mensaje = "Cargando...") => {
    setLoading({ abierto: true, mensaje });
  };

  const ocultarLoading = () => setLoading({ abierto: false, mensaje: "" });

  const cerrarNotificacion = () =>
    setNotificacion((prev) => ({ ...prev, abierto: false }));

  return (
    <AppUIContext.Provider
      value={{ mostrarNotificacion, mostrarLoading, ocultarLoading }}
    >
      {children}

      <Notification
        titulo={notificacion.titulo}
        mensaje={notificacion.mensaje}
        tipo={notificacion.tipo}
        abierto={notificacion.abierto}
        onCerrar={cerrarNotificacion}
      />

      <LoadingModal open={loading.abierto} message={loading.mensaje} />
    </AppUIContext.Provider>
  );
};

export default AppUIContext;
