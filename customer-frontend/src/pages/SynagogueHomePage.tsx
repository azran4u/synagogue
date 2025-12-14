import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Avatar,
} from "@mui/material";
import {
  Person as PersonIcon,
  Login as LoginIcon,
  CreditCard as CreditCardIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { usePrayerCard } from "../hooks/usePrayerCard";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { useUser } from "../hooks/useUser";

const SynagogueHomePage: React.FC = () => {
  const { isLoggedIn, login, isLoading: authLoading, user } = useAuth();
  const { data: prayerCard, isLoading: prayerCardLoading } = usePrayerCard();
  const { data: synagogue } = useSelectedSynagogue();
  const { displayName } = useUser();

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

  if (authLoading || prayerCardLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4, pb: 10 }}>
      {/* Welcome Section */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        {isLoggedIn && displayName && (
          <Box sx={{ mb: 3 }}>
            {user && (
              <Avatar
                src={user.photoURL || undefined}
                alt={displayName || "User"}
                sx={{
                  width: 100,
                  height: 100,
                  mx: "auto",
                  mb: 2,
                  fontSize: 40,
                }}
              >
                {displayName?.charAt(0) || user.email?.charAt(0) || "U"}
              </Avatar>
            )}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold" }}>
              שלום {displayName}
            </Typography>
            {synagogue && (
              <Typography variant="h6" color="text.secondary">
                {synagogue.name}
              </Typography>
            )}
          </Box>
        )}

        {!isLoggedIn && (
          <>
            <Typography
              variant="h4"
              component="h1"
              gutterBottom
              sx={{ fontWeight: "bold", mb: 2 }}
            >
              ברוכים הבאים
            </Typography>
            {synagogue && (
              <Typography variant="h5" color="primary.main" gutterBottom>
                {synagogue.name}
              </Typography>
            )}
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              פלטפורמה דיגיטלית לניהול בית הכנסת
            </Typography>
          </>
        )}
      </Box>

      {/* Main Action Card */}
      {!isLoggedIn ? (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <LoginIcon sx={{ fontSize: 64, color: "primary.main", mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              התחבר למערכת
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              התחבר כדי לגשת לכל התכונות והשירותים
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleLogin}
              disabled={authLoading}
              startIcon={<LoginIcon />}
              sx={{ minWidth: 200, py: 1.5 }}
            >
              {authLoading ? "מתחבר..." : "התחבר עם Google"}
            </Button>
          </CardContent>
        </Card>
      ) : prayerCard ? (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <CreditCardIcon
              sx={{ fontSize: 64, color: "primary.main", mb: 3 }}
            />
            <Typography variant="h5" gutterBottom>
              כרטיס המתפלל שלך
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              צפה וערוך את פרטי המתפלל, המשפחה והאירועים
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleViewPrayerCard}
              startIcon={<CreditCardIcon />}
              sx={{ minWidth: 200, py: 1.5 }}
            >
              פתח כרטיס מתפלל
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ textAlign: "center", py: 6 }}>
            <PersonIcon sx={{ fontSize: 64, color: "primary.main", mb: 3 }} />
            <Typography variant="h5" gutterBottom>
              צור כרטיס מתפלל
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              התחל לנהל את הפרטים האישיים והמשפחתיים שלך
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleCreatePrayerCard}
              startIcon={<PersonIcon />}
              sx={{ minWidth: 200, py: 1.5 }}
            >
              צור כרטיס מתפלל
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Quick Info */}
      {isLoggedIn && (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            השתמש בתפריט התחתון כדי לגשת לכל התכונות
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default SynagogueHomePage;
