import React, { useMemo } from "react";
import { Drawer, ListItem, ListItemText, useTheme, Box } from "@mui/material";
import { Logo } from "./Logo";
import { useMobile } from "../hooks/useMobile";
import { WithLogin } from "./WithLogin";

interface SidebarItemProps {
  text: string;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ text, onClick }) => {
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
  const drawerWidth = useMemo(() => (isMobile ? "35%" : "20%"), [isMobile]);

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
          <SidebarItem text="שיעורי תורה" onClick={() => onLinkClick("/")} />
          <SidebarItem
            text="זמני תפילות"
            onClick={() => onLinkClick("/prayer-times")}
          />
          <WithLogin>
            <SidebarItem
              text="כרטיס התפילה שלי"
              onClick={() => onLinkClick("/prayer-card")}
            />
          </WithLogin>
          <WithLogin>
            <SidebarItem
              text="כרטיס מתפלל חדש"
              onClick={() => onLinkClick("/new-prayer")}
            />
          </WithLogin>
          <WithLogin>
            <SidebarItem text="התנתק" onClick={onLogout} />
          </WithLogin>
          <SidebarItem text="צור קשר" onClick={() => onLinkClick("/contact")} />
        </Box>
      </Box>
    </Drawer>
  );
};
