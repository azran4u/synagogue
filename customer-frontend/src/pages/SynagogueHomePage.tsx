import React from "react";
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
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { usePrayerCard } from "../hooks/usePrayerCard";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";

const SynagogueHomePage: React.FC = () => {
  const { isLoggedIn, login, isLoading: authLoading } = useAuth();
  const { data: prayerCard, isLoading: prayerCardLoading } = usePrayerCard();
  const { data: synagogue } = useSelectedSynagogue();

  console.log("prayerCard", prayerCard);
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

  const comingSoonFeatures = [
    {
      icon: <AliyotIcon />,
      title: "ניהול משפחות",
      description: "הוספת משפחה, ילדים וחברים",
      status: "בפיתוח",
    },
    {
      icon: <EventIcon />,
      title: "אירועים ועליות",
      description: "מעקב אחר אירועים ועליות לתורה",
      status: "בפיתוח",
    },
    {
      icon: <ScheduleIcon />,
      title: "זמני תפילה",
      description: "זמני תפילה ופעילויות",
      status: "בפיתוח",
    },
    {
      icon: <AnnouncementIcon />,
      title: "הכרזות",
      description: "הכרזות חשובות מהקהילה",
      status: "בפיתוח",
    },
    {
      icon: <AccountBalanceIcon />,
      title: "דוחות כספיים",
      description: "שקיפות כספית מלאה",
      status: "בפיתוח",
    },
    {
      icon: <CreditCardIcon />,
      title: "תרומות",
      description: "תרומות לקהילה",
      status: "בפיתוח",
    },
  ];

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
          {comingSoonFeatures.map((feature, index) => (
            <Card key={index} sx={{ height: "100%", opacity: 0.7 }}>
              <CardContent sx={{ textAlign: "center", p: 3 }}>
                <Box sx={{ color: "primary.main", mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  {feature.description}
                </Typography>
                <Chip
                  label={feature.status}
                  color="secondary"
                  size="small"
                  variant="outlined"
                />
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Current Features */}
      <Card sx={{ mt: 6, bgcolor: "success.50" }}>
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Typography variant="h5" gutterBottom color="success.dark">
            זמין כעת
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 2 }}
            justifyContent="center"
            flexWrap="wrap"
            sx={{
              gap: { xs: 1, sm: 2 },
              "& .MuiChip-root": {
                mb: { xs: 1, sm: 0 },
                minWidth: { xs: "auto", sm: "auto" },
              },
            }}
          >
            <Chip
              icon={<PersonIcon />}
              label="כרטיס מתפלל אישי"
              color="success"
              variant="filled"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 28, sm: 32 },
              }}
            />
            <Chip
              icon={<EventIcon />}
              label="מעקב אירועים"
              color="success"
              variant="filled"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 28, sm: 32 },
              }}
            />
            <Chip
              icon={<AliyotIcon />}
              label="ניהול עליות"
              color="success"
              variant="filled"
              sx={{
                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                height: { xs: 28, sm: 32 },
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Footer */}
    </Container>
  );
};

export default SynagogueHomePage;
