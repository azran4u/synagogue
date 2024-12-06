import logo from "../assets/images/logo.svg";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

const Logo: React.FC = () => {
  const navigate = useNavigate();
  return (
    <Box
      component="img"
      src={logo}
      alt={"Logo"}
      sx={{
        height: "3rem",
        width: "auto",
      }}
      onClick={() => navigate("/")}
    />
  );
};

export default Logo;
