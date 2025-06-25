import React, { useMemo } from "react";
import {
  Drawer,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  Box,
} from "@mui/material";
import {
  AttachMoney as DonationsIcon,
  Book as ToraLessonsIcon,
  AccessTime as PrayerTimesIcon,
  Person as PrayerCardIcon,
  Assessment as FinancialReportsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { Logo } from "./Logo";
import { useMobile } from "../hooks/useMobile";
import { WithLogin } from "./WithLogin";

interface SidebarItemProps {
  text: string;
  onClick: () => void;
  icon: React.ReactNode;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ text, onClick, icon }) => {
  const theme = useTheme();
  return (
    <ListItem
      sx={{
        cursor: "pointer",
        "&:hover": {
          backgroundColor: theme.palette.primary.light,
          transition: "background-color 0.3s",
        },
      }}
    >
      <ListItemIcon
        sx={{ color: theme.palette.primary.contrastText, minWidth: 40 }}
      >
        {icon}
      </ListItemIcon>
      <ListItemText primary={text} onClick={onClick} />
    </ListItem>
  );
};

interface AppSideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onLinkClick: (path: string) => void;
  onLogout: () => void;
}

export const AppSideBar: React.FC<AppSideBarProps> = ({
  isOpen,
  onClose,
  onLinkClick,
  onLogout,
}) => {
  const theme = useTheme();
  const isMobile = useMobile();
  const drawerWidth = useMemo(() => (isMobile ? "60%" : "20%"), [isMobile]);

  return (
    <Drawer
      variant="temporary"
      anchor="left"
      open={isOpen}
      onClose={onClose}
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
          <SidebarItem
            text="תרומות"
            onClick={() => onLinkClick("/donations")}
            icon={<DonationsIcon />}
          />
          <SidebarItem
            text="שיעורי תורה"
            onClick={() => onLinkClick("/tora-lessons")}
            icon={<ToraLessonsIcon />}
          />
          <SidebarItem
            text="זמני תפילות"
            onClick={() => onLinkClick("/prayer-times")}
            icon={<PrayerTimesIcon />}
          />
          <WithLogin>
            <SidebarItem
              text="כרטיס התפילה שלי"
              onClick={() => onLinkClick("/prayer-card")}
              icon={<PrayerCardIcon />}
            />
          </WithLogin>
          <SidebarItem
            text="דוחות כספיים"
            onClick={() => onLinkClick("/financial-reports")}
            icon={<FinancialReportsIcon />}
          />
          <WithLogin>
            <SidebarItem
              text="התנתק"
              onClick={onLogout}
              icon={<LogoutIcon />}
            />
          </WithLogin>
        </Box>
      </Box>
    </Drawer>
  );
};
