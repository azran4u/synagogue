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
import PaymentIcon from "@mui/icons-material/Payment";
import AssessmentIcon from "@mui/icons-material/Assessment";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface FinancialsDrawerProps {
  open: boolean;
  onClose: () => void;
}

export const FinancialsDrawer: React.FC<FinancialsDrawerProps> = ({
  open,
  onClose,
}) => {
  const navigate = useSynagogueNavigate();

  const handleDonationsClick = () => {
    navigate("donations");
    onClose();
  };

  const handleReportsClick = () => {
    navigate("financial-reports");
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
          <Typography variant="h6">כספי</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Options */}
        <List sx={{ p: 0 }}>
          <ListItem disablePadding>
            <ListItemButton onClick={handleDonationsClick}>
              <ListItemIcon>
                <PaymentIcon />
              </ListItemIcon>
              <ListItemText primary="תרומות" />
            </ListItemButton>
          </ListItem>
          <Divider />
          <ListItem disablePadding>
            <ListItemButton onClick={handleReportsClick}>
              <ListItemIcon>
                <AssessmentIcon />
              </ListItemIcon>
              <ListItemText primary="דוחות כספיים" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>
    </Drawer>
  );
};
