import React from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface TimesDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const TimesDrawer: React.FC<TimesDrawerProps> = ({ open, onClose }) => {
  const navigate = useSynagogueNavigate();

  const handlePrayerTimesClick = () => {
    navigate("prayer-times");
    onClose();
  };

  const handleToraLessonsClick = () => {
    navigate("tora-lessons");
    onClose();
  };

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "50vh",
        },
      }}
    >
      <Box>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="h6">זמנים</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Options */}
        <List sx={{ p: 0 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handlePrayerTimesClick}>
              <ListItemIcon>
                <AccessTimeIcon />
              </ListItemIcon>
              <ListItemText primary="זמני תפילה" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={handleToraLessonsClick}>
              <ListItemIcon>
                <MenuBookIcon />
              </ListItemIcon>
              <ListItemText primary="שיעורי תורה" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};
