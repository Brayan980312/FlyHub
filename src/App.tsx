import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import type { JSX } from "react";

import Home from "./features/auth/pages/Home";
import AppLayout from "./features/AppLayout";
import { STORAGE_KEYS } from "./api/constans";
import { AppUIProvider } from "./context/AppUIContext";

interface RequireAuthProps {
  children: JSX.Element;
}

function RequireAuth({ children }: RequireAuthProps) {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (!token) {
    return <Navigate to="/home" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route
          path="/"
          element={
            <RequireAuth>
              <AppUIProvider>
                <AppLayout />
              </AppUIProvider>
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
