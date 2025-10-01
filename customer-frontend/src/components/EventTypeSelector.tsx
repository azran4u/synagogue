import React from "react";
import { TextField } from "@mui/material";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";

interface EventTypeSelectorProps {
  name: string;
  label: string;
  value: string;
  onChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onBlur: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  error?: boolean;
  helperText?: string;
  touched?: boolean;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({
  name,
  label,
  value,
  onChange,
  onBlur,
  error = false,
  helperText,
  touched = false,
}) => {
  const { data: prayerEventTypes } = usePrayerEventTypes();

  return (
    <TextField
      name={name}
      label={label}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={touched && error}
      helperText={touched && helperText}
      select
      fullWidth
      SelectProps={{
        native: true,
        sx: {
          "& .MuiSelect-select": {
            paddingTop: { xs: "16px", sm: "16px" },
            paddingBottom: { xs: "16px", sm: "16px" },
          },
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          minHeight: { xs: "56px", sm: "auto" },
        },
      }}
    >
      {prayerEventTypes
        ?.filter(type => type.enabled)
        ?.map(eventType => (
          <option key={eventType.id} value={eventType.id}>
            {eventType.displayName}
          </option>
        ))}
    </TextField>
  );
};
