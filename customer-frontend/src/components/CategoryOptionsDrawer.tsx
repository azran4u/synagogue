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

interface CategoryOption {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface CategoryOptionsDrawerProps {
  open: boolean;
  onClose: () => void;
  categoryTitle: string;
  options: CategoryOption[];
  onOptionClick: (path: string) => void;
}

export const CategoryOptionsDrawer: React.FC<CategoryOptionsDrawerProps> = ({
  open,
  onClose,
  categoryTitle,
  options,
  onOptionClick,
}) => {
  const handleOptionClick = (path: string) => {
    onOptionClick(path);
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
          maxHeight: "70vh",
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
          <Typography variant="h6">{categoryTitle}</Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Options */}
        <List sx={{ p: 0 }}>
          {options.map((option, index) => (
            <React.Fragment key={option.id}>
              <ListItem disablePadding>
                <ListItemButton onClick={() => handleOptionClick(option.path)}>
                  <ListItemIcon sx={{ color: "primary.main" }}>
                    {option.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={option.title}
                    primaryTypographyProps={{
                      variant: "body1",
                      fontWeight: 500,
                    }}
                  />
                </ListItemButton>
              </ListItem>
              {index < options.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};
