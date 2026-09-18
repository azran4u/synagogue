import React, { useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Button,
  Snackbar,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  ImageOutlined as ImageIcon,
} from "@mui/icons-material";
import { useEnabledPrayerTimes } from "../hooks/usePrayerTimes";
import { useSelectedSynagogue } from "../hooks/useSynagogueId";
import { PrayerTimes, PrayerTimeSectionEntry } from "../model/PrayerTimes";
import { HebrewDate } from "../model/HebrewDate";
import { exportElementAsImage } from "../utils/exportElementAsImage";

const PrayerTimesPage: React.FC = () => {
  const { data: prayerTimesList, isLoading, error } = useEnabledPrayerTimes();
  const { data: synagogue } = useSelectedSynagogue();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const getParashaLabel = () => HebrewDate.now().getParasha();

  const handleExportImage = async () => {
    if (!contentRef.current || isExporting) return;

    setIsExporting(true);
    setExportError(null);
    try {
      const name = synagogue?.name ? `זמני-תפילות-${synagogue.name}` : "זמני-תפילות";
      await exportElementAsImage(contentRef.current, `${name}.png`);
    } catch {
      setExportError("שגיאה ביצירת התמונה. נסה שוב.");
    } finally {
      setIsExporting(false);
    }
  };

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

  const hasTimes = Boolean(prayerTimesList && prayerTimesList.length > 0);

  return (
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
      {hasTimes && (
        <Box
          data-export-ignore="true"
          sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}
        >
          <Button
            variant="outlined"
            startIcon={
              isExporting ? <CircularProgress size={18} /> : <ImageIcon />
            }
            onClick={handleExportImage}
            disabled={isExporting}
          >
            {isExporting ? "יוצר תמונה..." : "ייצוא לתמונה"}
          </Button>
        </Box>
      )}

      <Box
        ref={contentRef}
        sx={{
          bgcolor: "background.default",
          p: 1,
          borderRadius: 1,
        }}
      >
        {synagogue?.name && (
          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ textAlign: "center", mb: 1 }}
          >
            {synagogue.name}
          </Typography>
        )}

        <Typography
          variant="h4"
          component="h1"
          sx={{ textAlign: "center", mb: 4 }}
        >
          זמני תפילות
        </Typography>

        {!hasTimes ? (
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
            {[...prayerTimesList!]
              .sort(
                (a: PrayerTimes, b: PrayerTimes) =>
                  a.displayOrder - b.displayOrder
              )
              .map((prayerTimes: PrayerTimes) => (
                <Card key={prayerTimes.id} elevation={2}>
                  <CardContent>
                    <Box sx={{ textAlign: "center", mb: 2 }}>
                      <Typography variant="h5">{prayerTimes.title}</Typography>
                      {prayerTimes.showParashaInTitle && (
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {getParashaLabel()}
                        </Typography>
                      )}
                    </Box>

                    {prayerTimes.notes && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          textAlign: "center",
                          fontStyle: "italic",
                        }}
                      >
                        {prayerTimes.notes}
                      </Typography>
                    )}

                    <Divider sx={{ mb: 2 }} />

                    <Stack spacing={3}>
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

                            if (enabledTimes.length === 0) return null;

                            return (
                              <Box key={sectionIndex}>
                                <Typography
                                  variant="h6"
                                  sx={{
                                    mb: 2,
                                    pb: 1,
                                    borderBottom: "2px solid",
                                    borderColor: "primary.main",
                                  }}
                                >
                                  {section.title}
                                </Typography>

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
                              </Box>
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

      <Snackbar
        open={Boolean(exportError)}
        autoHideDuration={4000}
        onClose={() => setExportError(null)}
        message={exportError}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </Box>
  );
};

export default PrayerTimesPage;
