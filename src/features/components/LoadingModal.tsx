import React from "react";
import { Backdrop, Box, Typography } from "@mui/material";
import { motion } from "framer-motion";
import AirplanemodeActiveIcon from "@mui/icons-material/AirplanemodeActive";

interface LoadingModalProps {
  open: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({
  open,
  message = "Cargando...",
}) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 2000,
        color: "#fff",
        backdropFilter: "blur(6px)",
        backgroundColor: "rgba(0,0,0,0.3)",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Avión volando en diagonal */}
        <motion.div
          style={{ position: "absolute", zIndex: 2 }}
          animate={{
            x: ["-20%", "120%"],
            y: ["0%", "-15%", "0%"],
            rotate: [0, 15, 0],
          }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        >
          <AirplanemodeActiveIcon
            sx={{
              fontSize: 80,
              color: "#0f7c77",
              textShadow: "0 0 15px rgba(66,165,245,0.6)",
            }}
          />
        </motion.div>

        {/* Modal de contenido */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: "spring", stiffness: 120, damping: 15 }}
          style={{
            zIndex: 3,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(15, 25, 40, 0.6)",
            padding: "30px 40px",
            borderRadius: 16,
            minWidth: 280,
            maxWidth: 400,
          }}
        >
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              color: "#0f7c77",
              textAlign: "center",
              textShadow: "0 0 10px rgba(66,165,245,0.8)",
            }}
          >
            FlyHub
          </Typography>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              repeat: Infinity,
              repeatType: "mirror",
              duration: 1.2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: "rgba(255,255,255,0.9)",
                textAlign: "center",
                fontWeight: 500,
              }}
            >
              {message}
            </Typography>
          </motion.div>

          {/* Barra de progreso */}
          <Box
            sx={{
              mt: 4,
              width: "100%",
              height: 8,
              borderRadius: 4,
              background: "rgba(255,255,255,0.1)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            <motion.div
              style={{
                width: "50%",
                height: "100%",
                background: "#0f7c77",
                borderRadius: 4,
                position: "absolute",
                left: "-50%",
              }}
              animate={{ left: ["-50%", "100%"] }}
              transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: 2,
                ease: "linear",
              }}
            />
          </Box>
        </motion.div>
      </Box>
    </Backdrop>
  );
};

export default LoadingModal;
