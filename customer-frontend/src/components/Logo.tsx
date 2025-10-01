import magenDavid from "../assets/images/magen_david.png";
import Box from "@mui/material/Box";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface LogoProps {
  height?: string;
}

export const Logo: React.FC<LogoProps> = ({ height = "3rem" }) => {
  const navigate = useSynagogueNavigate();
  return (
    <Box
      component="img"
      src={magenDavid}
      alt={"Magen David"}
      sx={{
        height,
        width: "auto",
      }}
      onClick={() => navigate("")}
    />
  );
};
