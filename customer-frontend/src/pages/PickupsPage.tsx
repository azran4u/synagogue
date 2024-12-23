import Typography from "@mui/material/Typography";
import { Box, Card, CardContent, useTheme } from "@mui/material";
import { usePickups } from "../hooks/usePickups";
import { useMobile } from "../hooks/useMobile";
import { useMemo } from "react";

const PickupsPage = () => {
  const title = "טייץ שומרון";
  const subtitle = "רשימת נקודות החלוקה";
  const offer = "אם ברצונך לפתוח נקודת חלוקה חדשה באזורך - אנא צרי איתנו קשר";
  const { pickups } = usePickups();
  const isMobile = useMobile();
  const cardWidth = useMemo(() => (isMobile ? "90vw" : "50vw"), [isMobile]);
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography variant="h4" gutterBottom sx={{ margin: "0 auto" }}>
        {title}
      </Typography>
      <Typography variant="subtitle1" gutterBottom sx={{ margin: "0 auto" }}>
        {subtitle}
      </Typography>
      <Typography
        variant="body1"
        sx={{ margin: "0 auto", width: "90vw", textAlign: "center" }}
      >
        {offer}
      </Typography>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          margin: "1rem auto 0 auto",
          width: cardWidth,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        {pickups &&
          pickups.map((pickup) => {
            return (
              <Card key={pickup.id} sx={{ borderRadius: "5px" }}>
                <CardContent>
                  <Typography variant="h6">{pickup.name}</Typography>
                  {pickup.city && pickup.street ? (
                    <Typography variant="body1">
                      {pickup.street}, {pickup.city}
                    </Typography>
                  ) : (
                    pickup.city && (
                      <Typography variant="body1">{pickup.city}</Typography>
                    )
                  )}
                  {pickup.phone_number && (
                    <Typography variant="body1">
                      {pickup.phone_number}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            );
          })}
      </Box>
      <br />
    </Box>
  );
};

export default PickupsPage;
