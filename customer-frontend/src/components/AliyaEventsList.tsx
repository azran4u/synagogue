import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";
import { AliyaEvent } from "../model/AliyaEvent";

interface AliyaEventsListProps {
  events: AliyaEvent[];
  title: string;
}

export const AliyaEventsList: React.FC<AliyaEventsListProps> = ({
  events,
  title,
}) => {
  if (!events || events.length === 0) {
    return (
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontStyle: "italic" }}
      >
        אין {title} רשומים
      </Typography>
    );
  }

  return (
    <List dense>
      {events.map((event, index) => (
        <ListItem
          key={index}
          sx={{ px: 0, flexDirection: "column", alignItems: "stretch" }}
        >
          <Box sx={{ width: "100%" }}>
            <ListItemText primary={event.aliyaType} />

            <Box sx={{ mt: 1, ml: 2 }}>
              {event.hebrewDate && (
                <Typography variant="caption" display="block">
                  תאריך: {event.hebrewDate}
                </Typography>
              )}
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  label={event.aliyaType}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Box>
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};
