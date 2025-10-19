import React, { useMemo } from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Home as HomeIcon,
  Person as PersonIcon,
  Event as EventIcon,
  Assignment as AliyotIcon,
  Schedule as ScheduleIcon,
  Announcement as AnnouncementIcon,
  AccountBalance as AccountBalanceIcon,
  CreditCard as CreditCardIcon,
  Login as LoginIcon,
  Visibility as ViewIcon,
  Book as BookIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { usePrayerCard } from "../hooks/usePrayerCard";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useUser } from "../hooks/useUser";

const SynagogueHomePage: React.FC = () => {
  const { isLoggedIn, login, isLoading: authLoading } = useAuth();
  const { data: prayerCard, isLoading: prayerCardLoading } = usePrayerCard();
  const { data: synagogue } = useSelectedSynagogue();
  const { displayName, isGabaiOrHigher } = useUser();

  const navigate = useSynagogueNavigate();

  const handleCreatePrayerCard = () => {
    navigate("prayer-card");
  };

  const handleViewPrayerCard = () => {
    navigate("prayer-card");
  };

  const handleLogin = () => {
    login();
  };

  // Public features available to all users
  const publicFeatures = [
    {
      icon: <PersonIcon />,
      title: "כרטיס מתפלל אישי",
      description: "ניהול פרטים אישיים ומשפחתיים, מעקב אחר עליות ואירועים",
      path: "prayer-card",
    },
    {
      icon: <ScheduleIcon />,
      title: "זמני תפילה",
      description: "לוחות זמנים מפורטים לתפילות ופעילויות בית הכנסת",
      path: "prayer-times",
    },
    {
      icon: <BookIcon />,
      title: "שיעורי תורה",
      description: "מידע על שיעורי תורה, מקורות ושעות קבועות",
      path: "tora-lessons",
    },
    {
      icon: <AccountBalanceIcon />,
      title: "דוחות כספיים",
      description: "שקיפות מלאה של דוחות כספיים וניהול התקציב",
      path: "financial-reports",
    },
    {
      icon: <CreditCardIcon />,
      title: "תרומות",
      description: "דרכי תרומה מגוונות כולל העברות בנקאיות ותשלומים אונליין",
      path: "donations",
    },
  ];

  // Admin/Gabai only features
  const adminFeatures = [
    {
      icon: <EventIcon />,
      title: "מעקב אירועים",
      description: "הוספת וניהול אירועים משפחתיים וימי הולדת עבריים",
      path: "prayer-event-types",
    },
    {
      icon: <AliyotIcon />,
      title: "ניהול עליות",
      description: "הקצאת עליות לתורה לפי גיל ומסורת בית הכנסת",
      path: "admin/aliya-assignment",
    },
  ];

  // Combine features: public features first, then admin features if user has permissions
  const systemFeatures = useMemo(() => {
    return isGabaiOrHigher
      ? [...publicFeatures, ...adminFeatures]
      : publicFeatures;
  }, [isGabaiOrHigher]);

  const renderActionSection = () => {
    if (authLoading || prayerCardLoading) {
      return (
        <Card sx={{ mb: 6, bgcolor: "grey.50" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <CircularProgress sx={{ mb: 2 }} />
            <Typography variant="h6">טוען...</Typography>
          </CardContent>
        </Card>
      );
    }

    if (!isLoggedIn) {
      return (
        <Card sx={{ mb: 6, bgcolor: "grey.50" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <LoginIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              התחבר למערכת
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              התחבר כדי לגשת לכרטיס המתפלל שלך ולנהל את הפרטים האישיים
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={authLoading}
              startIcon={<LoginIcon />}
              sx={{ minWidth: 200 }}
            >
              {authLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </CardContent>
        </Card>
      );
    }

    if (prayerCard) {
      return (
        <Card sx={{ mb: 6, bgcolor: "success.50" }}>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <ViewIcon sx={{ fontSize: 60, color: "success.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              כרטיס המתפלל שלך מוכן!
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              נראה שכבר יש לך כרטיס מתפלל. לחץ כדי לראות ולערוך את הפרטים שלך
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleViewPrayerCard}
              startIcon={<ViewIcon />}
              sx={{ minWidth: 200, bgcolor: "success.main" }}
            >
              צפה בכרטיס המתפלל
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card sx={{ mb: 6, bgcolor: "primary.50" }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <PersonIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            התחל את המסע שלך
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            צור את כרטיס המתפלל שלך כדי להתחיל לנהל את הפרטים האישיים והמשפחתיים
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreatePrayerCard}
            startIcon={<PersonIcon />}
            sx={{ minWidth: 200 }}
          >
            צור כרטיס מתפלל
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        {displayName && (
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              color: "text.secondary",
            }}
          >
            שלום {displayName}
          </Typography>
        )}
        <HomeIcon sx={{ fontSize: 80, color: "primary.main", mb: 2 }} />
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{ fontWeight: "bold" }}
        >
          ברוכים הבאים לבית הכנסת
          {synagogue && ` - ${synagogue.name}`}
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          פלטפורמה דיגיטלית לניהול בית הכנסת
        </Typography>
      </Box>

      {/* Action Section */}
      {renderActionSection()}

      {/* Features Section */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          sx={{ textAlign: "center", mb: 4 }}
        >
          תכונות המערכת
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            },
            gap: 3,
          }}
        >
          {systemFeatures.map((feature, index) => (
            <Card
              key={index}
              sx={{
                height: "100%",
                cursor: "pointer",
                transition:
                  "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 4,
                },
              }}
              onClick={() => navigate(feature.path)}
            >
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2, minHeight: 48 }}
                >
                  {feature.description}
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  onClick={e => {
                    e.stopPropagation();
                    navigate(feature.path);
                  }}
                >
                  לפרטים נוספים
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Footer */}
    </Container>
  );
};

export default SynagogueHomePage;
