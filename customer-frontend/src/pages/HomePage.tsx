import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";

export const HomePage: React.FC = () => {
  const title = "בית הכנסת רבבה דרום";

  return (
    <Box
      sx={{
        minHeight: "15vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ margin: "0 auto" }}>
        {title}
      </Typography>
    </Box>
  );
};
