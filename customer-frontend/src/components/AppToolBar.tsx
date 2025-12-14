import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Chip,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { Logo } from "./Logo";
import { useUnpaidDonationsForCurrentUser } from "../hooks/usePrayerDonations";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useUser } from "../hooks/useUser";
import { useAuth } from "../hooks/useAuth";
import { formatCurrency } from "../utils/donationStats";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

interface AppToolBarProps {
  onLogoClick: () => void;
}

export const AppToolBar: React.FC<AppToolBarProps> = ({ onLogoClick }) => {
  const unpaidDonations = useUnpaidDonationsForCurrentUser();
  const { data: synagogue } = useSelectedSynagogue();
  const navigate = useSynagogueNavigate();
  const routerNavigate = useNavigate();
  const { isGabaiOrHigher, displayName } = useUser();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const totalUnpaidAmount = useMemo(() => {
    return unpaidDonations.reduce((sum, donation) => sum + donation.amount, 0);
  }, [unpaidDonations]);

  const handleDebtClick = () => {
    navigate("prayer-card");
  };

  const handleSettingsClick = () => {
    navigate("settings");
  };

  const handleAccountMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleAccountMenuClose();
    routerNavigate("/synagogues");
  };

  const handleSettingsFromMenu = () => {
    navigate("settings");
    handleAccountMenuClose();
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          {/* Left side: Account Icon */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {user ? (
              <>
                <IconButton
                  color="inherit"
                  aria-label="account"
                  onClick={handleAccountMenuOpen}
                  sx={{ p: 0.5 }}
                >
                  <Avatar
                    src={user.photoURL || undefined}
                    alt={displayName || "User"}
                    sx={{ width: 32, height: 32 }}
                  >
                    {displayName?.charAt(0) || user.email?.charAt(0) || "U"}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleAccountMenuClose}
                  anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "left",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "left",
                  }}
                >
                  <MenuItem onClick={handleSettingsFromMenu}>הגדרות</MenuItem>
                  <MenuItem onClick={handleLogout}>התנתק</MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ width: 40 }} />
            )}
          </Box>

          {/* Centered Logo */}
          <Box
            sx={{ flex: 1, display: "flex", justifyContent: "center" }}
            onClick={onLogoClick}
          >
            <Logo />
          </Box>

          {/* Right side: Debt Badge and Settings */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Debt Badge - Only show if feature is enabled and user has unpaid debt */}
            {synagogue?.isDonationTrackingEnabled && totalUnpaidAmount > 0 && (
              <Chip
                label={formatCurrency(totalUnpaidAmount)}
                color="error"
                variant="filled"
                onClick={handleDebtClick}
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    backgroundColor: "error.dark",
                  },
                }}
              />
            )}

            {/* Settings Button - Available to all users */}
            <IconButton
              color="inherit"
              aria-label="settings"
              onClick={handleSettingsClick}
            >
              <SettingsIcon />
            </IconButton>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
