import Radio from "@mui/material/Radio";
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
    <FormControl
      component="fieldset"
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        marginTop: "1rem",
        marginBottom: "1rem",
      }}
    >
      <Typography variant="h6">{value}</Typography>
      <RadioGroup
        row
        name={name}
        value={value}
        onChange={onChange}
        sx={{
          display: "grid",
          justifyContent: "start",
          gridTemplateColumns: `repeat(${
            colors.length >= 5 ? 5 : colors.length
          }, 1fr)`,
        }}
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
                    color: color.hex_color,
                    backgroundColor: color.hex_color,
                    borderRadius: "50%",
                    border: `1px solid black`,
                    width: "2rem",
                    height: "2rem",
                    boxSizing: "border-box",
                    "&::after": {
                      content: '""',
                      display: "block",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      backgroundColor: "black",
                      borderRadius: "50%",
                      width: "0.5rem", // Smaller inner circle
                      height: "0.5rem", // Smaller inner circle
                      border: `1px solid black`,
                    },
                  },
                  "&:before": {
                    color: color.hex_color,
                    content: '""',
                    display: "block",
                    position: "absolute",
                    backgroundColor: color.hex_color,
                    borderRadius: "50%",
                    border: `1px solid black`,
                    width: "2rem",
                    height: "2rem",
                    boxSizing: "border-box",
                  },
                }}
              />
            }
            label=""
            sx={{ display: "flex", justifyContent: "center", margin: 0 }}
          />
        ))}
      </RadioGroup>
    </FormControl>
  );
};

export default ColorPicker;
