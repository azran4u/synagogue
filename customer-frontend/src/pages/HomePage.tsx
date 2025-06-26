import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Avatar,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  Home as HomeIcon,
  Announcement as AnnouncementIcon,
  AccessTime as TimeIcon,
  Book as BookIcon,
  AttachMoney as DonationsIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  NewReleases as NewIcon,
  PriorityHigh as ImportantIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountCircle as AccountIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useAuth } from "../hooks/useAuth";
import { useCurrentUserPrayerCard } from "../hooks/useCurrentUserPrayerCard";
import { useAnnouncements } from "../hooks/useAnnouncements";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { useToraLessons } from "../hooks/useToraLessons";
import { useFinancialReports } from "../hooks/useFinancialReports";
import { HebrewDate } from "../model/HebrewDate";

const HomePage: React.FC = () => {
  const {
    isLoggedIn,
    login,
    isLoading: authLoading,
    user,
    error: authError,
  } = useAuth();

  const {
    card: userPrayerCard,
    isLoading: prayerCardLoading,
    error: prayerCardError,
  } = useCurrentUserPrayerCard();

  const {
    data: announcements,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useAnnouncements();

  const {
    data: prayerTimes,
    isLoading: prayerTimesLoading,
    error: prayerTimesError,
  } = usePrayerTimes();

  const {
    data: toraLessons,
    isLoading: toraLessonsLoading,
    error: toraLessonsError,
  } = useToraLessons();

  const {
    data: financialReports,
    isLoading: financialReportsLoading,
    error: financialReportsError,
  } = useFinancialReports();

  // State to track which announcements are expanded - MUST be called before any early returns
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<
    Set<string>
  >(new Set());

  // Early returns for loading and error states - must come after all hooks
  const isAnyLoading = useMemo(
    () =>
      authLoading ||
      prayerCardLoading ||
      announcementsLoading ||
      prayerTimesLoading ||
      toraLessonsLoading ||
      financialReportsLoading,
    [
      authLoading,
      prayerCardLoading,
      announcementsLoading,
      prayerTimesLoading,
      toraLessonsLoading,
      financialReportsLoading,
    ]
  );

  const hasAnyError = useMemo(
    () =>
      authError ||
      prayerCardError ||
      announcementsError ||
      prayerTimesError ||
      toraLessonsError ||
      financialReportsError,
    [
      authError,
      prayerCardError,
      announcementsError,
      prayerTimesError,
      toraLessonsError,
      financialReportsError,
    ]
  );

  const sortedAnnouncements = useMemo(
    () =>
      announcements?.sort(
        (a, b) =>
          b.publicationDate.toGregorianDate().getTime() -
          a.publicationDate.toGregorianDate().getTime()
      ) || [],
    [announcements]
  );

  // Get recent announcements (last 5)
  const recentAnnouncements = useMemo(
    () => sortedAnnouncements?.slice(0, 5) || [],
    [sortedAnnouncements]
  );

  // Get recent prayer times (last 2)
  const recentPrayerTimes = useMemo(
    () => prayerTimes?.slice(0, 2) || [],
    [prayerTimes]
  );

  // Get recent Torah lessons (last 2 collections)
  const recentToraLessons = useMemo(
    () => toraLessons?.slice(0, 2) || [],
    [toraLessons]
  );

  // Get recent financial reports (last 3)
  const recentFinancialReports = useMemo(
    () => financialReports?.slice(0, 3) || [],
    [financialReports]
  );

  const isContentLong = useMemo(
    () => (content: string) => content.length > 100,
    []
  );

  // Check if user needs to authenticate or create prayer card
  const needsAuthentication = useMemo(() => !isLoggedIn, [isLoggedIn]);

  const needsPrayerCard = useMemo(
    () => isLoggedIn && !prayerCardLoading && !userPrayerCard,
    [isLoggedIn, prayerCardLoading, userPrayerCard]
  );

  // Memoize length calculations for performance
  const prayerTimesCount = useMemo(
    () => prayerTimes?.length || 0,
    [prayerTimes]
  );
  const toraLessonsCount = useMemo(
    () => toraLessons?.length || 0,
    [toraLessons]
  );
  const announcementsCount = useMemo(
    () => announcements?.length || 0,
    [announcements]
  );
  const financialReportsCount = useMemo(
    () => financialReports?.length || 0,
    [financialReports]
  );

  // Memoize boolean checks for conditional rendering
  const hasRecentPrayerTimes = useMemo(
    () => recentPrayerTimes.length > 0,
    [recentPrayerTimes]
  );
  const hasRecentToraLessons = useMemo(
    () => recentToraLessons.length > 0,
    [recentToraLessons]
  );
  const hasRecentAnnouncements = useMemo(
    () => recentAnnouncements.length > 0,
    [recentAnnouncements]
  );
  const hasRecentFinancialReports = useMemo(
    () => recentFinancialReports.length > 0,
    [recentFinancialReports]
  );

  // Memoize first items for display
  const firstPrayerTime = useMemo(
    () => recentPrayerTimes[0],
    [recentPrayerTimes]
  );
  const firstToraLesson = useMemo(
    () => recentToraLessons[0],
    [recentToraLessons]
  );

  const toggleAnnouncement = (announcementId: string) => {
    const newExpanded = new Set(expandedAnnouncements);
    if (newExpanded.has(announcementId)) {
      newExpanded.delete(announcementId);
    } else {
      newExpanded.add(announcementId);
    }
    setExpandedAnnouncements(newExpanded);
  };

  if (isAnyLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto", textAlign: "center" }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען...
        </Typography>
      </Box>
    );
  }

  if (hasAnyError) {
    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          שגיאה בטעינת הנתונים. אנא רענן את הדף או נסה שוב מאוחר יותר.
        </Alert>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          רענן דף
        </Button>
        <Button variant="outlined" onClick={() => (window.location.href = "/")}>
          חזור לדף הבית
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Welcome Section */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <HomeIcon color="primary" fontSize="large" />
          <Typography variant="h3" fontWeight="bold">
            ברוכים הבאים לבית הכנסת
          </Typography>
        </Box>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
          מרכז מידע ותקשורת קהילתית
        </Typography>
      </Box>

      {/* Authentication and Prayer Card Section */}
      {(needsAuthentication || needsPrayerCard) && (
        <Card
          elevation={4}
          sx={{
            mb: 4,
            background: "linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)",
            color: "white",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
              {needsAuthentication ? (
                <AccountIcon fontSize="large" />
              ) : (
                <AddIcon fontSize="large" />
              )}
              <Typography variant="h4" fontWeight="bold">
                {needsAuthentication
                  ? "התחבר לחשבון שלך"
                  : "צור כרטיס מתפלל אישי"}
              </Typography>
            </Box>

            <Typography variant="h6" sx={{ mb: 3, opacity: 0.9 }}>
              {needsAuthentication
                ? "התחבר כדי לגשת למידע אישי, כרטיס מתפלל, ועוד תכונות מתקדמות"
                : "צור כרטיס מתפלל אישי כדי לעקוב אחר עליות, אירועי תפילה, וילדים"}
            </Typography>

            <Box display="flex" gap={2} flexWrap="wrap">
              {needsAuthentication ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => login()}
                  disabled={authLoading}
                  startIcon={<LoginIcon />}
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  {authLoading ? "מתחבר..." : "התחבר עם Google"}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => (window.location.href = "/prayer-card")}
                  startIcon={<AddIcon />}
                  sx={{
                    backgroundColor: "white",
                    color: "primary.main",
                    "&:hover": {
                      backgroundColor: "grey.100",
                    },
                  }}
                >
                  צור כרטיס מתפלל
                </Button>
              )}

              {/* Prayer Times */}
              <Card
                elevation={3}
                sx={{
                  height: "100%",
                  cursor: "pointer",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
                onClick={() => (window.location.href = "/prayer-times")}
              >
                <CardContent sx={{ textAlign: "center" }}>
                  <TimeIcon color="primary" fontSize="large" sx={{ mb: 2 }} />
                  <Typography variant="h6" fontWeight="bold" mb={1}>
                    זמני תפילות
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {prayerTimesLoading
                      ? "טוען..."
                      : `${prayerTimesCount} זמני תפילה זמינים`}
                  </Typography>
                  {hasRecentPrayerTimes && (
                    <Typography variant="caption" color="primary">
                      כולל: {firstPrayerTime?.title}
                    </Typography>
                  )}
                </CardContent>
              </Card>

              <Button
                variant="outlined"
                size="large"
                onClick={() => (window.location.href = "/prayer-times")}
                startIcon={<TimeIcon />}
                sx={{
                  borderColor: "white",
                  color: "white",
                  "&:hover": {
                    borderColor: "grey.100",
                    backgroundColor: "rgba(255,255,255,0.1)",
                  },
                }}
              >
                צפה בזמני תפילה
              </Button>
            </Box>

            {needsAuthentication && (
              <Box
                mt={3}
                p={2}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  💡 <strong>טיפ:</strong> לאחר ההתחברות תוכל ליצור כרטיס מתפלל
                  אישי עם פרטי עליות, אירועי תפילה, וילדים. המידע יישמר ויהיה
                  זמין בכל מכשיר.
                </Typography>
              </Box>
            )}

            {needsPrayerCard && (
              <Box
                mt={3}
                p={2}
                sx={{
                  backgroundColor: "rgba(255,255,255,0.1)",
                  borderRadius: 2,
                }}
              >
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  💡 <strong>טיפ:</strong> כרטיס המתפלל שלך יכלול מידע על עליות
                  שביצעת, אירועי תפילה אישיים, ורשימת ילדים. המידע יישמר ויהיה
                  זמין בכל מכשיר.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* User Welcome (if authenticated and has prayer card) */}
      {isLoggedIn && userPrayerCard && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent sx={{ p: 3 }}>
            <Box display="flex" alignItems="center" gap={2}>
              <Avatar sx={{ width: 56, height: 56, fontSize: "1.5rem" }}>
                {userPrayerCard.prayer.firstName.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  שלום {userPrayerCard.prayer.firstName}!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  ברוך הבא לכרטיס המתפלל האישי שלך
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => (window.location.href = "/prayer-card")}
                startIcon={<PersonIcon />}
                sx={{ ml: "auto" }}
              >
                צפה בכרטיס
              </Button>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Announcements Section */}
      <Box mb={4}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AnnouncementIcon color="primary" fontSize="large" />
          <Typography variant="h4" fontWeight="bold">
            הודעות מהגבאים
          </Typography>
        </Box>

        {announcementsLoading ? (
          <Box display="flex" justifyContent="center" p={3}>
            <CircularProgress />
          </Box>
        ) : hasRecentAnnouncements ? (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              md: "repeat(2, 1fr)",
              lg: "repeat(3, 1fr)",
            }}
            gap={3}
          >
            {recentAnnouncements.map(announcement => {
              const isExpanded = expandedAnnouncements.has(announcement.id);
              const shouldShowExpandButton = isContentLong(
                announcement.content
              );

              return (
                <Card
                  key={announcement.id}
                  elevation={3}
                  sx={{
                    height: "fit-content",
                    border: announcement.isImportant ? 2 : 1,
                    borderColor: announcement.isImportant
                      ? "error.main"
                      : "divider",
                    transition: "transform 0.2s",
                    "&:hover": {
                      transform: "translateY(-4px)",
                    },
                    cursor: shouldShowExpandButton ? "pointer" : "default",
                  }}
                  onClick={() =>
                    shouldShowExpandButton &&
                    toggleAnnouncement(announcement.id)
                  }
                >
                  <CardContent>
                    <Box display="flex" alignItems="center" gap={1} mb={2}>
                      {announcement.isImportant && (
                        <ImportantIcon color="error" fontSize="small" />
                      )}
                      {announcement.isRecent && (
                        <Chip
                          icon={<NewIcon />}
                          label="חדש"
                          color="success"
                          size="small"
                        />
                      )}
                      <Typography variant="h6" fontWeight="bold" flex={1}>
                        {announcement.title}
                      </Typography>
                      {shouldShowExpandButton && (
                        <IconButton
                          size="small"
                          onClick={e => {
                            e.stopPropagation();
                            toggleAnnouncement(announcement.id);
                          }}
                          sx={{ ml: 1 }}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Box>

                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {announcement.content}
                      </Typography>
                    </Collapse>

                    {!isExpanded && (
                      <Typography variant="body2" color="text.secondary" mb={2}>
                        {announcement.contentPreview}
                      </Typography>
                    )}

                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <Avatar
                        sx={{ width: 24, height: 24, fontSize: "0.75rem" }}
                      >
                        {announcement.author.charAt(0)}
                      </Avatar>
                      <Typography variant="caption" color="text.secondary">
                        {announcement.author}
                      </Typography>
                    </Box>

                    <Typography variant="caption" color="text.secondary">
                      {announcement.formattedPublicationDate}
                    </Typography>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info">אין הודעות זמינות כרגע</Alert>
        )}
      </Box>

      {/* Quick Access Section */}
      <Box mb={4}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          גישה מהירה
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          }}
          gap={3}
        >
          {/* Prayer Times */}
          <Card
            elevation={3}
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
            onClick={() => (window.location.href = "/prayer-times")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <TimeIcon color="primary" fontSize="large" sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" mb={1}>
                זמני תפילות
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {prayerTimesLoading
                  ? "טוען..."
                  : `${prayerTimesCount} זמני תפילה זמינים`}
              </Typography>
              {hasRecentPrayerTimes && (
                <Typography variant="caption" color="primary">
                  כולל: {firstPrayerTime?.title}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Torah Lessons */}
          <Card
            elevation={3}
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
            onClick={() => (window.location.href = "/tora-lessons")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <BookIcon color="primary" fontSize="large" sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" mb={1}>
                שיעורי תורה
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {toraLessonsLoading
                  ? "טוען..."
                  : `${toraLessonsCount} אוספי שיעורים זמינים`}
              </Typography>
              {hasRecentToraLessons && (
                <Typography variant="caption" color="primary">
                  כולל: {firstToraLesson?.title}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Donations */}
          <Card
            elevation={3}
            sx={{
              height: "100%",
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": {
                transform: "translateY(-4px)",
              },
            }}
            onClick={() => (window.location.href = "/donations")}
          >
            <CardContent sx={{ textAlign: "center" }}>
              <DonationsIcon color="primary" fontSize="large" sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" mb={1}>
                תרומות
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                תמיכה בקהילה ובהרחבת התורה
              </Typography>
              <Typography variant="caption" color="primary">
                תרום עכשיו
              </Typography>
            </CardContent>
          </Card>

          {/* Personal Prayer Card */}
          <Card
            elevation={3}
            sx={{
              height: "100%",
              cursor: isLoggedIn ? "pointer" : "default",
              transition: "transform 0.2s",
              opacity: isLoggedIn ? 1 : 0.6,
              "&:hover": {
                transform: isLoggedIn ? "translateY(-4px)" : "none",
              },
            }}
            onClick={() =>
              isLoggedIn && (window.location.href = "/prayer-card")
            }
          >
            <CardContent sx={{ textAlign: "center" }}>
              <PersonIcon color="primary" fontSize="large" sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight="bold" mb={1}>
                כרטיס התפילה שלי
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {isLoggedIn
                  ? "צפה בכרטיס התפילה האישי שלך"
                  : "התחבר כדי לצפות בכרטיס התפילה"}
              </Typography>
              {!isLoggedIn && (
                <Button
                  variant="outlined"
                  size="small"
                  onClick={e => {
                    e.stopPropagation();
                    login();
                  }}
                >
                  התחבר
                </Button>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Recent Financial Reports */}
      {hasRecentFinancialReports && (
        <Box mb={4}>
          <Typography variant="h4" fontWeight="bold" mb={3}>
            דוחות כספיים אחרונים
          </Typography>
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
            }}
            gap={2}
          >
            {recentFinancialReports.map(report => (
              <Card key={report.id} elevation={2}>
                <CardContent>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                    {report.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mb={2}>
                    {report.formattedPublicationDate} • {report.publishedBy}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    component="a"
                    href={report.pdfLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    fullWidth
                  >
                    צפה בדוח
                  </Button>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      )}

      {/* Footer */}
      <Box
        mt={6}
        p={3}
        bgcolor="background.paper"
        borderRadius={2}
        textAlign="center"
      >
        <Typography variant="h6" gutterBottom>
          בית הכנסת רבבה דרום
        </Typography>
        <Typography variant="body2" color="text.secondary">
          מרכז רוחני לקהילה היהודית ברבבה
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={1}
        >
          עודכן לאחרונה: {new HebrewDate(new Date()).toString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default HomePage;
