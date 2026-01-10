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
  PictureAsPdf as PdfIcon,
  TableChart as TableChartIcon,
} from "@mui/icons-material";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaTypeCategories } from "../hooks/useAliyaTypeCategories";
import { usePrayerEventTypes } from "../hooks/usePrayerEventTypes";
import { useUser } from "../hooks/useUser";
import { Prayer, PrayerCard } from "../model/Prayer";
import { getAliyotForPrayer } from "../utils/aliyaAssignments";
import { HebrewDate } from "../model/HebrewDate";
import { WithLogin } from "../components/WithLogin";
import {
  isEligibleForAliya,
  calculateUpcomingItems,
  calculateAliyaHistory,
  AliyaHistory,
} from "../utils/prayerUtils";
import { generateAliyaHistoryPdf } from "../utils/aliyaHistoryPdfExport";
import { prepareAliyaHistoryExportData } from "../utils/prepareAliyaHistoryExportData";
import { generateAliyaHistoryXlsx } from "../utils/aliyaHistoryXlsxExport";

const AdminAliyaHistoryContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: aliyaGroups } = useAliyaGroups();
  const { data: aliyaTypes } = useAliyaTypes();
  const { data: categories } = useAliyaTypeCategories();
  const { data: prayerEventTypes } = usePrayerEventTypes();
  const { isGabaiOrHigher } = useUser();

  const [sortNewestFirst, setSortNewestFirst] = useState(false);

  // Create maps for quick

  const categoryMap = useMemo(() => {
    if (!categories) return new Map();
    const map = new Map();
    categories.forEach(category => {
      map.set(category.id, category);
    });
    return map;
  }, [categories]);

  // Create event type map for export
  const eventTypeMap = useMemo(() => {
    if (!prayerEventTypes) return new Map();
    const map = new Map();
    prayerEventTypes.forEach(eventType => {
      map.set(eventType.id, eventType.displayName);
    });
    return map;
  }, [prayerEventTypes]);

  // Collect all prayers with their aliya history using calculateAliyaHistory
  const prayersAliyaHistory = useMemo(() => {
    if (!prayerCards || !aliyaGroups || !aliyaTypes || !categories)
      return new Map() as AliyaHistory;

    // Use calculateAliyaHistory to get the history data
    return calculateAliyaHistory(
      prayerCards,
      aliyaGroups,
      aliyaTypes,
      categories
    );
  }, [prayerCards, aliyaGroups, aliyaTypes, categories]);

  async function exportData(type: "pdf" | "xls") {
    const exportData = prepareAliyaHistoryExportData(
      prayersAliyaHistory,
      upcomingItemsForExport,
      eventTypeMap
    );
    if (type === "pdf") {
      await generateAliyaHistoryPdf(exportData);
    } else {
      generateAliyaHistoryXlsx(exportData);
    }
  }
  // Calculate upcoming items for export (next 14 days)
  const upcomingItemsForExport = useMemo(() => {
    if (!prayerCards) return [];

    // Use the shared utility function with the actual prayerCards
    return calculateUpcomingItems(prayerCards, 14);
  }, [prayerCards]);

  // Statistics
  const statistics = useMemo(() => {
    const prayers = Array.from(prayersAliyaHistory.values());
    const totalAliyot = prayers.reduce(
      (sum, p) =>
        sum + p.categoryData.values().reduce((sum, c) => sum + c.count, 0),
      0
    );

    return {
      total: prayers.length,
      totalAliyot,
    };
  }, [prayersAliyaHistory]);

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
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "stretch", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant="h4">היסטוריית עליות</Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<PdfIcon />}
            onClick={() => exportData("pdf")}
          >
            ייצא ל-PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<TableChartIcon />}
            onClick={() => exportData("xls")}
          >
            ייצא ל-Excel
          </Button>
          <Button
            variant="outlined"
            startIcon={<SortIcon />}
            onClick={() => setSortNewestFirst(!sortNewestFirst)}
          >
            {sortNewestFirst ? "החדש ביותר ראשון" : "הישן ביותר ראשון"}
          </Button>
        </Box>
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
                <Typography variant="h4" color="primary">
                  {statistics.totalAliyot}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כמות עליות
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Prayers List */}
      {prayersAliyaHistory.size === 0 ? (
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
          {Array.from(prayersAliyaHistory.values()).map((item, index) => (
            <Card key={`${item.prayerId}-${index}`} elevation={2}>
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
                      <Typography variant="h6">{item.prayerName}</Typography>
                    </Box>

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
                        {item.prayerName}
                      </Typography>
                    </Box>

                    <Divider sx={{ my: 1 }} />

                    {/* Aliya History by Category */}
                    {item.categoryData.size > 0 ? (
                      <Box>
                        {/* Show category breakdown */}
                        {Array.from(item.categoryData.entries()).map(
                          ([columnKey, columnData]) => {
                            // Only categories are used now (no uncategorized types)
                            const category = categoryMap.get(columnKey);
                            const columnName = category?.name || columnKey;

                            return (
                              <Box key={columnKey} sx={{ mb: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography variant="body2" fontWeight="bold">
                                    {columnName}:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    {columnData.count} עליות
                                  </Typography>
                                </Box>
                                {columnData.lastParasha && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    פרשה אחרונה: {columnData.lastParasha}
                                  </Typography>
                                )}
                              </Box>
                            );
                          }
                        )}
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
                      {item.categoryData
                        .values()
                        .reduce((sum, c) => sum + c.count, 0)}
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
