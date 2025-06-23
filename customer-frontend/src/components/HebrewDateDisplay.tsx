import React from "react";
import { Box, Typography } from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import { HebrewDate } from "../model/HebrewDate";

interface HebrewDateDisplayProps {
  date: HebrewDate;
  label: string;
}

export const HebrewDateDisplay: React.FC<HebrewDateDisplayProps> = ({
  date,
  label,
}) => {
  if (!date) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <EventIcon color="action" fontSize="small" />
      <Typography variant="body2" color="text.secondary">
        {label}: {date.toString()}
      </Typography>
    </Box>
  );
};
