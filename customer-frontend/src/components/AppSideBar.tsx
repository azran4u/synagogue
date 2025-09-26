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
  Business as SynagogueIcon,
  List as ListIcon,
  Settings as AdminIcon,
  Event as EventTypesIcon,
  Group as AliyaTypesIcon,
  Assignment as AliyaAssignmentIcon,
} from "@mui/icons-material";
import { Logo } from "./Logo";
import { useMobile } from "../hooks/useMobile";
import { WithLogin } from "./WithLogin";
import { useIsAdmin } from "../hooks/useIsAdmin";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

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
  const isAdmin = useIsAdmin();
  const drawerWidth = useMemo(() => (isMobile ? "60%" : "20%"), [isMobile]);
  const navigate = useSynagogueNavigate();

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
            text="בתי כנסת"
            onClick={() => navigate("synagogues", false)}
            icon={<ListIcon />}
          />
          <SidebarItem
            text="שיעורי תורה"
            onClick={() => navigate("tora-lessons")}
            icon={<ToraLessonsIcon />}
          />
          <SidebarItem
            text="זמני תפילות"
            onClick={() => navigate("prayer-times")}
            icon={<PrayerTimesIcon />}
          />
          <WithLogin>
            <SidebarItem
              text="כרטיס המתפלל שלי"
              onClick={() => navigate("prayer-card")}
              icon={<PrayerCardIcon />}
            />
          </WithLogin>

          <SidebarItem
            text="דוחות כספיים"
            onClick={() => navigate("financial-reports")}
            icon={<FinancialReportsIcon />}
          />
          <SidebarItem
            text="תרומות"
            onClick={() => navigate("donations")}
            icon={<DonationsIcon />}
          />

          {/* Admin Section */}
          {isAdmin && (
            <>
              <Box
                sx={{
                  width: "80%",
                  height: "1px",
                  backgroundColor: theme.palette.primary.contrastText,
                  opacity: 0.3,
                  margin: "16px auto",
                }}
              />
              <SidebarItem
                text="ניהול סוגי אירועים"
                onClick={() => navigate("admin/prayer-event-types")}
                icon={<EventTypesIcon />}
              />
              <SidebarItem
                text="ניהול סוגי עליות"
                onClick={() => navigate("admin/aliya-types")}
                icon={<AliyaTypesIcon />}
              />
              <SidebarItem
                text="ניהול עליות"
                onClick={() => navigate("admin/aliya-assignment")}
                icon={<AliyaAssignmentIcon />}
              />
              <SidebarItem
                text="הגדרות מנהל"
                onClick={() => navigate("admin/settings")}
                icon={<AdminIcon />}
              />
            </>
          )}

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
