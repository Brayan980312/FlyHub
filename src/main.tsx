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
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: "2px 12px",
        },
        head: {
          padding: "8px 12px",
          fontWeight: "bold",
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        "*::-webkit-scrollbar": {
          width: "10px",
          height: "10px",
        },
        "*::-webkit-scrollbar-track": {
          backgroundColor: "#1a1a1a",
        },
        "*::-webkit-scrollbar-thumb": {
          backgroundColor: "#0f7c77",
          borderRadius: "10px",
          border: "2px solid #1a1a1a",
        },
        "*::-webkit-scrollbar-thumb:hover": {
          backgroundColor: "#10a39b",
        },
        "*": {
          scrollbarWidth: "thin",
          scrollbarColor: "#0f7c77 #1a1a1a",
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
