import logo from "../assets/images/logo.svg";
import Box from "@mui/material/Box";
import { Link } from "react-router-dom";

const Logo: React.FC = () => {
  return (
    <Box
      component={Link}
      to={"/"}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textDecoration: "none",
      }}
    >
      <Box
        component="img"
        src={logo}
        alt={"Logo"}
        sx={{
          height: "3rem",
          width: "auto",
        }}
      />
    </Box>
  );
};

export default Logo;
