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
  List as ListIcon,
  Settings as AdminIcon,
  Event as EventTypesIcon,
  Group as AliyaTypesIcon,
  Assignment as AliyaAssignmentIcon,
  People as AdminPrayerCardsIcon,
  BugReport as FrontendErrorsIcon,
  HolidayVillage as SynagogueIcon,
} from "@mui/icons-material";
import { Logo } from "./Logo";
import { useMobile } from "../hooks/useMobile";
import { WithLogin } from "./WithLogin";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useUser } from "../hooks/useUser";

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
  const { isGabaiOrHigher, isAdmin } = useUser();

  const drawerWidth = useMemo(() => (isMobile ? "60%" : "20%"), [isMobile]);
  const navigate = useSynagogueNavigate();

  const handleClick = (path: string, addSynagogueId: boolean = true) => {
    onLinkClick(path);
    navigate(path, addSynagogueId);
  };

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

          <WithLogin>
            <SidebarItem
              text="כרטיס המתפלל שלי"
              onClick={() => handleClick("prayer-card")}
              icon={<PrayerCardIcon />}
            />
          </WithLogin>
          <SidebarItem
            text="שיעורי תורה"
            onClick={() => handleClick("tora-lessons")}
            icon={<ToraLessonsIcon />}
          />
          <SidebarItem
            text="זמני תפילות"
            onClick={() => handleClick("prayer-times")}
            icon={<PrayerTimesIcon />}
          />

          <SidebarItem
            text="דוחות כספיים"
            onClick={() => handleClick("financial-reports")}
            icon={<FinancialReportsIcon />}
          />
          <SidebarItem
            text="תרומות"
            onClick={() => handleClick("donations")}
            icon={<DonationsIcon />}
          />

          <SidebarItem
            text="בתי כנסת"
            onClick={() => handleClick("synagogues", false)}
            icon={<SynagogueIcon />}
          />
          {/* Admin Section */}
          {isGabaiOrHigher && (
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
                text="ניהול עליות"
                onClick={() => handleClick("admin/aliya-assignment")}
                icon={<AliyaAssignmentIcon />}
              />
              <SidebarItem
                text="ניהול כרטיסי מתפללים"
                onClick={() => handleClick("admin/prayer-cards")}
                icon={<AdminPrayerCardsIcon />}
              />
              <SidebarItem
                text="ניהול סוגי אירועים"
                onClick={() => handleClick("admin/prayer-event-types")}
                icon={<EventTypesIcon />}
              />
              <SidebarItem
                text="ניהול סוגי עליות"
                onClick={() => handleClick("admin/aliya-types")}
                icon={<AliyaTypesIcon />}
              />
              <SidebarItem
                text="ניהול זמני תפילות"
                onClick={() => handleClick("admin/prayer-times")}
                icon={<PrayerTimesIcon />}
              />
              <SidebarItem
                text="ניהול שיעורי תורה"
                onClick={() => handleClick("admin/tora-lessons")}
                icon={<ToraLessonsIcon />}
              />
            </>
          )}
          {isAdmin && (
            <>
              <SidebarItem
                text="שגיאות Frontend"
                onClick={() => handleClick("admin/frontend-errors")}
                icon={<FrontendErrorsIcon />}
              />
              <SidebarItem
                text="הגדרות מנהל"
                onClick={() => handleClick("admin/settings")}
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
