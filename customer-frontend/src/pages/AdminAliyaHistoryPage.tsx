import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Button,
  Divider,
} from "@mui/material";
import {
  SwapVert as SortIcon,
  Person as PersonIcon,
  Event as EventIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useUser } from "../hooks/useUser";
import { Prayer, PrayerCard } from "../model/Prayer";
import { HebrewDate } from "../model/HebrewDate";
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

interface PrayerWithAliyaHistory {
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
  lastAliyaDate: Date | null;
  lastAliyaGroupLabel: string | null;
  lastAliyaTypeName: string | null;
  totalAliyot: number;
  daysSinceLastAliya: number | null;
}

const AdminAliyaHistoryContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: aliyaGroups } = useAliyaGroups();
  const { data: aliyaTypes } = useAliyaTypes();
  const { isGabaiOrHigher } = useUser();

  const [sortNewestFirst, setSortNewestFirst] = useState(false);

  // Create maps for quick lookup
  const aliyaGroupMap = useMemo(() => {
    if (!aliyaGroups) return new Map();
    const map = new Map();
    aliyaGroups.forEach(group => {
      map.set(group.id, group);
    });
    return map;
  }, [aliyaGroups]);

  const aliyaTypeMap = useMemo(() => {
    if (!aliyaTypes) return new Map();
    const map = new Map();
    aliyaTypes.forEach(type => {
      map.set(type.id, type.displayName);
    });
    return map;
  }, [aliyaTypes]);

  // Collect all prayers with their aliya history
  const prayersWithHistory = useMemo(() => {
    if (!prayerCards || !aliyaGroups) return [];

    const prayers: PrayerWithAliyaHistory[] = [];
    const today = new Date();

    prayerCards.forEach(card => {
      // Process main prayer
      if (isEligibleForAliya(card.prayer)) {
        let lastAliyaDate: Date | null = null;
        let lastAliyaGroupLabel: string | null = null;
        let lastAliyaTypeName: string | null = null;
        let totalAliyot = card.prayer.aliyot.length;

        // Find the most recent aliya
        card.prayer.aliyot.forEach(aliya => {
          const group = aliyaGroupMap.get(aliya.aliyaGroupId);
          if (group) {
            const groupDate = group.hebrewDate.toGregorianDate();
            if (!lastAliyaDate || groupDate > lastAliyaDate) {
              lastAliyaDate = groupDate;
              lastAliyaGroupLabel = group.label;
              lastAliyaTypeName =
                aliyaTypeMap.get(aliya.aliyaType) || aliya.aliyaType;
            }
          }
        });

        let daysSinceLastAliya: number | null = null;
        if (lastAliyaDate !== null) {
          const dateValue: Date = lastAliyaDate;
          daysSinceLastAliya = Math.floor(
            (today.getTime() - dateValue.getTime()) / (1000 * 60 * 60 * 24)
          );
        }

        prayers.push({
          prayer: card.prayer,
          prayerCard: card,
          isChild: false,
          lastAliyaDate,
          lastAliyaGroupLabel,
          lastAliyaTypeName,
          totalAliyot,
          daysSinceLastAliya,
        });
      }

      // Process children
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          let lastAliyaDate: Date | null = null;
          let lastAliyaGroupLabel: string | null = null;
          let lastAliyaTypeName: string | null = null;
          let totalAliyot = child.aliyot.length;

          // Find the most recent aliya
          child.aliyot.forEach(aliya => {
            const group = aliyaGroupMap.get(aliya.aliyaGroupId);
            if (group) {
              const groupDate = group.hebrewDate.toGregorianDate();
              if (!lastAliyaDate || groupDate > lastAliyaDate) {
                lastAliyaDate = groupDate;
                lastAliyaGroupLabel = group.label;
                lastAliyaTypeName =
                  aliyaTypeMap.get(aliya.aliyaType) || aliya.aliyaType;
              }
            }
          });

          let daysSinceLastAliya: number | null = null;
          if (lastAliyaDate !== null) {
            const dateValue: Date = lastAliyaDate;
            daysSinceLastAliya = Math.floor(
              (today.getTime() - dateValue.getTime()) / (1000 * 60 * 60 * 24)
            );
          }

          prayers.push({
            prayer: child,
            prayerCard: card,
            isChild: true,
            lastAliyaDate,
            lastAliyaGroupLabel,
            lastAliyaTypeName,
            totalAliyot,
            daysSinceLastAliya,
          });
        }
      });
    });

    // Sort by last aliya date
    return prayers.sort((a, b) => {
      // Handle null dates - those without aliyot go to the end (or beginning if newest first)
      if (a.lastAliyaDate === null && b.lastAliyaDate === null) return 0;
      if (a.lastAliyaDate === null) return sortNewestFirst ? -1 : 1;
      if (b.lastAliyaDate === null) return sortNewestFirst ? 1 : -1;

      // Sort by date
      if (sortNewestFirst) {
        return b.lastAliyaDate.getTime() - a.lastAliyaDate.getTime();
      } else {
        return a.lastAliyaDate.getTime() - b.lastAliyaDate.getTime();
      }
    });
  }, [prayerCards, aliyaGroups, aliyaGroupMap, aliyaTypeMap, sortNewestFirst]);

  // Statistics
  const statistics = useMemo(() => {
    const withAliyot = prayersWithHistory.filter(p => p.totalAliyot > 0).length;
    const withoutAliyot = prayersWithHistory.filter(
      p => p.totalAliyot === 0
    ).length;
    const totalAliyot = prayersWithHistory.reduce(
      (sum, p) => sum + p.totalAliyot,
      0
    );

    return {
      total: prayersWithHistory.length,
      withAliyot,
      withoutAliyot,
      totalAliyot,
    };
  }, [prayersWithHistory]);

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
          טוען היסטוריית עליות...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: "auto" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">היסטוריית עליות לתורה</Typography>
        <Button
          variant="outlined"
          startIcon={<SortIcon />}
          onClick={() => setSortNewestFirst(!sortNewestFirst)}
        >
          {sortNewestFirst ? "החדש ביותר ראשון" : "הישן ביותר ראשון"}
        </Button>
      </Box>

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
                  {statistics.total}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתפללים מעל גיל 13
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="success.main">
                  {statistics.withAliyot}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  עם עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="warning.main">
                  {statistics.withoutAliyot}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ללא עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {statistics.totalAliyot}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סה"כ עליות
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Prayers List */}
      {prayersWithHistory.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PersonIcon sx={{ fontSize: 80, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              אין מתפללים
            </Typography>
            <Typography variant="body2" color="text.secondary">
              אין מתפללים מעל גיל 13 במערכת
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={2}>
          {prayersWithHistory.map((item, index) => (
            <Card key={`${item.prayer.id}-${index}`} elevation={2}>
              <CardContent>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  {/* Prayer Info */}
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
                        <Chip label="ילד" size="small" variant="outlined" />
                      )}
                      {item.totalAliyot === 0 && (
                        <Chip label="ללא עליות" size="small" color="warning" />
                      )}
                    </Box>

                    {item.isChild && (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                          mb: 1,
                        }}
                      >
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="caption" color="text.secondary">
                          הורה: {item.prayerCard.prayer.firstName}{" "}
                          {item.prayerCard.prayer.lastName}
                        </Typography>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    {/* Aliya History */}
                    {item.lastAliyaDate ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                          }}
                        >
                          <EventIcon fontSize="small" color="primary" />
                          <Typography variant="body2" fontWeight="bold">
                            עליה אחרונה:{" "}
                            {format(item.lastAliyaDate, "dd/MM/yyyy")}
                          </Typography>
                          {item.daysSinceLastAliya !== null && (
                            <Chip
                              label={`לפני ${item.daysSinceLastAliya} ימים`}
                              size="small"
                              color={
                                item.daysSinceLastAliya > 180
                                  ? "error"
                                  : item.daysSinceLastAliya > 90
                                    ? "warning"
                                    : "success"
                              }
                            />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {item.lastAliyaTypeName} - {item.lastAliyaGroupLabel}
                        </Typography>
                      </Box>
                    ) : (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <TimeIcon fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          לא קיבל עליה מעולם
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* Total Aliyot */}
                  <Box sx={{ textAlign: "center", minWidth: 80 }}>
                    <Typography variant="h5" color="primary">
                      {item.totalAliyot}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      עליות
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

const AdminAliyaHistoryPage: React.FC = () => {
  return (
    <WithLogin>
      <AdminAliyaHistoryContent />
    </WithLogin>
  );
};

export default AdminAliyaHistoryPage;
