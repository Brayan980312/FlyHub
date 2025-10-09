import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";

// Detectar si el usuario tiene modo oscuro en su sistema
const prefersDarkMode = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches;

// Crear el tema dinámico
const theme = createTheme({
  palette: {
    mode: prefersDarkMode ? "dark" : "light",
    primary: {
      main: "#0f7c77",
    },
    secondary: {
      main: "#ff9800",
    },
    background: {
      default: prefersDarkMode ? "#121212" : "#f5f5f5",
      paper: prefersDarkMode ? "#1e1e1e" : "#fff",
    },
  },
  typography: {
    fontFamily: "'Poppins', 'Roboto', 'Helvetica', 'Arial', sans-serif",
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
