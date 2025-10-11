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
  Collapse,
  Tooltip,
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
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import ParametrosForm from "./admin/parametros/params";
import PaisForm from "./admin/parametros/country";
import CiudadForm from "./admin/parametros/city";

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

// 🔹 Estilos base
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

// 🔹 Componente principal
const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const [selectedMenuItem, setSelectedMenuItem] = useState<string>("");
  const [collapsed, setCollapsed] = useState(false);

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

  // 🔹 Menú principal
  const adminMenu: MenuItem[] = [
    {
      text: "Configuración",
      icon: <SettingsIcon />,
      component: <ParametrosForm />,
    },
    {
      text: "Administración",
      icon: <SettingsIcon />,
      children: [
        {
          text: "País",
          icon: <PublicIcon />,
          component: <PaisForm />,
        },
        {
          text: "Ciudad",
          icon: <LocationCityIcon />,
          component: <CiudadForm />,
        },
      ],
    },
  ];

  const studentMenu: MenuItem[] = [
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
    if (collapsed) setCollapsed(false); // 🔹 Si está colapsado, se expande automáticamente

    if (item.children) {
      setOpenSubmenu(openSubmenu === item.text ? null : item.text);
    } else {
      setSelectedMenuItem(item.text);
      setOpenSubmenu(null);
      if (isMobile) handleDrawerToggle();
    }
  };

  const handleSubmenuClick = (subItem: MenuItemWithComponent) => {
    if (collapsed) setCollapsed(false); // 🔹 Se expande al seleccionar un submenú
    setSelectedMenuItem(subItem.text);
    if (isMobile) handleDrawerToggle();
  };

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
                        paddingTop: 0,
                        paddingBottom: 0,
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
                              paddingTop: 0,
                              paddingBottom: 0,
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
        </Toolbar>
      </AppBarStyled>

      {/* Menú lateral */}
      <Box
        component="nav"
        sx={{
          width: {
            md: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
          },
          flexShrink: { md: 0 },
        }}
        aria-label="menu de navegación"
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
    </Box>
  );
};

export default AppLayout;
