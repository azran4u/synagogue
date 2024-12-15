import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  SelectChangeEvent,
} from "@mui/material";

interface SelectComponentProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (event: SelectChangeEvent<string>) => void;
  error?: boolean;
  helperText?: string;
}

const SelectComponent: React.FC<SelectComponentProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  error,
  helperText,
}) => {
  return (
    <FormControl fullWidth variant="outlined" margin="normal">
      <InputLabel
        id={`${name}-label`}
        sx={{
          fontSize: "1rem",
          fontWeight: "bold",
        }}
      >
        {label}
      </InputLabel>
      <Select
        labelId={`${name}-label`}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        label={label}
        error={error}
        sx={{ textAlign: "center", paddingRight: "2rem" }}
        MenuProps={{
          PaperProps: {
            sx: {
              "& .MuiMenuItem-root": {
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
            },
          },
        }}
      >
        {options.map((option) => (
          <MenuItem value={option} key={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
      {error && (
        <Typography variant="body2" color="error" sx={{ textAlign: "center" }}>
          {helperText}
        </Typography>
      )}
    </FormControl>
  );
};

export default SelectComponent;
