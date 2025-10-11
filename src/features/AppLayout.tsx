import React, { useEffect, useState } from "react";
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
  Collapse,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  ExpandLess,
  ExpandMore,
  Menu as MenuIcon,
  Logout as LogoutIcon,
  Settings as SettingsIcon,
  Book as BookIcon,
  Public as PublicIcon,
  LocationCity as LocationCityIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  AttachMoney as AttachMoneyIcon,
  AddCircle as AddCircleIcon,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ParametrosForm from "./admin/params";
import MetodoPagoForm from "./admin/methodPay";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CiudadForm from "./admin/city";
import PaisForm from "./admin/country";
import {
  createUpdateCreditoUsuario,
  searchCreditoUsuario,
} from "../api/services/creditUserService";
import { useAppUI } from "../context/useAppUI";
import type { ErrorResponse } from "../api/types/errorResponse";
import type { responseAllCreditUser } from "../api/types/credist";

// ======= Tipos =======
type MenuItemBase = {
  text: string;
  icon: React.ReactElement;
};

type MenuItemWithComponent = MenuItemBase & {
  component: React.ReactElement;
  children?: undefined;
};

type MenuItemWithChildren = MenuItemBase & {
  children: MenuItemWithComponent[];
  component?: undefined;
};

type MenuItem = MenuItemWithComponent | MenuItemWithChildren;

const drawerWidthExpanded = 260;
const drawerWidthCollapsed = 80;

type UserRole = {
  usuarioRolId: number;
  usuarioId: number;
  rolId: number;
};

// ======= Estilos =======
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

