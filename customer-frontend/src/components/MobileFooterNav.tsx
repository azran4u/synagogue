import React, { useState } from "react";
import { BottomNavigation, BottomNavigationAction, Paper } from "@mui/material";
import {
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  AccountBalance as AccountBalanceIcon,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { TimesDrawer } from "./TimesDrawer";
import { FinancialsDrawer } from "./FinancialsDrawer";

export const MobileFooterNav: React.FC = () => {
  const navigate = useSynagogueNavigate();
  const location = useLocation();
  const { data: synagogue } = useSelectedSynagogue();
  const [timesDrawerOpen, setTimesDrawerOpen] = useState(false);
  const [financialsDrawerOpen, setFinancialsDrawerOpen] = useState(false);
  const [value, setValue] = React.useState<string>("");

  // Only show footer nav when a synagogue is selected (not on /synagogues page)
  const shouldShow = React.useMemo(() => {
    return synagogue !== null && !location.pathname.includes("/synagogues");
  }, [synagogue, location.pathname]);

  // Determine active tab based on current route
  React.useEffect(() => {
    const path = location.pathname;
    if (path.includes("/prayer-card")) {
      setValue("profile");
    } else if (
      path.includes("/prayer-times") ||
      path.includes("/tora-lessons")
    ) {
      setValue("times");
    } else if (
      path.includes("/donations") ||
      path.includes("/financial-reports")
    ) {
      setValue("financials");
    } else {
      setValue("");
    }
  }, [location.pathname]);

  const handleTimesClick = () => {
    setTimesDrawerOpen(true);
  };

  const handleFinancialsClick = () => {
    setFinancialsDrawerOpen(true);
  };

  const handleProfileClick = () => {
    navigate("prayer-card");
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: 1,
          borderColor: "divider",
        }}
        elevation={3}
      >
        <BottomNavigation
          value={value}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          showLabels
          sx={{
            height: 64,
            "& .MuiBottomNavigationAction-root": {
              minWidth: "auto",
              paddingTop: 1,
              paddingBottom: 1,
            },
          }}
        >
          <BottomNavigationAction
            label="זמנים"
            icon={<ScheduleIcon />}
            onClick={handleTimesClick}
            value="times"
          />
          <BottomNavigationAction
            label="הפרופיל שלי"
            icon={<PersonIcon />}
            onClick={handleProfileClick}
            value="profile"
          />
          <BottomNavigationAction
            label="כספים"
            icon={<AccountBalanceIcon />}
            onClick={handleFinancialsClick}
            value="financials"
          />
        </BottomNavigation>
      </Paper>
      <TimesDrawer
        open={timesDrawerOpen}
        onClose={() => setTimesDrawerOpen(false)}
      />
      <FinancialsDrawer
        open={financialsDrawerOpen}
        onClose={() => setFinancialsDrawerOpen(false)}
      />
    </>
  );
};
