import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
} from "@mui/material";
import {
  Construction as ConstructionIcon,
  Home as HomeIcon,
  Book as BookIcon,
  AccessTime as TimeIcon,
  Assessment as ReportIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";

interface ComingSoonPageProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

export const ComingSoonPage: React.FC<ComingSoonPageProps> = ({
  title = "בקרוב",
  description = "הדף הזה נמצא בפיתוח ויושק בקרוב",
  icon,
}) => {
  const navigate = useSynagogueNavigate();

  const handleBackToHome = () => {
    navigate("");
  };

  // Default icon if none provided
  const defaultIcon = icon || (
    <ConstructionIcon
      sx={{
        fontSize: 80,
        color: "primary.main",
        mb: 3,
      }}
    />
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "calc(100vh - 8rem)",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          textAlign: "center",
          p: 4,
          boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
        }}
      >
        <CardContent>
          <Box
            sx={{
              fontSize: 80,
              color: "primary.main",
              mb: 3,
              display: "flex",
              justifyContent: "center",
            }}
          >
            {defaultIcon}
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: "bold",
              mb: 2,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{
              mb: 4,
              lineHeight: 1.6,
            }}
          >
            {description}
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              mb: 4,
              opacity: 0.8,
            }}
          >
            אנו עובדים על פיתוח התכונה הזו כדי להביא לכם חוויה טובה יותר
          </Typography>

          <Stack spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              onClick={handleBackToHome}
              sx={{
                minWidth: 200,
                py: 1.5,
              }}
            >
              חזור לדף הבית
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ComingSoonPage;
