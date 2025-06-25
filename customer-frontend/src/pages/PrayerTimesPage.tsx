import React, { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as TimeIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";
import { PrayerTimes } from "../model/PrayerTimes";
import { usePrayerTimes } from "../hooks/usePrayerTimes";
import { HebrewDate } from "../model/HebrewDate";

const PrayerTimesPage: React.FC = () => {
  const { data: prayerTimes, isLoading, error } = usePrayerTimes();

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">שגיאה בטעינת זמני תפילה: {error.message}</Alert>
      </Box>
    );
  }

  if (!prayerTimes || prayerTimes.length === 0) {
    return (
      <Box p={3}>
        <Typography variant="h4" gutterBottom align="center">
          זמני תפילה
        </Typography>
      </Box>
    );
  }

  return (
    <Box p={3}>
      {/* Header */}
      <Box mb={4}>
        <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
          זמני תפילה
        </Typography>
      </Box>

      {/* Prayer Times List */}
      <Box
        display="flex"
        flexWrap="wrap"
        justifyContent="center"
        gap={3}
        sx={{
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        {prayerTimes.map((prayerTime: PrayerTimes) => (
          <Card
            elevation={3}
            key={prayerTime.id}
            sx={{
              height: "fit-content",
              width: {
                xs: "100%",
                md: "calc(50% - 12px)",
                lg: "calc(33.333% - 16px)",
              },
              minWidth: {
                xs: "100%",
                md: "300px",
                lg: "280px",
              },
            }}
          >
            <CardContent>
              {/* Header */}
              <Box mb={2}>
                <Typography variant="h6" gutterBottom fontWeight="bold">
                  {prayerTime.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  עודכן: {new HebrewDate(prayerTime.createdAt).toString()}
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Sections */}
              {prayerTime.sections.map(section => (
                <Accordion key={section.id} sx={{ mb: 1 }} defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography variant="subtitle1" fontWeight="medium">
                        {section.title}
                      </Typography>
                      <Chip
                        size="small"
                        label={`${section.times.length} זמנים`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box>
                      {section.times.map((time, index) => (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          py={0.5}
                          px={1}
                          sx={{
                            backgroundColor: time.hasTime
                              ? "success.50"
                              : "warning.50",
                            borderRadius: 1,
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="body2" fontWeight="medium">
                            {time.label}
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1}>
                            <TimeIcon
                              fontSize="small"
                              color={time.hasTime ? "success" : "warning"}
                            />
                            <Typography
                              variant="body2"
                              color={
                                time.hasTime ? "success.main" : "warning.main"
                              }
                              fontWeight="bold"
                            >
                              {time.formattedTime}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default PrayerTimesPage;
