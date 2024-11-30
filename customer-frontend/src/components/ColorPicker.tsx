import Radio from "@mui/material/Radio";
import Box from "@mui/material/Box";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Typography from "@mui/material/Typography";
import { Color } from "../model/color";

interface ColorPickerProps {
  colors: Color[];
  value: string;
  name: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  value,
  name,
  onChange,
}) => {
  return (
    <FormControl component="fieldset" margin="normal">
      <Typography variant="h6" component="legend" margin="auto">
        {value}
      </Typography>

      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
      >
        <RadioGroup
          row
          name={name}
          value={value}
          onChange={onChange}
          sx={{ display: "flex", justifyContent: "center", margin: 0 }}
        >
          {colors.map((color) => (
            <FormControlLabel
              key={color.name}
              value={color.name}
              control={
                <Radio
                  sx={{
                    color: color.hex_color,
                    "&.Mui-checked": {
                      borderRadius: "100%",
                      "&:before": {
                        content: '""',
                        display: "block",
                        position: "absolute",
                        border: `4px solid ${color.hex_color}`,
                        borderRadius: "50%",
                      },
                    },
                    "&:before": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      backgroundColor: color.hex_color,
                      borderRadius: "50%",
                      opacity: 0.5,
                      width: "1rem",
                      height: "1rem",
                    },
                  }}
                />
              }
              label=""
              sx={{ display: "flex", justifyContent: "center", margin: 0 }}
            />
          ))}
        </RadioGroup>
      </Box>
    </FormControl>
  );
};

export default ColorPicker;
