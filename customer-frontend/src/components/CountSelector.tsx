import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface CountSelectorProps {
  value: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const CountSelector: React.FC<CountSelectorProps> = ({
  value,
  onIncrement,
  onDecrement,
}) => {
  return (
    <Box display="flex" alignItems="center" justifyContent="center">
      <Button variant="outlined" onClick={onDecrement} disabled={value <= 1}>
        -
      </Button>
      <Typography variant="body1" mx={2}>
        {value}
      </Typography>
      <Button variant="outlined" onClick={onIncrement}>
        +
      </Button>
    </Box>
  );
};

export default CountSelector;
