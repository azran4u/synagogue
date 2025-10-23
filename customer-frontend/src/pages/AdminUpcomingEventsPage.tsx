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
import { Formik, Form } from "formik";
import * as Yup from "yup";
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
import {
  isEligibleForAliya,
  getNextBirthdayOccurrence,
  calculateUpcomingItems,
  UpcomingItem,
} from "../utils/prayerUtils";

interface FilterFormValues {
  daysAhead: number;
}

const filterValidationSchema = Yup.object({
  daysAhead: Yup.number()
    .min(1, "מספר הימים חייב להיות לפחות 1")
    .max(365, "מספר הימים לא יכול להיות יותר מ-365")
    .required("מספר הימים הוא שדה חובה"),
});

const AdminUpcomingEventsContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const { isGabaiOrHigher } = useUser();

  const initialValues: FilterFormValues = {
    daysAhead: 14,
  };

  // Create a map of event type ID to display name
  const eventTypeMap = useMemo(() => {
    if (!prayerEventTypes) return new Map<string, string>();
    const map = new Map<string, string>();
    prayerEventTypes.forEach(eventType => {
      map.set(eventType.id, eventType.displayName);
    });
    return map;
  }, [prayerEventTypes]);

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

      <Formik
        initialValues={initialValues}
        validationSchema={filterValidationSchema}
        onSubmit={() => {}}
        enableReinitialize
      >
        {({ values, errors, touched, handleChange, handleBlur }) => {
          // Calculate upcoming items based on Formik values
          const upcomingItems = useMemo(() => {
            return calculateUpcomingItems(prayerCards, values.daysAhead);
          }, [prayerCards, values.daysAhead]);

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

          return (
            <>
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
                            upcomingItems.filter(
                              item => item.type === "birthday"
                            ).length
                          }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ימי הולדת
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {
                            upcomingItems.filter(item => item.type === "event")
                              .length
                          }
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
                <Form>
                  <TextField
                    label="ימים קדימה"
                    name="daysAhead"
                    type="number"
                    value={values.daysAhead}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.daysAhead && Boolean(errors.daysAhead)}
                    helperText={
                      touched.daysAhead && errors.daysAhead
                        ? errors.daysAhead
                        : "מספר הימים להצגת אירועים קרובים"
                    }
                    sx={{ width: 200 }}
                  />
                </Form>
              </Box>

              {/* Events List */}
              {upcomingItems.length === 0 ? (
                <Card>
                  <CardContent sx={{ textAlign: "center", py: 8 }}>
                    <EventIcon
                      sx={{ fontSize: 80, color: "text.secondary", mb: 2 }}
                    />
                    <Typography variant="h6" gutterBottom>
                      אין אירועים קרובים
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      אין אירועים או ימי הולדת ב-{values.daysAhead} הימים
                      הקרובים
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
                                        {item.prayer.firstName}{" "}
                                        {item.prayer.lastName}
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
                                        <Typography
                                          variant="body1"
                                          fontWeight="bold"
                                        >
                                          {eventTypeMap.get(
                                            item.event?.type || ""
                                          ) ||
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
                                        <PersonIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          הורה:{" "}
                                          {item.prayerCard.prayer.firstName}{" "}
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
            </>
          );
        }}
      </Formik>
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
