import React, { useMemo } from "react";
import {
  AppBar,
  Toolbar,
  Drawer,
  IconButton,
  ListItem,
  ListItemText,
  useTheme,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useDispatch } from "react-redux";
import { selectSidebarIsOpen, sidebarActions } from "../store/sidebarSlice";
import { useAppSelector } from "../store/hooks";
import Logo from "./Logo";
import CartWithBadge from "./CartWithBadge";
import { useMobile } from "../hooks/useMobile";
import { useNavigate } from "react-router-dom";

const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMobile();
  const isSidebarOpen = useAppSelector(selectSidebarIsOpen);
  const dispatch = useDispatch();
  const handleDrawerToggle = () => dispatch(sidebarActions.toggle());
  const navigate = useNavigate();
  const drawerWidth = useMemo(() => (isMobile ? "50%" : "20%"), [isMobile]);

  const handleLinkClick = (path: string) => {
    navigate(path);
    handleDrawerToggle(); // Close the sidebar
  };

  return (
    <>
      <>
        <AppBar position="static">
          <Toolbar>
            <Box display="flex" justifyContent="space-between" width="100%">
              <IconButton
                edge="start"
                color="inherit"
                aria-label="menu"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
              <CartWithBadge />
              <Logo />
            </Box>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="temporary"
          anchor="left"
          open={isSidebarOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          PaperProps={{
            sx: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
              alignItems: "center",
              width: drawerWidth,
              height: "100%",
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            },
          }}
        >
          <Box width="100%">
            <Box
              display="flex"
              flexDirection={"column"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <Logo />
              <ListItem sx={{ cursor: "pointer" }}>
                <ListItemText
                  primary="בית"
                  onClick={() => handleLinkClick("/")}
                />
              </ListItem>
              <ListItem sx={{ cursor: "pointer" }}>
                <ListItemText
                  primary="מוצרים"
                  onClick={() => handleLinkClick("/")}
                />
              </ListItem>
              <ListItem sx={{ cursor: "pointer" }}>
                <ListItemText
                  primary="עגלה"
                  onClick={() => handleLinkClick("/cart")}
                />
              </ListItem>
              <ListItem sx={{ cursor: "pointer" }}>
                <ListItemText
                  primary="נקודות חלוקה"
                  onClick={() => handleLinkClick("/pickups")}
                />
              </ListItem>
              <ListItem sx={{ cursor: "pointer" }}>
                <ListItemText
                  primary="צור קשר"
                  onClick={() => handleLinkClick("/contact")}
                />
              </ListItem>
              <CartWithBadge />
            </Box>
          </Box>
        </Drawer>
      </>
    </>
  );
};

export default Sidebar;
