import { useContext } from "react";
import AppUIContext from "./AppUIContext";

export const useAppUI = () => {
  const context = useContext(AppUIContext);
  if (!context) {
    throw new Error("useAppUI debe ser usado dentro de un AppUIProvider");
  }
  return context;
};
