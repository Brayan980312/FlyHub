import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  CssBaseline,
  useTheme,
  useMediaQuery,
  ListItemButton,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import SettingsIcon from "@mui/icons-material/Settings";
import BookIcon from "@mui/icons-material/Book";
import { useNavigate } from "react-router-dom";
import ParametrosForm from "./admin/parametros/params";

const drawerWidth = 260;

type UserRole = {
  usuarioRolId: number;
  usuarioId: number;
  rolId: number;
};

// 🔹 Estilos base reutilizables
const AppBarStyled = styled(AppBar)(() => ({
  background: "rgba(25, 25, 25, 0.75)",
  backdropFilter: "blur(12px)",
  borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
  boxShadow: "0 4px 30px rgba(0, 0, 0, 0.3)",
  color: "#fff",
}));

const DrawerContainer = styled("div")(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "space-between",
  background: "rgba(25,25,25,0.65)",
  backdropFilter: "blur(10px)",
  color: "#fff",
  borderRight: "1px solid rgba(255,255,255,0.08)",
}));

const DrawerItemButton = styled(ListItemButton)(() => ({
  borderRadius: "12px",
  margin: "4px 8px",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,0.15)",
  },
}));

const MainContainer = styled(Box)(() => ({
  flexGrow: 1,
  padding: "24px",
  width: `calc(100% - ${drawerWidth}px)`,
  color: "#fff",
  background: "#0f1115",
  minHeight: "100vh",
}));

const GlassContent = styled(Box)(() => ({
  background: "rgba(30, 30, 30, 0.55)",
  borderRadius: "20px",
  padding: "24px",
  border: "1px solid rgba(255,255,255,0.1)",
  backdropFilter: "blur(10px)",
  boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
}));

// 🔹 Componente principal
const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const usuarioNombres = localStorage.getItem("usuarioNombres") || "";
  const roles = JSON.parse(localStorage.getItem("roles") || "[]") as UserRole[];
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const userRole = roles[0] ?? null;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const adminMenu = [
    {
      text: "Parametrización",
      icon: <SettingsIcon />,
      component: <ParametrosForm />,
    },
  ];

  const studentMenu = [
    {
      text: "Inscribir materias",
      icon: <BookIcon />,
      component: <ParametrosForm />,
    },
  ];

  const menuItems = userRole?.rolId === 1 ? adminMenu : studentMenu;

  const renderContent = () => {
    if (!selectedMenuItem) {
      return (
        <>
          <Typography variant="h4" gutterBottom sx={{ color: "#00bfa5" }}>
            Bienvenido {usuarioNombres}
          </Typography>
          <Typography>¿Qué harás hoy?</Typography>
        </>
      );
    }

    const item = menuItems.find((item) => item.text === selectedMenuItem);
    return item?.component || null;
  };

  const drawer = (
    <DrawerContainer>
      <Box>
        <Toolbar>
          <Typography variant="subtitle1" noWrap component="div">
            FlyHub
          </Typography>
        </Toolbar>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <DrawerItemButton
                onClick={() => {
                  setSelectedMenuItem(item.text);
                  if (isMobile) handleDrawerToggle();
                }}
                sx={{
                  backgroundColor:
                    selectedMenuItem === item.text
                      ? "rgba(255,255,255,0.12)"
                      : "transparent",
                }}
              >
                <ListItemIcon sx={{ color: "#00bfa5" }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </DrawerItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      <Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <ListItem
          sx={{
            cursor: "pointer",
            "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
          }}
          onClick={handleLogout}
        >
          <ListItemIcon sx={{ color: "#f44336" }}>
            <LogoutIcon />
          </ListItemIcon>
          <ListItemText primary="Cerrar sesión" />
        </ListItem>
      </Box>
    </DrawerContainer>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      {/* 🔹 Barra superior */}
      <AppBarStyled
        position="fixed"
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: "none" } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {usuarioNombres}
          </Typography>

          <Button
            variant="contained"
            sx={{
              backgroundColor: "#00bfa5",
              color: "#fff",
              borderRadius: "25px",
              px: 3,
              textTransform: "none",
              "&:hover": { backgroundColor: "#00a896" },
            }}
          >
            Ayuda
          </Button>
        </Toolbar>
      </AppBarStyled>

      {/* 🔹 Menú lateral */}
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        aria-label="menu de navegación"
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              border: "none",
              borderRadius: { md: "0 20px 20px 0" },
              boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* 🔹 Contenido principal */}
      <MainContainer>
        <Toolbar />
        <GlassContent>{renderContent()}</GlassContent>
      </MainContainer>
    </Box>
  );
};

export default AppLayout;
