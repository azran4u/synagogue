import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import React from "react";

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const company = "בית הכנסת רבבה דרום";
  return (
    <AppBar position="static" color="primary" sx={{ top: "auto", bottom: 0 }}>
      <Toolbar>
        <Box display="flex" justifyContent="center" width="100%">
          <Typography variant="body1" color="inherit">
            {year} © {company}
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Footer;
