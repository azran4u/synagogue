import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import {
  Cake as BirthdayIcon,
  Event as EventIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";
import { useUser } from "../hooks/useUser";
import { Prayer, PrayerCard } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
import { PrayerEvent } from "../model/PrayerEvent";
import { WithLogin } from "../components/WithLogin";
import { format } from "date-fns";

// Helper function to calculate age from Hebrew birthdate
const calculateAgeFromHebrewDate = (hebrewBirthDate: HebrewDate): number => {
  const today = new Date();
  const birthDate = hebrewBirthDate.toGregorianDate();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Helper function to check if prayer is eligible (13+ or no birthdate)
const isEligibleForAliya = (prayer: Prayer): boolean => {
  if (!prayer.hebrewBirthDate) {
    return true;
  }
  const age = calculateAgeFromHebrewDate(prayer.hebrewBirthDate);
  return age >= 13;
};

// Get next occurrence of a Hebrew birthday in the current Hebrew year
const getNextBirthdayOccurrence = (birthDate: HebrewDate): Date => {
  const today = new Date();
  const currentHebrewYear = new HebrewDate(today).year;

  // Try this year's birthday
  let nextBirthday = new HebrewDate(
    currentHebrewYear,
    birthDate.month,
    birthDate.day
  );
  let gregorianDate = nextBirthday.toGregorianDate();

  // If it's already passed, try next year
  if (gregorianDate < today) {
    nextBirthday = new HebrewDate(
      currentHebrewYear + 1,
      birthDate.month,
      birthDate.day
    );
    gregorianDate = nextBirthday.toGregorianDate();
  }

  return gregorianDate;
};

interface UpcomingItem {
  type: "birthday" | "event";
  date: Date;
  hebrewDate: HebrewDate;
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
  event?: PrayerEvent;
  age?: number; // For birthdays
}

const AdminUpcomingEventsContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const { isGabaiOrHigher } = useUser();

  const [daysAhead, setDaysAhead] = useState(14);

  // Create a map of event type ID to display name
  const eventTypeMap = useMemo(() => {
    if (!prayerEventTypes) return new Map<string, string>();
    const map = new Map<string, string>();
    prayerEventTypes.forEach(eventType => {
      map.set(eventType.id, eventType.displayName);
    });
    return map;
  }, [prayerEventTypes]);

  // Collect all upcoming events and birthdays
  const upcomingItems = useMemo(() => {
    if (!prayerCards) return [];

    const items: UpcomingItem[] = [];
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + daysAhead);

    prayerCards.forEach(card => {
      // Process main prayer
      if (isEligibleForAliya(card.prayer)) {
        // Add birthday if exists
        if (card.prayer.hebrewBirthDate) {
          const nextBirthday = getNextBirthdayOccurrence(
            card.prayer.hebrewBirthDate
          );
          if (nextBirthday >= today && nextBirthday <= futureDate) {
            const age =
              calculateAgeFromHebrewDate(card.prayer.hebrewBirthDate) + 1;
            items.push({
              type: "birthday",
              date: nextBirthday,
              hebrewDate: new HebrewDate(nextBirthday),
              prayer: card.prayer,
              prayerCard: card,
              isChild: false,
              age,
            });
          }
        }

        // Add events
        card.prayer.events.forEach(event => {
          const eventDate = event.hebrewDate.toGregorianDate();
          if (eventDate >= today && eventDate <= futureDate) {
            items.push({
              type: "event",
              date: eventDate,
              hebrewDate: event.hebrewDate,
              prayer: card.prayer,
              prayerCard: card,
              isChild: false,
              event,
            });
          }
        });
      }

      // Process children
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          // Add birthday if exists
          if (child.hebrewBirthDate) {
            const nextBirthday = getNextBirthdayOccurrence(
              child.hebrewBirthDate
            );
            if (nextBirthday >= today && nextBirthday <= futureDate) {
              const age = calculateAgeFromHebrewDate(child.hebrewBirthDate) + 1;
              items.push({
                type: "birthday",
                date: nextBirthday,
                hebrewDate: new HebrewDate(nextBirthday),
                prayer: child,
                prayerCard: card,
                isChild: true,
                age,
              });
            }
          }

          // Add events
          child.events.forEach(event => {
            const eventDate = event.hebrewDate.toGregorianDate();
            if (eventDate >= today && eventDate <= futureDate) {
              items.push({
                type: "event",
                date: eventDate,
                hebrewDate: event.hebrewDate,
                prayer: child,
                prayerCard: card,
                isChild: true,
                event,
              });
            }
          });
        }
      });
    });

    // Sort by date (earliest first)
    return items.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [prayerCards, daysAhead]);

  // Group items by date
  const itemsByDate = useMemo(() => {
    const grouped = new Map<string, UpcomingItem[]>();
    upcomingItems.forEach(item => {
      const dateKey = format(item.date, "yyyy-MM-dd");
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(item);
    });
    return grouped;
  }, [upcomingItems]);

  // Check permissions
  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">אין לך הרשאה לצפייה בדף זה</Alert>
      </Box>
    );
  }
  // Show loading state
  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          טוען אירועים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        אירועים וימי הולדת קרובים
      </Typography>

      {/* Statistics Row */}
      <Box sx={{ mb: 3 }}>
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {upcomingItems.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אירועים קרובים
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {
                    upcomingItems.filter(item => item.type === "birthday")
                      .length
                  }
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ימי הולדת
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {upcomingItems.filter(item => item.type === "event").length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  אירועים
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          label="ימים קדימה"
          type="number"
          value={daysAhead}
          onChange={e =>
            setDaysAhead(Math.max(1, parseInt(e.target.value) || 14))
          }
          sx={{ width: 200 }}
          helperText="מספר הימים להצגת אירועים קרובים"
        />
      </Box>

      {/* Events List */}
      {upcomingItems.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <EventIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין אירועים קרובים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              אין אירועים או ימי הולדת ב-{daysAhead} הימים הקרובים
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {Array.from(itemsByDate.entries()).map(([dateKey, items]) => {
            const firstItem = items[0];
            const daysDiff = Math.ceil(
              (firstItem.date.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={dateKey} elevation={2}>
                <CardContent>
                  {/* Date Header */}
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h6" color="primary">
                      {format(firstItem.date, "EEEE, dd/MM/yyyy")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {firstItem.hebrewDate.toString()}
                      {daysDiff === 0 && " - היום"}
                      {daysDiff === 1 && " - מחר"}
                      {daysDiff > 1 && ` - בעוד ${daysDiff} ימים`}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 2 }} />

                  {/* Items for this date */}
                  <Stack spacing={2}>
                    {items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          bgcolor: "background.paper",
                          borderRadius: 1,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 2,
                          }}
                        >
                          {/* Icon */}
                          <Box>
                            {item.type === "birthday" ? (
                              <BirthdayIcon
                                color="secondary"
                                sx={{ fontSize: 32 }}
                              />
                            ) : (
                              <EventIcon
                                color="primary"
                                sx={{ fontSize: 32 }}
                              />
                            )}
                          </Box>

                          {/* Content */}
                          <Box sx={{ flex: 1 }}>
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                mb: 1,
                              }}
                            >
                              <Typography variant="h6">
                                {item.prayer.firstName} {item.prayer.lastName}
                              </Typography>
                              {item.isChild && (
                                <Chip
                                  label="ילד"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>

                            {item.type === "birthday" ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                יום הולדת - גיל {item.age}
                              </Typography>
                            ) : (
                              <>
                                <Typography variant="body1" fontWeight="bold">
                                  {eventTypeMap.get(item.event?.type || "") ||
                                    item.event?.type ||
                                    "אירוע"}
                                </Typography>
                                {item.event?.notes && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {item.event.notes}
                                  </Typography>
                                )}
                              </>
                            )}

                            {item.isChild && (
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 1,
                                }}
                              >
                                <PersonIcon fontSize="small" color="action" />
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  הורה: {item.prayerCard.prayer.firstName}{" "}
                                  {item.prayerCard.prayer.lastName}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

const AdminUpcomingEventsPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminUpcomingEventsContent />
    </WithLogin>
  );
};

export default AdminUpcomingEventsPage;
