import React from "react";
import {
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { PrayerEvent } from "../model/PrayerEvent";

interface PrayerEventsListProps {
  events: PrayerEvent[];
  title: string;
}

export const PrayerEventsList: React.FC<PrayerEventsListProps> = ({
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
            <ListItemText primary={event.type} />

            <Box sx={{ mt: 1, ml: 2 }}>
              {event.hebrewDate && (
                <Typography variant="caption" display="block">
                  תאריך: {event.hebrewDate}
                </Typography>
              )}
              {event.notes && (
                <Typography variant="caption" display="block">
                  הערות: {event.notes}
                </Typography>
              )}
            </Box>
          </Box>
        </ListItem>
      ))}
    </List>
  );
};
