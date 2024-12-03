import React from "react";
import { Typography } from "@mui/material";

interface Props {
  title: string;
}

const Title: React.FC<Props> = ({ title }) => {
  return (
    <Typography
      variant="h4"
      component="h1"
      gutterBottom
      sx={{
        textAlign: "center",
      }}
    >
      {title}
    </Typography>
  );
};

export default Title;
