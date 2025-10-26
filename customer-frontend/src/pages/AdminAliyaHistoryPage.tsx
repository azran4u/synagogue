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
import { AliyaTypeCategory } from "../model/AliyaTypeCategory";
import { HebrewDate } from "../model/HebrewDate";
import { WithLogin } from "../components/WithLogin";
import { format } from "date-fns";
import {
  isEligibleForAliya,
  calculateUpcomingItems,
} from "../utils/prayerUtils";
import { generateAliyaHistoryPdf } from "../utils/aliyaHistoryPdfExport";
import { prepareAliyaHistoryExportData } from "../utils/prepareAliyaHistoryExportData";
import { generateAliyaHistoryXlsx } from "../utils/aliyaHistoryXlsxExport";

interface CategoryColumnData {
  lastParashaDate: HebrewDate | null;
  lastParasha: string | null;
  count: number;
}

interface PrayerWithAliyaHistory {
  prayer: Prayer;
  prayerCard: PrayerCard;
  isChild: boolean;
  categoryColumns: Map<string, CategoryColumnData>; // key: categoryId or aliyaTypeId
  overallLastAliyaDate: HebrewDate | null; // For sorting
  totalAliyot: number;
}

const AdminAliyaHistoryContent: React.FC = () => {
  const { data: prayerCards, isLoading } = useAllPrayerCards();
  const { data: aliyaGroups } = useAliyaGroups();
  const { data: aliyaTypes } = useAliyaTypes();
  const { data: categories } = useAliyaTypeCategories();
  const { data: prayerEventTypes } = usePrayerEventTypes();
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
      map.set(type.id, type);
    });
    return map;
  }, [aliyaTypes]);

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

  // Find the earliest aliya date in the system (for weeks calculation)
  const earliestAliyaDate = useMemo(() => {
    if (!aliyaGroups) return null;

    let earliest: HebrewDate | null = null;
    aliyaGroups.forEach(group => {
      if (!earliest || earliest.isAfter(group.hebrewDate)) {
        earliest = group.hebrewDate;
      }
    });

    return earliest;
  }, [aliyaGroups]);

  // Collect all prayers with their aliya history
  const prayersWithHistory = useMemo(() => {
    if (!prayerCards || !aliyaGroups || !aliyaTypes) return [];

    const prayers: PrayerWithAliyaHistory[] = [];
    const today = new Date();

    // Build list of all column IDs (categories + uncategorized types)
    const allColumnIds = new Set<string>();
    categories?.forEach(cat => {
      allColumnIds.add(cat.id);
    });
    // Add uncategorized types
    const aliyaTypesInCategories = new Set<string>();
    categories?.forEach(category => {
      category.aliyaTypeIds.forEach(typeId => {
        aliyaTypesInCategories.add(typeId);
      });
    });
    aliyaTypes.forEach(type => {
      if (!aliyaTypesInCategories.has(type.id)) {
        allColumnIds.add(type.id);
      }
    });

    prayerCards.forEach(card => {
      // Process main prayer
      if (isEligibleForAliya(card.prayer)) {
        // Initialize all columns with 0 count
        const categoryColumns = new Map<string, CategoryColumnData>();
        allColumnIds.forEach(colId => {
          categoryColumns.set(colId, {
            lastParashaDate: null,
            lastParasha: null,
            count: 0,
          });
        });
        let overallLastAliyaDate: HebrewDate | null = null;
        let totalAliyot = card.prayer.aliyot.length;

        // Process each aliya and group by category
        // For each aliya, we need to add it to ALL categories that contain its type
        card.prayer.aliyot.forEach(aliya => {
          const group = aliyaGroupMap.get(aliya.aliyaGroupId);
          if (group) {
            const groupDate = group.hebrewDate;

            // Find all categories that contain this aliya type
            const containingCategories: string[] = [];

            // Check if this aliya type belongs to any category
            categories?.forEach(category => {
              if (category.aliyaTypeIds.includes(aliya.aliyaType)) {
                containingCategories.push(category.id);
              }
            });

            // If no categories, this is an uncategorized type - use the type ID itself
            const categoriesToUpdate =
              containingCategories.length > 0
                ? containingCategories
                : [aliya.aliyaType];

            // Add this aliya to all relevant categories
            categoriesToUpdate.forEach(categoryId => {
              const columnData = categoryColumns.get(categoryId)!;
              columnData.count++;

              // Update last parasha if this is more recent
              if (
                !columnData.lastParashaDate ||
                groupDate.isAfter(columnData.lastParashaDate)
              ) {
                columnData.lastParashaDate = groupDate;
                columnData.lastParasha = groupDate.getParasha();
              }
            });

            // Track overall last aliya date for sorting
            if (
              !overallLastAliyaDate ||
              groupDate.isAfter(overallLastAliyaDate)
            ) {
              overallLastAliyaDate = groupDate;
            }
          }
        });

        prayers.push({
          prayer: card.prayer,
          prayerCard: card,
          isChild: false,
          categoryColumns,
          overallLastAliyaDate,
          totalAliyot,
        });
      }

      // Process children
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          // Initialize all columns with 0 count
          const categoryColumns = new Map<string, CategoryColumnData>();
          allColumnIds.forEach(colId => {
            categoryColumns.set(colId, {
              lastParashaDate: null,
              lastParasha: null,
              count: 0,
            });
          });
          let overallLastAliyaDate: HebrewDate | null = null;
          let totalAliyot = child.aliyot.length;

          // Process each aliya and group by category
          // For each aliya, we need to add it to ALL categories that contain its type
          child.aliyot.forEach(aliya => {
            const group = aliyaGroupMap.get(aliya.aliyaGroupId);
            if (group) {
              const groupDate = group.hebrewDate;

              // Find all categories that contain this aliya type
              const containingCategories: string[] = [];

              // Check if this aliya type belongs to any category
              categories?.forEach(category => {
                if (category.aliyaTypeIds.includes(aliya.aliyaType)) {
                  containingCategories.push(category.id);
                }
              });

              // If no categories, this is an uncategorized type - use the type ID itself
              const categoriesToUpdate =
                containingCategories.length > 0
                  ? containingCategories
                  : [aliya.aliyaType];

              // Add this aliya to all relevant categories
              categoriesToUpdate.forEach(categoryId => {
                const columnData = categoryColumns.get(categoryId)!;
                columnData.count++;

                // Update last parasha if this is more recent
                if (
                  !columnData.lastParashaDate ||
                  groupDate.isAfter(columnData.lastParashaDate)
                ) {
                  columnData.lastParashaDate = groupDate;
                  columnData.lastParasha = groupDate.getParasha();
                }
              });

              // Track overall last aliya date for sorting
              if (
                !overallLastAliyaDate ||
                groupDate.isAfter(overallLastAliyaDate)
              ) {
                overallLastAliyaDate = groupDate;
              }
            }
          });

          prayers.push({
            prayer: child,
            prayerCard: card,
            isChild: true,
            categoryColumns,
            overallLastAliyaDate,
            totalAliyot,
          });
        }
      });
    });

    // Sort by last aliya date
    return prayers.sort((a, b) => {
      // Handle null dates - those without aliyot go to the end (or beginning if newest first)
      if (a.overallLastAliyaDate === null && b.overallLastAliyaDate === null)
        return 0;
      if (a.overallLastAliyaDate === null) return sortNewestFirst ? -1 : 1;
      if (b.overallLastAliyaDate === null) return sortNewestFirst ? 1 : -1;

      // Sort by date
      if (sortNewestFirst) {
        return (
          b.overallLastAliyaDate?.toGregorianDate()?.getTime() -
          a.overallLastAliyaDate?.toGregorianDate()?.getTime()
        );
      } else {
        return (
          a.overallLastAliyaDate?.toGregorianDate()?.getTime() -
          b.overallLastAliyaDate?.toGregorianDate()?.getTime()
        );
      }
    });
  }, [
    prayerCards,
    aliyaGroups,
    aliyaGroupMap,
    aliyaTypeMap,
    categories,
    sortNewestFirst,
  ]);

  // Build all columns (categories + uncategorized types) for export
  const allColumns = useMemo(() => {
    if (!aliyaTypes || !categories)
      return new Map<string, { name: string; isCategory: boolean }>();

    const columnMap = new Map<string, { name: string; isCategory: boolean }>();

    // Add all categories
    categories.forEach(category => {
      columnMap.set(category.id, {
        name: category.name,
        isCategory: true,
      });
    });

    // Add all aliya types
    // Build a set of all aliya type IDs that are in categories
    const aliyaTypesInCategories = new Set<string>();
    categories.forEach(category => {
      category.aliyaTypeIds.forEach(typeId => {
        aliyaTypesInCategories.add(typeId);
      });
    });

    // Add all uncategorized aliya types (those not in any category)
    aliyaTypes.forEach(type => {
      if (!aliyaTypesInCategories.has(type.id)) {
        columnMap.set(type.id, {
          name: type.displayName,
          isCategory: false,
        });
      }
    });

    return columnMap;
  }, [aliyaTypes, categories]);

  // Calculate upcoming items for export (next 14 days)
  const upcomingItemsForExport = useMemo(() => {
    if (!prayerCards) return [];

    // Use the shared utility function with the actual prayerCards
    return calculateUpcomingItems(prayerCards, 14);
  }, [prayerCards]);

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
            onClick={async () => {
              const exportData = prepareAliyaHistoryExportData(
                prayersWithHistory,
                allColumns,
                upcomingItemsForExport,
                eventTypeMap,
                categories ?? [],
                earliestAliyaDate
              );
              await generateAliyaHistoryPdf(exportData);
            }}
          >
            ייצא ל-PDF
          </Button>
          <Button
            variant="contained"
            startIcon={<TableChartIcon />}
            onClick={() => {
              const exportData = prepareAliyaHistoryExportData(
                prayersWithHistory,
                allColumns,
                upcomingItemsForExport,
                eventTypeMap,
                categories ?? [],
                earliestAliyaDate
              );
              generateAliyaHistoryXlsx(exportData);
            }}
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
                  כמות עליות
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

                    {/* Aliya History by Category */}
                    {item.overallLastAliyaDate ? (
                      <Box>
                        {/* Show category breakdown */}
                        {Array.from(item.categoryColumns.entries()).map(
                          ([columnKey, columnData]) => {
                            const aliyaType = aliyaTypeMap.get(columnKey);
                            // If not found, it's a category - find which types are in it
                            const category = categoryMap.get(columnKey);
                            const categoryAliyaTypes =
                              category?.aliyaTypeIds
                                .map((id: string) => aliyaTypeMap.get(id))
                                .filter(Boolean) || [];

                            const columnName = category
                              ? category.name
                              : aliyaType?.displayName || columnKey;

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
