import React, { useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useCurrentUserPrayerCard } from "../hooks/useCurrentUserPrayerCard";
import { WithLogin } from "../components/WithLogin";
import { HebrewDateDisplay } from "../components/HebrewDateDisplay";
import { PrayerEventsList } from "../components/PrayerEventsList";
import { AliyaEventsList } from "../components/AliyaEventsList";
import { ChildrenList } from "../components/ChildrenList";
import PersonIcon from "@mui/icons-material/Person";
import EventIcon from "@mui/icons-material/Event";
import ChildCareIcon from "@mui/icons-material/ChildCare";
import EmailIcon from "@mui/icons-material/Email";
import { HebrewDate } from "../model/HebrewDate";

const PrayerCardContent: React.FC = () => {
  const { card: prayerCard, isLoading, error } = useCurrentUserPrayerCard();

  // Separate aliya events from prayer events
  const aliyaEvents = useMemo(
    () => prayerCard?.prayer.aliyaHistory || [],
    [prayerCard]
  );
  const prayerEvents = useMemo(() => prayerCard?.events || [], [prayerCard]);

  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען כרטיס תפילה...
        </Typography>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error">שגיאה בטעינת כרטיס התפילה. אנא נסה שוב.</Alert>
      </Box>
    );
  }

  // Show no prayer card found
  if (!prayerCard) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="info">לא נמצא כרטיס תפילה עבור המשתמש הנוכחי.</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", mb: 4 }}>
        כרטיס מתפלל
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {/* Personal Information */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <PersonIcon />
              מידע אישי
            </Typography>

            <Typography variant="h5" gutterBottom>
              {prayerCard.prayer.firstName} {prayerCard.prayer.lastName}
            </Typography>

            <Box sx={{ mt: 2 }}>
              {prayerCard.email && (
                <Box
                  sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
                >
                  <EmailIcon color="action" fontSize="small" />
                  <Typography variant="body2">{prayerCard.email}</Typography>
                </Box>
              )}

              {prayerCard.prayer.hebrewBirthDate && (
                <HebrewDateDisplay
                  date={prayerCard.prayer.hebrewBirthDate}
                  label="תאריך לידה"
                />
              )}

              <Box sx={{ mt: 2 }}>
                <Chip
                  label={prayerCard.prayer.isActive ? "פעיל" : "לא פעיל"}
                  color={prayerCard.prayer.isActive ? "success" : "default"}
                  size="small"
                />
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Aliya Events */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <EventIcon />
              עליות
            </Typography>

            <AliyaEventsList events={aliyaEvents} title="עליות" />
          </CardContent>
        </Card>

        {/* Prayer Events */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <EventIcon />
              אירועים אישיים
            </Typography>

            <PrayerEventsList events={prayerEvents} title="אירועי תפילה" />
          </CardContent>
        </Card>

        {/* Children */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              gutterBottom
              sx={{ display: "flex", alignItems: "center", gap: 1 }}
            >
              <ChildCareIcon />
              ילדים
            </Typography>

            <ChildrenList children={prayerCard.children} />
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              מידע נוסף
            </Typography>

            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                נוצר ב: {new HebrewDate(prayerCard.createdAt).toString()}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                עודכן ב: {new HebrewDate(prayerCard.updatedAt).toString()}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default () => {
  return (
    <WithLogin>
      <PrayerCardContent />
    </WithLogin>
  );
};
