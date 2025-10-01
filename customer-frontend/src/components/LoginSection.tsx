import React, { useState } from "react";
import { Box, Button, Avatar, Menu, MenuItem } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useAuth } from "../hooks/useAuth";

export const LoginSection: React.FC = () => {
  const { isLoading, login, logout, isLoggedIn, user } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {!isLoggedIn ? (
        <Button
          variant="contained"
          startIcon={<GoogleIcon />}
          onClick={() => login()}
          disabled={isLoading}
          size="small"
          color="success"
        >
          {isLoading ? "מתחבר..." : "התחבר"}
        </Button>
      ) : (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Button
            onClick={handleMenuOpen}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              textTransform: "none",
              color: "inherit",
            }}
          >
            <Avatar
              src={user?.photoURL || undefined}
              alt={user?.displayName || "User"}
              sx={{ width: 28, height: 28 }}
            >
              {user?.displayName?.charAt(0) || user?.email?.charAt(0) || "U"}
            </Avatar>
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem onClick={handleLogout}>התנתק</MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
};
