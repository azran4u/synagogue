import React from "react";
import { AppBar, Toolbar, IconButton, Box, Badge, Chip } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { Logo } from "./Logo";
import { LoginSection } from "./LoginSection";
import { useUnpaidDonationsForCurrentUser } from "../hooks/usePrayerDonations";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { formatCurrency } from "../utils/donationStats";
import { useMemo } from "react";

interface AppToolBarProps {
  onDrawerToggle: () => void;
  onLogoClick: () => void;
}

export const AppToolBar: React.FC<AppToolBarProps> = ({
  onDrawerToggle,
  onLogoClick,
}) => {
  const unpaidDonations = useUnpaidDonationsForCurrentUser();
  const { data: synagogue } = useSelectedSynagogue();
  const navigate = useSynagogueNavigate();

  const totalUnpaidAmount = useMemo(() => {
    return unpaidDonations.reduce((sum, donation) => sum + donation.amount, 0);
  }, [unpaidDonations]);

  const handleDebtClick = () => {
    navigate("prayer-card");
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

          {/* Debt Badge - Only show if feature is enabled and user has unpaid debt */}
          {synagogue?.isDonationTrackingEnabled && totalUnpaidAmount > 0 && (
            <Box sx={{ mx: 2 }}>
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
            </Box>
          )}

          {/* Login/User Section */}
          <LoginSection />
        </Box>
      </Toolbar>
    </AppBar>
  );
};
