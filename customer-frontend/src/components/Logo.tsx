import logo from "../assets/images/logo.svg";
import Box from "@mui/material/Box";
import { useNavigate } from "react-router-dom";

interface LogoProps {
  height?: string;
}
const Logo: React.FC<LogoProps> = ({ height = "3rem" }) => {
  const navigate = useNavigate();
  return (
    <Box
      component="img"
      src={logo}
      alt={"Logo"}
      sx={{
        height,
        width: "auto",
      }}
      onClick={() => navigate("/")}
    />
  );
};

export default Logo;
