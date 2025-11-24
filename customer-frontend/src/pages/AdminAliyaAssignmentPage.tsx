import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  IconButton,
  Chip,
  Autocomplete,
  Tooltip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  ChildCare as ChildIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useQueryClient } from "@tanstack/react-query";
import { AliyaEvent } from "../model/AliyaEvent";
import { Prayer } from "../model/Prayer";
import { PrayerCard } from "../model/Prayer";
import { AliyaGroup } from "../model/AliyaGroup";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import { useDeleteAliyaGroup } from "../hooks/useAliyaGroups";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { useUpdatePrayerCard } from "../hooks/usePrayerCard";
import { CreateAliyaGroupDialog } from "../components/CreateAliyaGroupDialog";

interface EditGroupFormValues {
  aliyaGroupId: string;
  assignments: Record<string, string>; // aliyaTypeId -> assignedPrayerId
  deletions: string[]; // aliyaTypeIds to delete from database
}

const editGroupValidationSchema = Yup.object({
  aliyaGroupId: Yup.string().required("קבוצת עליות נדרשת"),
  assignments: Yup.object(),
  deletions: Yup.array(),
});

// Helper function to check if prayer is eligible for aliya (13+ or no birthdate)
const isEligibleForAliya = (prayer: Prayer): boolean => {
  // If no birthdate, include them
  if (!prayer.hebrewBirthDate) {
    return true;
  }

  // Check if 13 years or older
  return prayer.hebrewBirthDate.isOlderThan(13);
};

