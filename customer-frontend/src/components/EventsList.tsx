import React, { useState } from 'react';
import { Box, Button, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

interface EventsListProps {
  events: string[];
  onEventsChange: (events: string[]) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  onEventsChange
}) => {
  const [newEvent, setNewEvent] = useState('');

  const handleAddEvent = () => {
    if (newEvent.trim()) {
      onEventsChange([...events, newEvent.trim()]);
      setNewEvent('');
    }
  };

  const handleRemoveEvent = (index: number) => {
    const newEvents = events.filter((_, i) => i !== index);
    onEventsChange(newEvents);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        אירועים
      </Typography>
      
      {events.map((event, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 1
          }}
        >
          <TextField
            value={event}
            disabled
            fullWidth
            size="small"
            dir="rtl"
          />
          <IconButton
            onClick={() => handleRemoveEvent(index)}
            color="error"
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      ))}

      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
        <TextField
          value={newEvent}
          onChange={(e) => setNewEvent(e.target.value)}
          placeholder="שם האירוע"
          size="small"
          fullWidth
          dir="rtl"
        />
        <Button
          onClick={handleAddEvent}
          variant="outlined"
          disabled={!newEvent.trim()}
        >
          הוסף
        </Button>
      </Box>
    </Box>
  );
}; 