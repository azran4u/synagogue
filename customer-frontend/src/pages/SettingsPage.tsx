import React from "react";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Avatar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  CircularProgress,
} from "@mui/material";
import {
  Person as PersonIcon,
  CreditCard as CreditCardIcon,
  Logout as LogoutIcon,
  Google as GoogleIcon,
  Book as BookIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Event as EventIcon,
  AccountBalance as AccountBalanceIcon,
  Schedule as ScheduleIcon,
  Assignment as AssignmentIcon,
  History as HistoryIcon,
  Category as CategoryIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Payment as PaymentIcon,
  AccessTime as AccessTimeIcon,
  MenuBook as MenuBookIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useNavigate } from "react-router-dom";
import { CategoryOptionsDrawer } from "../components/CategoryOptionsDrawer";

interface SettingsCategory {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: SettingsItem[];
}

interface SettingsItem {
  id: string;
  title: string;
  path: string;
  icon: React.ReactNode;
}

interface CategoryDrawerState {
  open: boolean;
  categoryTitle: string;
  options: SettingsItem[];
}

const SettingsPage: React.FC = () => {
  const { user, logout, login, isLoading } = useAuth();
  const { displayName, email, isGabaiOrHigher } = useUser();
  const navigate = useSynagogueNavigate();
  const routerNavigate = useNavigate();
  const [categoryDrawer, setCategoryDrawer] =
    React.useState<CategoryDrawerState>({
      open: false,
      categoryTitle: "",
      options: [],
    });

  const handleLogout = () => {
    logout();
    routerNavigate("/synagogues");
  };

  const handleEditPrayerCard = () => {
    navigate("prayer-card");
  };

  const handleItemClick = (path: string) => {
    navigate(path);
  };

  const handleCategoryClick = (category: SettingsCategory) => {
    if (category.items.length === 1) {
      // Navigate directly if only one option
      navigate(category.items[0].path);
    } else {
      // Open modal if multiple options
      setCategoryDrawer({
        open: true,
        categoryTitle: category.title,
        options: category.items,
      });
    }
  };

  const handleCloseDrawer = () => {
    setCategoryDrawer({ open: false, categoryTitle: "", options: [] });
  };

  const gabaiSettingsCategories: SettingsCategory[] = [
    {
      id: "aliyot",
      title: "עליות",
      icon: <BookIcon />,
      items: [
        {
          id: "aliya-assignment",
          title: "הקצאת עליות",
          path: "admin/aliya-assignment",
          icon: <AssignmentIcon />,
        },
        {
          id: "aliya-history",
          title: "היסטוריית עליות",
          path: "admin/aliya-history",
          icon: <HistoryIcon />,
        },
        {
          id: "aliya-types",
          title: "סוגי עליות",
          path: "admin/aliya-types",
          icon: <CategoryIcon />,
        },
        {
          id: "aliya-type-categories",
          title: "קטגוריות עליות",
          path: "admin/aliya-type-categories",
          icon: <CategoryIcon />,
        },
      ],
    },
    {
      id: "prayers",
      title: "מתפללים",
      icon: <PeopleIcon />,
      items: [
        {
          id: "prayer-cards",
          title: "כרטיסי מתפללים",
          path: "admin/prayer-cards",
          icon: <CreditCardIcon />,
        },
      ],
    },
    {
      id: "events",
      title: "אירועים",
      icon: <EventIcon />,
      items: [
        {
          id: "prayer-event-types",
          title: "סוגי אירועים",
          path: "admin/prayer-event-types",
          icon: <EventIcon />,
        },
      ],
    },
    {
      id: "financials",
      title: "כספים",
      icon: <AccountBalanceIcon />,
      items: [
        {
          id: "donations",
          title: "תרומות",
          path: "admin/donations",
          icon: <PaymentIcon />,
        },
        {
          id: "financial-reports",
          title: "דוחות כספיים",
          path: "admin/financial-reports",
          icon: <AssessmentIcon />,
        },
        {
          id: "prayer-donations",
          title: "תרומות מתפללים",
          path: "admin/prayer-donations",
          icon: <PaymentIcon />,
        },
      ],
    },
    {
      id: "times",
      title: "זמנים",
      icon: <ScheduleIcon />,
      items: [
        {
          id: "prayer-times",
          title: "זמני תפילות",
          path: "admin/prayer-times",
          icon: <AccessTimeIcon />,
        },
        {
          id: "tora-lessons",
          title: "שיעורי תורה",
          path: "admin/tora-lessons",
          icon: <MenuBookIcon />,
        },
      ],
    },
    {
      id: "general",
      title: "כללי",
      icon: <SettingsIcon />,
      items: [
        {
          id: "synagogue-settings",
          title: "הגדרות בית כנסת",
          path: "admin/settings",
          icon: <SettingsIcon />,
        },
      ],
    },
  ];

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card>
          <CardContent sx={{ textAlign: "center", py: 4 }}>
            <PersonIcon sx={{ fontSize: 60, color: "primary.main", mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              התחבר למערכת
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              עליך להתחבר כדי לגשת להגדרות
            </Typography>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              onClick={() => {
                login();
              }}
              disabled={isLoading}
            >
              {isLoading ? "מתחבר..." : "התחבר"}
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Box sx={{ pb: 10 }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ mb: 4, textAlign: "center" }}
        >
          הגדרות
        </Typography>

        {/* Prayer Card Editing Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 2,
              }}
            >
              <CreditCardIcon color="primary" />
              <Typography variant="h6">כרטיס המתפלל</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              ערוך את פרטי המתפלל שלך, משפחתך, אירועים ועליות
            </Typography>
            <Button
              variant="contained"
              startIcon={<CreditCardIcon />}
              onClick={handleEditPrayerCard}
              fullWidth
              sx={{ mt: 2 }}
            >
              ערוך כרטיס מתפלל
            </Button>
          </CardContent>
        </Card>

        {/* Gabai Settings Section */}
        {isGabaiOrHigher && (
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ mb: 3, textAlign: "center", fontWeight: "bold" }}
            >
              הגדרות ניהול
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "repeat(2, 1fr)",
                  sm: "repeat(3, 1fr)",
                  md: "repeat(3, 1fr)",
                },
                gap: 2,
                justifyContent: "center",
                maxWidth: {
                  xs: "100%",
                  sm: "600px",
                  md: "900px",
                },
                mx: "auto",
              }}
            >
              {gabaiSettingsCategories.map(category => (
                <Card
                  key={category.id}
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    cursor: "pointer",
                    transition:
                      "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: 4,
                    },
                  }}
                  elevation={2}
                  onClick={() => handleCategoryClick(category)}
                >
                  <Box
                    sx={{
                      color: "primary.main",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mb: 1,
                      "& svg": {
                        fontSize: 48,
                      },
                    }}
                  >
                    {category.icon}
                  </Box>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 600,
                      textAlign: "center",
                      color: "text.primary",
                    }}
                  >
                    {category.title}
                  </Typography>
                </Card>
              ))}
            </Box>
            <CategoryOptionsDrawer
              open={categoryDrawer.open}
              onClose={handleCloseDrawer}
              categoryTitle={categoryDrawer.categoryTitle}
              options={categoryDrawer.options}
              onOptionClick={handleItemClick}
            />
          </Box>
        )}

        {/* User Info Card with Sign Out */}
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: "center", py: 3, pb: 2 }}>
            <Avatar
              src={user.photoURL || undefined}
              alt={displayName || "User"}
              sx={{
                width: 80,
                height: 80,
                mx: "auto",
                mb: 2,
                fontSize: 32,
              }}
            >
              {displayName?.charAt(0) || user.email?.charAt(0) || "U"}
            </Avatar>
            <Typography variant="h5" gutterBottom>
              {displayName || "משתמש"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {email}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Button
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              color="error"
              variant="outlined"
              sx={{
                justifyContent: "center",
              }}
            >
              התנתק
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default SettingsPage;
