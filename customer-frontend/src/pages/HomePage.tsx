import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import { useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

export const HomePage: React.FC = () => {
  const title = "בית הכנסת רבבה דרום";
  const { user } = useAuth();
  useEffect(() => {
    if (user) {
      console.log("user", user);
    }
  }, [user]);

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
