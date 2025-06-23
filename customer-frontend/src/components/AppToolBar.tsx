import React from "react";
import { AppBar, Toolbar, IconButton, Box } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Logo } from "./Logo";
import { LoginSection } from "./LoginSection";

interface AppToolBarProps {
  onDrawerToggle: () => void;
  onLogoClick: () => void;
}

export const AppToolBar: React.FC<AppToolBarProps> = ({
  onDrawerToggle,
  onLogoClick,
}) => {
  return (
    <AppBar position="fixed">
      <Toolbar>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onDrawerToggle}
          >
            <MenuIcon />
          </IconButton>

          {/* Centered Logo */}
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center" }}
            onClick={onLogoClick}
          >
            <Logo />
          </Box>

          {/* Login/User Section */}
          <LoginSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
