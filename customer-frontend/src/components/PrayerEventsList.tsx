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
        <ListItem key={index} sx={{ px: 0 }}>
          <ListItemText
            primary={event.type}
            secondary={
              <Box>
                {event.date && (
                  <Typography variant="caption" display="block">
                    תאריך: {event.date.toString()}
                  </Typography>
                )}
                {event.description && (
                  <Typography variant="caption" display="block">
                    תיאור: {event.description}
                  </Typography>
                )}
                {event.isRecurringEvent && (
                  <Chip
                    label="אירוע חוזר"
                    size="small"
                    color="primary"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                )}
              </Box>
            }
          />
        </ListItem>
      ))}
    </List>
  );
};