// ======= Componente principal =======
const AppLayout: React.FC = () => {
  const [creditosUsuario, setcreditosUsuario] =
    useState<responseAllCreditUser>();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [valorCargar, setValorCargar] = useState<number>(0);
  const { mostrarNotificacion } = useAppUI();

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const usuarioNombres = localStorage.getItem("usuarioNombres") || "";
  const roles = JSON.parse(localStorage.getItem("roles") || "[]") as UserRole[];
  const userRole = roles[0] ?? null;

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const handleCollapseToggle = () => setCollapsed(!collapsed);
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  useEffect(() => {
    handleSearchCreditUser();
  }, []);

  const handleSearchCreditUser = async () => {
    const dataObtenida: responseAllCreditUser = await searchCreditoUsuario();
    console.log(dataObtenida);
    if (
      dataObtenida.creditoUsuarioId == null ||
      dataObtenida.creditoUsuarioId == 0
    ) {
      dataObtenida.creditoUsuarioId = 0;
      dataObtenida.creditoUsuarioCreditos = 0;
    }
    setcreditosUsuario(dataObtenida);
  };

  // ======= Nueva funcionalidad: Cargar créditos =======
  const handleAbrirModal = () => setModalOpen(true);
  const handleCerrarModal = () => {
    setValorCargar(0);
    setModalOpen(false);
  };

  const handleCargarCreditos = async () => {
    if (valorCargar > 0) {
      try {
        await createUpdateCreditoUsuario({
          creditoUsuarioId: creditosUsuario?.creditoUsuarioId,
          usuarioId: creditosUsuario?.usuarioId,
          creditoUsuarioCreditos: valorCargar,
          accion: 1,
        });
        mostrarNotificacion(
          "Cargar creditos",
          "Créditos cargados con exito",
          "success"
        );
        handleCerrarModal();
        handleSearchCreditUser();
      } catch (error) {
        const err = error as ErrorResponse;
        if (err.status === 422 && err.detail) {
          mostrarNotificacion("Validación de negocio", err.detail, "warning");
        } else {
          mostrarNotificacion(
            "Error en la apicación",
            "Error desconocido.",
            "error"
          );
        }
      }
    }
  };

  // ======= Menú =======
  const adminMenu: MenuItem[] = [
    {
      text: "Configuración",
      icon: <SettingsIcon />,
      component: <ParametrosForm />,
    },
    {
      text: "Administración",
      icon: <AdminPanelSettingsIcon />,
      children: [
        { text: "País", icon: <PublicIcon />, component: <PaisForm /> },
        {
          text: "Ciudad",
          icon: <LocationCityIcon />,
          component: <CiudadForm />,
        },
        {
          text: "Metodo de pago",
          icon: <AttachMoneyIcon />,
          component: <MetodoPagoForm />,
        },
      ],
    },
  ];

  const clientMenu: MenuItem[] = [
    {
      text: "Inscribir materias",
      icon: <BookIcon />,
      component: <ParametrosForm />,
    },
  ];

  const menuItems = userRole?.rolId === 1 ? adminMenu : clientMenu;

  const renderContent = () => {
    if (!selectedMenuItem) {
      return (
        <>
          <Typography variant="h4" gutterBottom sx={{ color: "#0f7c77" }}>
            Bienvenido {usuarioNombres}
          </Typography>
          <Typography>¿Qué harás hoy?</Typography>
        </>
      );
    }

    for (const item of menuItems) {
      if (item.text === selectedMenuItem && item.component)
        return item.component;
      if (item.children) {
        const sub = item.children.find((c) => c.text === selectedMenuItem);
        if (sub) return sub.component;
      }
    }
    return null;
  };

  const handleMenuClick = (item: MenuItem) => {
    if (collapsed) setCollapsed(false);
    if (item.children)
      setOpenSubmenu(openSubmenu === item.text ? null : item.text);
    else {
      setSelectedMenuItem(item.text);
      setOpenSubmenu(null);
      if (isMobile) handleDrawerToggle();
    }
  };

  const handleSubmenuClick = (subItem: MenuItemWithComponent) => {
    if (collapsed) setCollapsed(false);
    setSelectedMenuItem(subItem.text);
    if (isMobile) handleDrawerToggle();
  };

  // ======= Drawer =======
  const drawer = (
    <DrawerContainer>
      <Box>
        <Toolbar
          sx={{ justifyContent: collapsed ? "center" : "space-between" }}
        >
          {!collapsed && (
            <Typography variant="subtitle1" noWrap component="div">
              FlyHub
            </Typography>
          )}
          <IconButton
            onClick={handleCollapseToggle}
            color="inherit"
            size="small"
          >
            {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
          </IconButton>
        </Toolbar>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />

        <List>
          {menuItems.map((item) => {
            const isOpen = openSubmenu === item.text;
            return (
              <React.Fragment key={item.text}>
                <Tooltip title={collapsed ? item.text : ""} placement="right">
                  <ListItem disablePadding>
                    <DrawerItemButton
                      onClick={() => handleMenuClick(item)}
                      sx={{
                        backgroundColor:
                          selectedMenuItem === item.text
                            ? "rgba(255,255,255,0.12)"
                            : "transparent",
                        justifyContent: collapsed ? "center" : "flex-start",
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          color: "#0f7c77",
                          minWidth: collapsed ? "0" : "40px",
                          justifyContent: "center",
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>
                      {!collapsed && <ListItemText primary={item.text} />}
                      {!collapsed &&
                        item.children &&
                        (isOpen ? <ExpandLess /> : <ExpandMore />)}
                    </DrawerItemButton>
                  </ListItem>
                </Tooltip>

                {!collapsed && item.children && (
                  <Collapse in={isOpen} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      {item.children.map((subItem) => (
                        <ListItem key={subItem.text} disablePadding>
                          <DrawerItemButton
                            sx={{
                              pl: 6,
                              backgroundColor:
                                selectedMenuItem === subItem.text
                                  ? "rgba(255,255,255,0.12)"
                                  : "transparent",
                            }}
                            onClick={() => handleSubmenuClick(subItem)}
                          >
                            <ListItemIcon sx={{ color: "#0f7c77" }}>
                              {subItem.icon}
                            </ListItemIcon>
                            <ListItemText primary={subItem.text} />
                          </DrawerItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>
                )}
              </React.Fragment>
            );
          })}
        </List>
      </Box>

      <Box>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
        <Tooltip title={collapsed ? "Cerrar sesión" : ""} placement="right">
          <ListItem
            sx={{
              cursor: "pointer",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.12)" },
              justifyContent: collapsed ? "center" : "flex-start",
            }}
            onClick={handleLogout}
          >
            <ListItemIcon
              sx={{
                color: "#f44336",
                minWidth: collapsed ? "0" : "40px",
                justifyContent: "center",
              }}
            >
              <LogoutIcon />
            </ListItemIcon>
            {!collapsed && <ListItemText primary="Cerrar sesión" />}
          </ListItem>
        </Tooltip>
      </Box>
    </DrawerContainer>
  );

  // ======= Render =======
  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBarStyled
        position="fixed"
        sx={{
          width: {
            md: `calc(100% - ${
              collapsed ? drawerWidthCollapsed : drawerWidthExpanded
            }px)`,
          },
          ml: {
            md: `${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px`,
          },
          transition: "width 0.3s ease, margin 0.3s ease",
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {usuarioNombres}
          </Typography>

          {/* Créditos y botón de carga (solo clientes) */}
          {userRole?.rolId !== 1 && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <AttachMoneyIcon sx={{ color: "#0f7c77" }} />
              <Typography variant="body1">
                {creditosUsuario?.creditoUsuarioCreditos.toLocaleString(
                  "es-CO",
                  {
                    style: "currency",
                    currency: "COP",
                    minimumFractionDigits: 0,
                  }
                )}
              </Typography>
              <Tooltip title="Cargar créditos">
                <IconButton color="inherit" onClick={handleAbrirModal}>
                  <AddCircleIcon sx={{ color: "#0f7c77" }} />
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Toolbar>
      </AppBarStyled>

      {/* Drawer lateral */}
      <Box
        component="nav"
        sx={{
          width: { md: collapsed ? drawerWidthCollapsed : drawerWidthExpanded },
          flexShrink: { md: 0 },
        }}
      >
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              width: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
              border: "none",
              borderRadius: { md: "0 0 20px 0" },
              boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
              overflowX: "hidden",
              transition: "width 0.3s ease",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido principal */}
      <MainContainer
        sx={{
          width: {
            md: `calc(100% - ${
              collapsed ? drawerWidthCollapsed : drawerWidthExpanded
            }px)`,
          },
          transition: "width 0.3s ease",
        }}
      >
        <Toolbar />
        <GlassContent>{renderContent()}</GlassContent>
      </MainContainer>

      {/* Modal de carga de créditos */}
      <Dialog
        open={modalOpen}
        onClose={(event, reason) => {
          // Evita cerrar al hacer clic fuera o presionar ESC
          if (reason !== "backdropClick" && reason !== "escapeKeyDown") {
            handleCerrarModal();
          }
        }}
        PaperProps={{
          sx: {
            background: "rgba(30,30,30,0.9)",
            color: "#fff",
            borderRadius: "16px",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <DialogTitle>Cargar créditos</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Valor a cargar (COP)"
            type="text"
            fullWidth
            variant="outlined"
            value={valorCargar === 0 ? "" : valorCargar}
            onChange={(e) => {
              const inputValue = e.target.value;

              // Solo permitir números y vacío
              if (/^\d*$/.test(inputValue)) {
                const numericValue = inputValue === "" ? 0 : Number(inputValue);

                // Limitar a máximo 10.000.000
                if (numericValue <= 10000000) {
                  setValorCargar(numericValue);
                }
              }
            }}
            placeholder="Ingrese el valor (máx. 10.000.000)"
            sx={{
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                "& fieldset": { borderColor: "rgba(255,255,255,0.3)" },
              },
              "& .MuiInputLabel-root": { color: "#aaa" },
              // Quitar flechas de incremento/decremento
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                { display: "none" },
              "& input[type=number]": { MozAppearance: "textfield" },
            }}
          />

          {/* Mensaje de advertencia cuando se excede el límite */}
          {valorCargar > 10000000 && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              El valor máximo permitido es 1.000.000 COP
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCerrarModal} color="error">
            Cancelar
          </Button>
          <Button
            onClick={handleCargarCreditos}
            color="success"
            disabled={valorCargar <= 0 || valorCargar > 10000000}
          >
            Cargar créditos
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppLayout;
