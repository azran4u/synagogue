import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useEnabledPrayerTimes } from "../hooks/usePrayerTimes";
import { PrayerTimes, PrayerTimeSectionEntry } from "../model/PrayerTimes";

const PrayerTimesPage: React.FC = () => {
  const { data: prayerTimesList, isLoading, error } = useEnabledPrayerTimes();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען זמני תפילות...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          שגיאה בטעינת זמני תפילות: {error.message}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {/* Header */}
      <Typography
        variant="h4"
        component="h1"
        sx={{ textAlign: "center", mb: 4 }}
      >
        זמני תפילות
      </Typography>

      {/* Prayer Times List */}
      {!prayerTimesList || prayerTimesList.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <TimeIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין זמני תפילות זמינים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              זמני התפילות יתפרסמו בקרוב
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {prayerTimesList
            .sort(
              (a: PrayerTimes, b: PrayerTimes) =>
                a.displayOrder - b.displayOrder
            )
            .map((prayerTimes: PrayerTimes) => (
              <Card key={prayerTimes.id} elevation={2}>
                <CardContent>
                  {/* Prayer Times Title */}
                  <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
                    {prayerTimes.title}
                  </Typography>

                  {prayerTimes.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 3, textAlign: "center", fontStyle: "italic" }}
                    >
                      {prayerTimes.notes}
                    </Typography>
                  )}

                  <Divider sx={{ mb: 2 }} />

                  {/* Sections */}
                  <Stack spacing={2}>
                    {prayerTimes.enabledSections
                      .sort(
                        (
                          a: PrayerTimeSectionEntry,
                          b: PrayerTimeSectionEntry
                        ) => a.displayOrder - b.displayOrder
                      )
                      .map(
                        (
                          section: PrayerTimeSectionEntry,
                          sectionIndex: number
                        ) => {
                          const enabledTimes = section.times
                            .filter(time => time.enabled)
                            .sort((a, b) => a.displayOrder - b.displayOrder);

                          // Skip sections with no enabled times
                          if (enabledTimes.length === 0) return null;

                          return (
                            <Accordion
                              key={sectionIndex}
                              expanded={
                                expandedId ===
                                `${prayerTimes.id}-section-${sectionIndex}`
                              }
                              onChange={() =>
                                setExpandedId(
                                  expandedId ===
                                    `${prayerTimes.id}-section-${sectionIndex}`
                                    ? null
                                    : `${prayerTimes.id}-section-${sectionIndex}`
                                )
                              }
                              defaultExpanded
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    width: "100%",
                                  }}
                                >
                                  <Typography variant="h6">
                                    {section.title}
                                  </Typography>
                                  <Chip
                                    label={`${enabledTimes.length} זמנים`}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </Box>
                              </AccordionSummary>
                              <AccordionDetails>
                                {section.notes && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ mb: 2, fontStyle: "italic" }}
                                  >
                                    {section.notes}
                                  </Typography>
                                )}
                                <Stack spacing={1.5}>
                                  {enabledTimes.map((time, timeIndex) => (
                                    <Box
                                      key={timeIndex}
                                      sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        p: 2,
                                        bgcolor: "background.paper",
                                        borderRadius: 1,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        boxShadow: 1,
                                      }}
                                    >
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 2,
                                          flex: 1,
                                        }}
                                      >
                                        <TimeIcon color="primary" />
                                        <Typography variant="h6">
                                          {time.title}
                                        </Typography>
                                      </Box>
                                      {time.hour && (
                                        <Typography
                                          variant="h5"
                                          color="primary.main"
                                          sx={{ fontWeight: "bold" }}
                                        >
                                          {time.hour}
                                        </Typography>
                                      )}
                                    </Box>
                                  ))}
                                </Stack>
                                {section.notes && enabledTimes.length > 0 && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 2, display: "block" }}
                                  >
                                    {section.notes}
                                  </Typography>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          );
                        }
                      )}
                  </Stack>
                </CardContent>
              </Card>
            ))}
        </Stack>
      )}
    </Box>
  );
};

export default PrayerTimesPage;
