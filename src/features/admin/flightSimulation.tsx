import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  LinearProgress,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlightLandIcon from "@mui/icons-material/FlightLand";
import AirlineSeatReclineNormalIcon from "@mui/icons-material/AirlineSeatReclineNormal";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { motion } from "framer-motion";
import { updateStateFlight } from "../../api/services/flightService";
import type { ErrorResponse } from "../../api/types/errorResponse";

const COLOR_PRINCIPAL = "#0f7c77";

const pasosVuelo = [
  { label: "Embarque", estado: 4, icon: <AirlineSeatReclineNormalIcon /> },
  { label: "Despegue", estado: 5, icon: <FlightTakeoffIcon /> },
  { label: "Aterrizaje", estado: 6, icon: <FlightLandIcon /> },
  { label: "Finalizado", estado: 7, icon: <CheckCircleIcon /> },
];

export const ModalSimulacionVuelo = ({
  open,
  onClose,
  estadoActual,
  vueloId,
  vueloCodigo,
  avionNombre,
}: {
  open: boolean;
  onClose: () => void;
  estadoActual: number;
  vueloId: number | null;
  vueloCodigo: string | null;
  avionNombre: string | null;
}) => {
  const [indiceActual, setIndiceActual] = useState(0);
  const [progreso, setProgreso] = useState(0);
  const [enCurso, setEnCurso] = useState(true);
  const [errorSimulacion, setErrorSimulacion] = useState<string | null>(null);

  const pasosPendientes = pasosVuelo.filter((p) => p.estado > estadoActual);
  const totalPasos = pasosPendientes.length;

  // 👉 función que actualiza el estado del vuelo en el backend
  const handleCambiarEstado = async (
    vueloId: number,
    nuevoEstado: number
  ): Promise<boolean> => {
    try {
      await updateStateFlight({ VueloId: vueloId, EstadoVueloId: nuevoEstado });
      return true;
    } catch (error) {
      const err = error as ErrorResponse;
      if (
        (err.status === 422 || err.status === 403 || err.status === 401) &&
        err.detail
      ) {
        setErrorSimulacion(err.detail);
      } else {
        setErrorSimulacion("Error desconocido al actualizar el vuelo.");
      }
      return false;
    }
  };

  useEffect(() => {
    if (!open || !vueloId) return;

    let pasoIndex = 0;
    setIndiceActual(0);
    setProgreso(0);
    setEnCurso(true);
    setErrorSimulacion(null);

    const bloquearSalida = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue =
        "No puedes cerrar o recargar la página mientras la simulación está en curso.";
    };
    window.addEventListener("beforeunload", bloquearSalida);

    const ejecutarPaso = async () => {
      if (pasoIndex >= totalPasos) {
        setEnCurso(false);
        window.removeEventListener("beforeunload", bloquearSalida);
        return;
      }

      const paso = pasosPendientes[pasoIndex];
      if (paso && vueloId) {
        // 👇 Intentar cambiar estado
        const exito = await handleCambiarEstado(vueloId, paso.estado);
        if (!exito) {
          // ❌ Detener simulación en caso de error
          setEnCurso(false);
          window.removeEventListener("beforeunload", bloquearSalida);
          return;
        }
      }

      let porcentaje = 0;
      const duracionPaso = 3000;
      const intervalo = 100;
      const incremento = 100 / (duracionPaso / intervalo);

      const timer = setInterval(() => {
        porcentaje += incremento;
        setProgreso(Math.min(porcentaje, 100));

        if (porcentaje >= 100) {
          clearInterval(timer);
          pasoIndex++;
          setTimeout(() => {
            setIndiceActual(pasoIndex);
            ejecutarPaso();
          }, 400);
        }
      }, intervalo);
    };

    ejecutarPaso();

    return () => {
      window.removeEventListener("beforeunload", bloquearSalida);
    };
  }, [open, vueloId]);

  const pasoActual = pasosPendientes[indiceActual];

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (enCurso && reason === "backdropClick") return;
        if (!enCurso) onClose();
      }}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          background: "linear-gradient(145deg, #091c1b, #0a2523)",
          color: "white",
          borderRadius: 5,
          boxShadow: `0 0 02px ${COLOR_PRINCIPAL}55`,
          overflow: "hidden",
          pointerEvents: enCurso ? "none" : "auto",
        },
      }}
    >
      <DialogTitle
        sx={{
          textAlign: "center",
          py: 2.5,
          background: `linear-gradient(90deg, ${COLOR_PRINCIPAL}, #13a198)`,
          color: "white",
          fontSize: "1.4rem",
          fontWeight: "bold",
          letterSpacing: 0.8,
          textTransform: "uppercase",
          boxShadow: `inset 0 -2px 8px rgba(0,0,0,0.3)`,
        }}
      >
        Simulación de Vuelo {vueloCodigo} con avión {avionNombre}
      </DialogTitle>

      <DialogContent sx={{ py: 4, px: 5 }}>
        {/* Si hubo error */}
        {errorSimulacion ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", py: 5 }}>
              <ErrorOutlineIcon
                sx={{
                  fontSize: 100,
                  color: "#ff4d4d",
                  mb: 2,
                  textShadow: "0 0 15px #ff4d4d77",
                }}
              />
              <Typography
                variant="h4"
                sx={{ color: "#ff4d4d", fontWeight: "bold", mb: 1 }}
              >
                Error en la simulación
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                {errorSimulacion}
              </Typography>
            </Box>
          </motion.div>
        ) : enCurso ? (
          <motion.div
            key={indiceActual}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Box sx={{ textAlign: "center", mb: 4 }}>
              <Box
                sx={{
                  fontSize: 80,
                  color: COLOR_PRINCIPAL,
                  textShadow: `0 0 20px ${COLOR_PRINCIPAL}`,
                  mb: 1,
                }}
              >
                {pasoActual?.icon}
              </Box>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 1 }}>
                {pasoActual?.label}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "rgba(255,255,255,0.75)",
                  letterSpacing: 0.3,
                  mb: 2,
                }}
              >
                {pasoActual?.estado === 4 && "Realizando embarque..."}
                {pasoActual?.estado === 5 && "Iniciando despegue..."}
                {pasoActual?.estado === 6 && "Ejecutando aterrizaje..."}
                {pasoActual?.estado === 7 && "Finalizando vuelo..."}
              </Typography>
            </Box>

            {/* Barra de progreso */}
            <Box
              sx={{
                width: "100%",
                mb: 4,
                background: "rgba(255,255,255,0.08)",
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <LinearProgress
                variant="determinate"
                value={progreso}
                sx={{
                  height: 14,
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${COLOR_PRINCIPAL}, #19b5ac, #3ed0c8)`,
                    transition: "transform 0.1s linear",
                    transformOrigin: "left",
                  },
                }}
              />
              <Typography
                variant="body2"
                sx={{
                  mt: 1,
                  textAlign: "center",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "monospace",
                }}
              >
                {Math.round(progreso)}%
              </Typography>
            </Box>

            {/* Stepper */}
            <Stepper
              activeStep={indiceActual}
              alternativeLabel
              sx={{
                "& .MuiStepLabel-label": { color: "rgba(255,255,255,0.7)" },
                "& .MuiStepIcon-root": { color: "rgba(255,255,255,0.2)" },
                "& .Mui-active": { color: COLOR_PRINCIPAL },
                "& .Mui-completed": { color: "#21c7bc" },
              }}
            >
              {pasosPendientes.map((p) => (
                <Step key={p.label}>
                  <StepLabel>{p.label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </motion.div>
        ) : (
          // ✅ Simulación completada
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CheckCircleIcon
                sx={{
                  fontSize: 100,
                  color: COLOR_PRINCIPAL,
                  mb: 2,
                  textShadow: `0 0 20px ${COLOR_PRINCIPAL}`,
                }}
              />
              <Typography
                variant="h4"
                sx={{ color: COLOR_PRINCIPAL, fontWeight: "bold", mb: 1 }}
              >
                Simulación completada
              </Typography>
              <Typography
                variant="body1"
                sx={{ color: "rgba(255,255,255,0.7)" }}
              >
                El vuelo ha sido completado exitosamente. Gracias por usar el
                sistema de simulación.
              </Typography>
            </Box>
          </motion.div>
        )}
      </DialogContent>
    </Dialog>
  );
};