const AdminAliyaAssignmentContent = () => {
  const navigate = useSynagogueNavigate();
  const { isGabaiOrHigher } = useUser();

  // State for dialogs
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDetailsDialog, setShowEditGroupDetailsDialog] =
    useState(false);
  const [editingGroup, setEditingGroup] = useState<AliyaGroup | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);
  const [showPrayerSelectionDialog, setShowPrayerSelectionDialog] =
    useState(false);
  const [selectedAliyaTypeForAssignment, setSelectedAliyaTypeForAssignment] =
    useState<string | null>(null);
  const editGroupFormikRef = React.useRef<any>(null);

  // Query client for cache invalidation
  const queryClient = useQueryClient();

  // Data fetching
  const { data: aliyaTypes, isLoading: aliyaTypesLoading } = useAliyaTypes();
  const { data: aliyaGroups, isLoading: aliyaGroupsLoading } = useAliyaGroups();
  const { data: prayerCards, isLoading: prayerCardsLoading } =
    useAllPrayerCards();
  const updatePrayerCardMutation = useUpdatePrayerCard();
  const deleteAliyaGroupMutation = useDeleteAliyaGroup();

  // Initial form values
  const getInitialEditGroupFormValues = (
    editingGroup: AliyaGroup | null
  ): EditGroupFormValues => {
    if (!editingGroup) {
      return {
        aliyaGroupId: "",
        assignments: {},
        deletions: [],
      };
    }

    return {
      aliyaGroupId: editingGroup.id,
      assignments: {},
      deletions: [],
    };
  };

  // Get all prayers (adults and children) from all prayer cards
  // Filter to only show those 13+ years old or with no birthdate
  const allPrayers = React.useMemo(() => {
    if (!prayerCards) return [];

    const prayers: Array<{
      prayer: Prayer;
      isChild: boolean;
      parentName?: string;
    }> = [];

    prayerCards.forEach(card => {
      // Add the main prayer (adult) if eligible
      if (isEligibleForAliya(card.prayer)) {
        prayers.push({
          prayer: card.prayer,
          isChild: false,
        });
      }

      // Add children if eligible (13+ or no birthdate)
      card.children.forEach(child => {
        if (isEligibleForAliya(child)) {
          prayers.push({
            prayer: child,
            isChild: true,
            parentName: `${card.prayer.firstName} ${card.prayer.lastName}`,
          });
        }
      });
    });

    return prayers;
  }, [prayerCards]);

  // Get all aliyot from all prayers with prayer card info
  const allAliyot = React.useMemo(() => {
    if (!prayerCards) return [];

    const aliyot: Array<{
      aliya: AliyaEvent;
      prayer: Prayer;
      prayerCard: PrayerCard;
      isChild: boolean;
      parentName?: string;
    }> = [];

    prayerCards.forEach(card => {
      // Add aliyot from main prayer
      card.prayer.aliyot.forEach(aliya => {
        aliyot.push({
          aliya,
          prayer: card.prayer,
          prayerCard: card,
          isChild: false,
        });
      });

      // Add aliyot from children
      card.children.forEach(child => {
        child.aliyot.forEach(aliya => {
          aliyot.push({
            aliya,
            prayer: child,
            prayerCard: card,
            isChild: true,
            parentName: `${card.prayer.firstName} ${card.prayer.lastName}`,
          });
        });
      });
    });

    return aliyot.sort((a, b) => {
      // Sort by aliya type display order
      const aliyaTypeA = aliyaTypes?.find(
        type => type.id === a.aliya.aliyaType
      );
      const aliyaTypeB = aliyaTypes?.find(
        type => type.id === b.aliya.aliyaType
      );

      const orderA = aliyaTypeA?.displayOrder ?? 0;
      const orderB = aliyaTypeB?.displayOrder ?? 0;

      return orderA - orderB;
    });
  }, [prayerCards, aliyaTypes]);

  // Get groups with aliyot counts
  const groupsWithCounts = React.useMemo(() => {
    if (!aliyaGroups) return [];

    return aliyaGroups
      .map(group => {
        const count = allAliyot.filter(
          aliyaData => aliyaData.aliya.aliyaGroupId === group.id
        ).length;

        return {
          group,
          count,
        };
      })
      .sort((a, b) => {
        // Sort by Hebrew date (newest first)
        const dateA = a.group.hebrewDate.toGregorianDate().getTime();
        const dateB = b.group.hebrewDate.toGregorianDate().getTime();
        return dateB - dateA; // Descending order (newest first)
      });
  }, [aliyaGroups, allAliyot]);

  // Handlers
  const handleDeleteAliya = async (aliyaData: (typeof allAliyot)[0]) => {
    if (window.confirm("האם אתה בטוח שברצונך למחוק את העלייה?")) {
      try {
        // Remove aliya from prayer
        let updatedPrayerCard = aliyaData.prayerCard;

        if (aliyaData.prayerCard.prayer.id === aliyaData.prayer.id) {
          // Remove from main prayer
          const updatedPrayer = aliyaData.prayer.update({
            aliyot: aliyaData.prayer.aliyot.filter(a => a !== aliyaData.aliya),
          });
          updatedPrayerCard = new PrayerCard(
            aliyaData.prayerCard.id,
            updatedPrayer,
            aliyaData.prayerCard.children
          );
        } else {
          // Remove from child
          const updatedChildren = aliyaData.prayerCard.children.map(child => {
            if (child.id === aliyaData.prayer.id) {
              return child.update({
                aliyot: child.aliyot.filter(a => a !== aliyaData.aliya),
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            aliyaData.prayerCard.id,
            aliyaData.prayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);

        // Invalidate prayer cards cache to refresh the UI
        await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });
      } catch (error) {
        console.error("Error deleting aliya:", error);
      }
    }
  };

  const handleEditGroup = (group: AliyaGroup) => {
    setEditingGroup(group);
    setShowEditGroupDialog(true);
  };

  const handleToggleGroupExpansion = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleDeleteAliyaGroup = async (group: AliyaGroup) => {
    if (
      window.confirm(
        `האם אתה בטוח שברצונך למחוק את הקבוצה "${group.label}"? כל העליות הקשורות לקבוצה זו יימחקו מכל כרטיסי המתפללים.`
      )
    ) {
      try {
        // First, remove all aliya events with this group ID from all prayer cards
        if (prayerCards) {
          for (const prayerCard of prayerCards) {
            let updatedPrayer = prayerCard.prayer;
            let updatedChildren = prayerCard.children;

            // Remove aliyot from main prayer
            const filteredMainAliyot = prayerCard.prayer.aliyot.filter(
              aliya => aliya.aliyaGroupId !== group.id
            );
            if (filteredMainAliyot.length !== prayerCard.prayer.aliyot.length) {
              updatedPrayer = prayerCard.prayer.update({
                aliyot: filteredMainAliyot,
              });
            }

            // Remove aliyot from children
            updatedChildren = prayerCard.children.map(child => {
              const filteredChildAliyot = child.aliyot.filter(
                aliya => aliya.aliyaGroupId !== group.id
              );
              if (filteredChildAliyot.length !== child.aliyot.length) {
                return child.update({
                  aliyot: filteredChildAliyot,
                });
              }
              return child;
            });

            // Update prayer card if any aliyot were removed
            if (
              updatedPrayer !== prayerCard.prayer ||
              updatedChildren.some(
                (child, index) => child !== prayerCard.children[index]
              )
            ) {
              const updatedPrayerCard = new PrayerCard(
                prayerCard.id,
                updatedPrayer,
                updatedChildren
              );
              await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
            }
          }
        }

        // Then delete the aliya group
        await deleteAliyaGroupMutation.mutateAsync(group.id);

        // Invalidate prayer cards cache to refresh the UI
        await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });
      } catch (error) {
        console.error("Error deleting aliya group:", error);
      }
    }
  };

  const handleEditGroupDetails = (group: AliyaGroup) => {
    setEditingGroup(group);
    setShowEditGroupDetailsDialog(true);
  };

  const handleEditGroupSubmit = async (
    values: EditGroupFormValues,
    { setSubmitting }: FormikHelpers<EditGroupFormValues>
  ) => {
    try {
      // Collect all aliya types we're working with (assignments + deletions)
      const allAliyaTypesToProcess = new Set([
        ...Object.keys(values.assignments),
        ...values.deletions,
      ]);

      // First, collect all prayer cards that need removals
      // Group by prayer card to apply all removals at once
      const prayerCardRemovals = new Map<
        string,
        {
          prayerCard: PrayerCard;
          aliyaTypesToRemove: Set<string>; // aliyaTypeIds to remove from this card
        }
      >();

      // Find all prayer cards that need removals
      for (const aliyaTypeId of allAliyaTypesToProcess) {
        const affectedPrayerCards = prayerCards?.filter(card => {
          // Check if main prayer has this aliya
          const mainHasAliya = card.prayer.aliyot.some(
            aliya =>
              aliya.aliyaGroupId === values.aliyaGroupId &&
              aliya.aliyaType === aliyaTypeId
          );

          // Check if any child has this aliya
          const childHasAliya = card.children.some(child =>
            child.aliyot.some(
              aliya =>
                aliya.aliyaGroupId === values.aliyaGroupId &&
                aliya.aliyaType === aliyaTypeId
            )
          );

          return mainHasAliya || childHasAliya;
        });

        // Mark these cards for removal of this aliya type
        if (affectedPrayerCards) {
          for (const prayerCard of affectedPrayerCards) {
            if (!prayerCardRemovals.has(prayerCard.id)) {
              prayerCardRemovals.set(prayerCard.id, {
                prayerCard,
                aliyaTypesToRemove: new Set(),
              });
            }
            prayerCardRemovals
              .get(prayerCard.id)!
              .aliyaTypesToRemove.add(aliyaTypeId);
          }
        }
      }

      // Apply all removals to each prayer card at once
      for (const removal of prayerCardRemovals.values()) {
        // Remove from main prayer - filter out all aliyot matching any of the types to remove
        const updatedMainPrayer = removal.prayerCard.prayer.update({
          aliyot: removal.prayerCard.prayer.aliyot.filter(
            aliya =>
              !(
                aliya.aliyaGroupId === values.aliyaGroupId &&
                removal.aliyaTypesToRemove.has(aliya.aliyaType)
              )
          ),
        });

        // Remove from children - filter out all aliyot matching any of the types to remove
        const updatedChildren = removal.prayerCard.children.map(child =>
          child.update({
            aliyot: child.aliyot.filter(
              aliya =>
                !(
                  aliya.aliyaGroupId === values.aliyaGroupId &&
                  removal.aliyaTypesToRemove.has(aliya.aliyaType)
                )
            ),
          })
        );

        const updatedPrayerCard = new PrayerCard(
          removal.prayerCard.id,
          updatedMainPrayer,
          updatedChildren
        );

        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
      }

      // Then, collect all new assignments grouped by prayer card
      // This ensures we apply all changes to each card at once
      const prayerCardUpdates = new Map<
        string,
        {
          prayerCard: PrayerCard;
          mainPrayerAliyot: AliyaEvent[];
          childAliyot: Map<string, AliyaEvent[]>; // childId -> aliyot to add
        }
      >();

      for (const [aliyaTypeId, assignedPrayerId] of Object.entries(
        values.assignments
      )) {
        // Find the prayer card containing the target prayer
        const targetPrayerCard = prayerCards?.find(
          card =>
            card.prayer.id === assignedPrayerId ||
            card.children.some(child => child.id === assignedPrayerId)
        );

        if (!targetPrayerCard) {
          throw new Error(
            `Prayer card not found for prayer ${assignedPrayerId}`
          );
        }

        // Create new aliya event
        const newAliya = AliyaEvent.create(values.aliyaGroupId, aliyaTypeId);

        // Get or create update entry for this prayer card
        if (!prayerCardUpdates.has(targetPrayerCard.id)) {
          prayerCardUpdates.set(targetPrayerCard.id, {
            prayerCard: targetPrayerCard,
            mainPrayerAliyot: [],
            childAliyot: new Map(),
          });
        }

        const update = prayerCardUpdates.get(targetPrayerCard.id)!;

        if (targetPrayerCard.prayer.id === assignedPrayerId) {
          // Assign to main prayer
          update.mainPrayerAliyot.push(newAliya);
        } else {
          // Assign to child
          if (!update.childAliyot.has(assignedPrayerId)) {
            update.childAliyot.set(assignedPrayerId, []);
          }
          update.childAliyot.get(assignedPrayerId)!.push(newAliya);
        }
      }

      // Apply all collected changes to each prayer card and update once
      for (const update of prayerCardUpdates.values()) {
        let updatedPrayer = update.prayerCard.prayer;
        let updatedChildren = update.prayerCard.children;

        // Add aliyot to main prayer if any
        if (update.mainPrayerAliyot.length > 0) {
          updatedPrayer = update.prayerCard.prayer.update({
            aliyot: [
              ...update.prayerCard.prayer.aliyot,
              ...update.mainPrayerAliyot,
            ],
          });
        }

        // Add aliyot to children if any
        if (update.childAliyot.size > 0) {
          updatedChildren = update.prayerCard.children.map(child => {
            const childAliyotToAdd = update.childAliyot.get(child.id);
            if (childAliyotToAdd && childAliyotToAdd.length > 0) {
              return child.update({
                aliyot: [...child.aliyot, ...childAliyotToAdd],
              });
            }
            return child;
          });
        }

        // Only update if there were changes
        if (
          updatedPrayer !== update.prayerCard.prayer ||
          updatedChildren.some(
            (child, index) => child !== update.prayerCard.children[index]
          )
        ) {
          const updatedPrayerCard = new PrayerCard(
            update.prayerCard.id,
            updatedPrayer,
            updatedChildren
          );

          function removeDuplicateAliyot(aliyot: AliyaEvent[]): AliyaEvent[] {
            const uniqueAliyot = new Map<string, AliyaEvent>();
            aliyot.forEach(aliya => {
              const key = aliya.aliyaGroupId + "-" + aliya.aliyaType;
              if (!uniqueAliyot.has(key)) {
                uniqueAliyot.set(key, aliya);
              }
            });
            return Array.from(uniqueAliyot.values()).map(aliya =>
              aliya.clone()
            );
          }
          // remove duplicate aliyot
          updatedPrayerCard.prayer.aliyot = removeDuplicateAliyot(
            updatedPrayerCard.prayer.aliyot
          );

          updatedPrayerCard.children.forEach(child => {
            child.aliyot = removeDuplicateAliyot(child.aliyot);
          });
          // Update in database
          await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
        }
      }

      // Invalidate prayer cards cache to refresh the UI
      await queryClient.invalidateQueries({ queryKey: ["prayerCards"] });

      setShowEditGroupDialog(false);
      setEditingGroup(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error adding aliyot to group:", error);
      setSubmitting(false);
    }
  };

  const handleBackToHome = () => {
    navigate("");
  };

  if (!isGabaiOrHigher) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Alert severity="error">
          אין לך הרשאות גישה לדף זה. רק מנהלים יכולים לגשת לניהול עליות.
        </Alert>
      </Box>
    );
  }

  if (aliyaTypesLoading || aliyaGroupsLoading || prayerCardsLoading) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto", textAlign: "center" }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          טוען נתונים...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: { xs: "center", sm: "space-between" },
          alignItems: { xs: "center", sm: "center" },
          gap: { xs: 2, sm: 0 },
          mb: 4,
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            textAlign: "center",
            order: { xs: 2, sm: 1 },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          ניהול עליות
        </Typography>
        <Box
          sx={{
            display: "flex",
            justifyContent: { xs: "space-between", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
            order: { xs: 1, sm: 2 },
            gap: 2,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<AssignmentIcon />}
            onClick={handleBackToHome}
            sx={{
              flex: { xs: 1, sm: "none" },
              maxWidth: { xs: "48%", sm: "none" },
            }}
          >
            חזור לדף הבית
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
                  {allAliyot.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  עליות מוקצות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {aliyaGroups?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  קבוצות עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {aliyaTypes?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סוגי עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {allPrayers.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  מתפללים מעל גיל 13
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayerCards?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כרטיסי מתפלל
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Groups List */}
      <Card>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                startIcon={<AddIcon />}
                onClick={() => setShowCreateGroupDialog(true)}
                variant="contained"
                color="primary"
              >
                הוסף קבוצה
              </Button>
            </Box>
          </Box>

          {!groupsWithCounts || groupsWithCounts.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <AssignmentIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" gutterBottom>
                אין קבוצות עליות
              </Typography>
              <Typography variant="body2" color="text.secondary">
                לחץ על "הוסף קבוצה" כדי ליצור קבוצה ראשונה
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {groupsWithCounts.map(({ group, count }) => {
                const isExpanded = expandedGroupId === group.id;
                const groupAliyot = allAliyot.filter(
                  aliyaData => aliyaData.aliya.aliyaGroupId === group.id
                );

                return (
                  <Card key={group.id} variant="outlined">
                    <CardContent>
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: { xs: "column", sm: "row" },
                          justifyContent: "space-between",
                          alignItems: { xs: "stretch", sm: "flex-start" },
                          gap: 2,
                        }}
                      >
                        <Box
                          sx={{
                            flex: 1,
                            cursor: "pointer",
                            "&:hover": {
                              backgroundColor: "action.hover",
                              borderRadius: 1,
                            },
                            p: 1,
                            m: -1,
                          }}
                          onClick={() => handleToggleGroupExpansion(group.id)}
                        >
                          {/* First row: Group label and count */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              flexWrap: "wrap",
                              mb: 1,
                            }}
                          >
                            <Chip
                              label={group.label}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              label={`${count} עליות`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Box>
                          {/* Second row: Date with action icons */}
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <CalendarIcon />
                              <Typography variant="body2">
                                {group.hebrewDate.toString()}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          <IconButton
                            onClick={() => handleEditGroupDetails(group)}
                            color="primary"
                            size="small"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            onClick={() => handleDeleteAliyaGroup(group)}
                            color="error"
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>

                        {/* Add aliyot button */}
                        <Box
                          sx={{
                            flexShrink: 0,
                            display: { xs: "block", sm: "block" },
                          }}
                        >
                          <Button
                            onClick={() => handleEditGroup(group)}
                            startIcon={<AssignmentIcon />}
                            variant="outlined"
                            size="small"
                            color="secondary"
                            fullWidth
                          >
                            {count > 0 ? "ערוך עליות" : "הוסף עליות"}
                          </Button>
                        </Box>
                      </Box>

                      {/* Expanded view showing all aliyot in the group */}
                      {isExpanded && (
                        <Box
                          sx={{
                            mt: 2,
                            pt: 2,
                            borderTop: "1px solid",
                            borderColor: "divider",
                          }}
                        >
                          <Typography variant="h6" gutterBottom>
                            עליות בקבוצה ({groupAliyot.length})
                          </Typography>
                          {groupAliyot.length > 0 ? (
                            <Stack spacing={1}>
                              {groupAliyot.map(
                                (
                                  { aliya, prayer, prayerCard, isChild },
                                  index
                                ) => {
                                  const aliyaType = aliyaTypes?.find(
                                    type => type.id === aliya.aliyaType
                                  );
                                  return (
                                    <Box
                                      key={`${prayer.id}-${aliya.aliyaGroupId}-${aliya.aliyaType}`}
                                      sx={{
                                        display: "flex",
                                        flexDirection: "column",
                                        gap: 1,
                                        p: 1.5,
                                        border: "1px solid",
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        backgroundColor: "background.paper",
                                      }}
                                    >
                                      {/* Prayer info row */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 500 }}
                                        >
                                          {prayer.firstName} {prayer.lastName}
                                        </Typography>
                                        {isChild && (
                                          <Typography
                                            component="span"
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontWeight: 400 }}
                                          >
                                            בן/בת {prayerCard.prayer.firstName}{" "}
                                            {prayerCard.prayer.lastName}
                                          </Typography>
                                        )}
                                        {isChild && (
                                          <Chip
                                            label="ילד"
                                            size="small"
                                            color="secondary"
                                            variant="outlined"
                                          />
                                        )}
                                      </Box>

                                      {/* Action buttons and aliya type row */}
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          justifyContent: "space-between",
                                          gap: 2,
                                        }}
                                      >
                                        {/* Action buttons on the left */}
                                        <Chip
                                          label={
                                            aliyaType?.displayName ||
                                            aliya.aliyaType
                                          }
                                          size="small"
                                          color={
                                            aliyaType?.isHighPriority
                                              ? "error"
                                              : aliyaType?.isMediumPriority
                                                ? "warning"
                                                : "secondary"
                                          }
                                        />
                                        <Box sx={{ display: "flex", gap: 1 }}>
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              handleDeleteAliya({
                                                aliya,
                                                prayer,
                                                prayerCard,
                                                isChild,
                                              })
                                            }
                                            color="error"
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Box>

                                        {/* Aliya type on the right */}
                                      </Box>
                                    </Box>
                                  );
                                }
                              )}
                            </Stack>
                          ) : (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{ fontStyle: "italic" }}
                            >
                              אין עליות בקבוצה זו
                            </Typography>
                          )}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Prayer Selection Dialog */}
      <Dialog
        open={showPrayerSelectionDialog}
        onClose={() => {
          setShowPrayerSelectionDialog(false);
          setSelectedAliyaTypeForAssignment(null);
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>בחר מתפלל</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Autocomplete
              fullWidth
              options={allPrayers}
              getOptionLabel={({ prayer }) =>
                `${prayer.firstName} ${prayer.lastName}`
              }
              value={
                selectedAliyaTypeForAssignment && editGroupFormikRef.current
                  ? (() => {
                      const activeFormik = editGroupFormikRef.current;
                      const prayerId =
                        activeFormik?.values.assignments[
                          selectedAliyaTypeForAssignment
                        ];
                      return prayerId
                        ? allPrayers.find(p => p.prayer.id === prayerId) || null
                        : null;
                    })()
                  : null
              }
              onChange={(_, newValue) => {
                if (selectedAliyaTypeForAssignment && newValue) {
                  const activeFormik = editGroupFormikRef.current;
                  if (activeFormik) {
                    const newAssignments = {
                      ...activeFormik.values.assignments,
                    };
                    newAssignments[selectedAliyaTypeForAssignment] =
                      newValue.prayer.id;
                    activeFormik.setFieldValue("assignments", newAssignments);
                    setShowPrayerSelectionDialog(false);
                    setSelectedAliyaTypeForAssignment(null);
                  }
                }
              }}
              renderInput={params => (
                <TextField
                  {...params}
                  label="חפש מתפלל"
                  placeholder="הקלד שם..."
                  autoFocus
                />
              )}
              renderOption={(props, { prayer, isChild }) => (
                <li {...props} key={prayer.id}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    {isChild ? <ChildIcon /> : <PersonIcon />}
                    <Typography>
                      {prayer.firstName} {prayer.lastName}
                    </Typography>
                    {isChild && (
                      <Chip
                        label="ילד"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </li>
              )}
              isOptionEqualToValue={(option, value) =>
                option.prayer.id === value.prayer.id
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowPrayerSelectionDialog(false);
              setSelectedAliyaTypeForAssignment(null);
            }}
          >
            ביטול
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Group Dialog */}
      <Dialog
        open={showEditGroupDialog}
        onClose={() => setShowEditGroupDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>הוסף עליות לקבוצה</DialogTitle>
        <DialogContent>
          {editingGroup && (
            <Formik
              initialValues={getInitialEditGroupFormValues(editingGroup)}
              validationSchema={editGroupValidationSchema}
              onSubmit={handleEditGroupSubmit}
              innerRef={editGroupFormikRef}
              enableReinitialize
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                setFieldValue,
                isSubmitting,
              }) => (
                <Form>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        קבוצה נוכחית:
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 1,
                        }}
                      >
                        <Chip
                          label={editingGroup.label}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <CalendarIcon />
                        <Typography variant="body2">
                          {editingGroup.hebrewDate.toString()}
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" gutterBottom>
                        סוגי עליות
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        לחץ על הכפתור ליד כל עלייה כדי להקצות מתפלל
                      </Typography>
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        {aliyaTypes
                          ?.sort(
                            (a, b) =>
                              (a.displayOrder || 0) - (b.displayOrder || 0)
                          )
                          .filter(type => {
                            // Show enabled types
                            if (type.enabled) return true;

                            // For disabled types, only show if they have an existing assignment in this group
                            const hasExistingAssignment = allAliyot.some(
                              aliyaData =>
                                aliyaData.aliya.aliyaGroupId ===
                                  values.aliyaGroupId &&
                                aliyaData.aliya.aliyaType === type.id
                            );
                            return hasExistingAssignment;
                          })
                          .map(type => {
                            // Check if this aliya type is marked for deletion
                            const isMarkedForDeletion =
                              values.deletions.includes(type.id);

                            // First check if there's a new assignment in the form
                            let assignedPrayerId = values.assignments[type.id];

                            // If not and not marked for deletion, check if there's an existing assignment in the database
                            if (!assignedPrayerId && !isMarkedForDeletion) {
                              const existingAliya = allAliyot.find(
                                aliyaData =>
                                  aliyaData.aliya.aliyaGroupId ===
                                    values.aliyaGroupId &&
                                  aliyaData.aliya.aliyaType === type.id
                              );
                              if (existingAliya) {
                                assignedPrayerId = existingAliya.prayer.id;
                              }
                            }

                            const assignedPrayer = assignedPrayerId
                              ? allPrayers.find(
                                  p => p.prayer.id === assignedPrayerId
                                )
                              : null;

                            return (
                              <Card key={type.id} variant="outlined">
                                <CardContent sx={{ py: 1, px: 2 }}>
                                  {/* First row: Aliya type name and buttons */}
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      alignItems: "center",
                                    }}
                                  >
                                    <Typography variant="h6">
                                      {type.displayName}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                      <Tooltip
                                        title={
                                          !type.enabled && !assignedPrayer
                                            ? "סוג עלייה זה לא פעיל"
                                            : assignedPrayer
                                              ? "שנה מתפלל"
                                              : "הקצה מתפלל"
                                        }
                                      >
                                        <span>
                                          <IconButton
                                            size="small"
                                            color="primary"
                                            disabled={
                                              !type.enabled && !assignedPrayer
                                            }
                                            onClick={() => {
                                              setSelectedAliyaTypeForAssignment(
                                                type.id
                                              );
                                              setShowPrayerSelectionDialog(
                                                true
                                              );
                                            }}
                                          >
                                            {assignedPrayer ? (
                                              <EditIcon />
                                            ) : (
                                              <AddIcon />
                                            )}
                                          </IconButton>
                                        </span>
                                      </Tooltip>
                                      {assignedPrayer && (
                                        <Tooltip title="הסר הקצאה">
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => {
                                              // Check if this is a new assignment in the form or existing in DB
                                              if (values.assignments[type.id]) {
                                                // It's in the form, just remove it from form state
                                                const newAssignments = {
                                                  ...values.assignments,
                                                };
                                                delete newAssignments[type.id];
                                                setFieldValue(
                                                  "assignments",
                                                  newAssignments
                                                );
                                              } else {
                                                // It's in the database, mark for deletion
                                                const newDeletions = [
                                                  ...values.deletions,
                                                  type.id,
                                                ];
                                                setFieldValue(
                                                  "deletions",
                                                  newDeletions
                                                );
                                              }
                                            }}
                                          >
                                            <DeleteIcon />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </Box>

                                  {/* Second row: Assigned prayer (only if assigned) */}
                                  {assignedPrayer && (
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                        mt: 1,
                                      }}
                                    >
                                      {assignedPrayer.isChild ? (
                                        <ChildIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      ) : (
                                        <PersonIcon
                                          fontSize="small"
                                          color="action"
                                        />
                                      )}
                                      <Typography
                                        variant="body2"
                                        color="text.secondary"
                                      >
                                        {assignedPrayer.prayer.firstName}{" "}
                                        {assignedPrayer.prayer.lastName}
                                      </Typography>
                                      {assignedPrayer.isChild && (
                                        <Chip
                                          label="ילד"
                                          size="small"
                                          color="secondary"
                                          variant="outlined"
                                        />
                                      )}
                                    </Box>
                                  )}
                                </CardContent>
                              </Card>
                            );
                          })}
                      </Stack>
                    </Box>
                  </Stack>

                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowEditGroupDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || updatePrayerCardMutation.isPending
                      }
                    >
                      {isSubmitting || updatePrayerCardMutation.isPending
                        ? "שומר..."
                        : "שמור שינויים"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Aliya Group Dialog */}
      <CreateAliyaGroupDialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
      />

      {/* Edit Group Details Dialog */}
      <CreateAliyaGroupDialog
        open={showEditGroupDetailsDialog}
        onClose={() => {
          setShowEditGroupDetailsDialog(false);
          setEditingGroup(null);
        }}
        aliyaGroup={editingGroup}
      />
    </Box>
  );
};

const AdminAliyaAssignmentPage: React.FC = () => {
  return <AdminAliyaAssignmentContent />;
};

export default AdminAliyaAssignmentPage;
