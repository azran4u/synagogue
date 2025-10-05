import React, { useEffect, useState } from "react";
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
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
import { AliyaEvent } from "../model/AliyaEvent";
import { Prayer } from "../model/Prayer";
import { PrayerCard } from "../model/Prayer";
import { AliyaGroup } from "../model/AliyaGroup";
import { useAliyaTypes } from "../hooks/useAliyaTypes";
import { useAliyaGroups } from "../hooks/useAliyaGroups";
import {
  useCreateAliyaGroup,
  useUpdateAliyaGroup,
  useDeleteAliyaGroup,
} from "../hooks/useAliyaGroups";
import { useAllPrayerCards } from "../hooks/usePrayerCard";
import { useUser } from "../hooks/useUser";
import { useSynagogueNavigate } from "../hooks/useSynagogueNavigate";
import { HebrewDateSelector } from "../components/HebrewDateSelector";
import { HebrewDate } from "../model/HebrewDate";
import { useUpdatePrayerCard } from "../hooks/usePrayerCard";

interface AliyaAssignmentFormValues {
  aliyaGroupId: string;
  assignments: Array<{
    aliyaTypeId: string;
    assignedPrayerId: string;
  }>;
}

interface AliyaReassignmentFormValues {
  assignedPrayerId: string;
}

interface AliyaGroupFormValues {
  label: string;
  hebrewDate: HebrewDate | null;
}

interface EditGroupFormValues {
  assignments: Array<{
    aliyaTypeId: string;
    assignedPrayerId: string;
  }>;
}

const aliyaAssignmentValidationSchema = Yup.object({
  aliyaGroupId: Yup.string().required("קבוצת עליות נדרשת"),
  assignments: Yup.array()
    .of(
      Yup.object({
        aliyaTypeId: Yup.string().required("סוג עלייה נדרש"),
        assignedPrayerId: Yup.string().required("מתפלל נדרש"),
      })
    )
    .min(1, "יש לבחור לפחות עלייה אחת"),
});

const reassignmentValidationSchema = Yup.object({
  assignedPrayerId: Yup.string().required("מתפלל נדרש"),
});

const aliyaGroupValidationSchema = Yup.object({
  label: Yup.string().required("תווית קבוצה נדרשת"),
  hebrewDate: Yup.object().required("תאריך עברי נדרש"),
});

const editGroupValidationSchema = Yup.object({
  assignments: Yup.array()
    .of(
      Yup.object({
        aliyaTypeId: Yup.string().required("סוג עלייה נדרש"),
        assignedPrayerId: Yup.string().required("מתפלל נדרש"),
      })
    )
    .min(1, "יש להוסיף לפחות עלייה אחת"),
});

const AdminAliyaAssignmentContent = () => {
  const navigate = useSynagogueNavigate();
  const { isGabaiOrHigher } = useUser();

  // State for dialogs
  const [showAssignmentDialog, setShowAssignmentDialog] = useState(false);
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [showEditGroupDialog, setShowEditGroupDialog] = useState(false);
  const [showCreateGroupDialog, setShowCreateGroupDialog] = useState(false);
  const [showEditGroupDetailsDialog, setShowEditGroupDetailsDialog] =
    useState(false);
  const [editingAliya, setEditingAliya] = useState<{
    aliya: AliyaEvent;
    prayer: Prayer;
    prayerCard: PrayerCard;
  } | null>(null);
  const [editingGroup, setEditingGroup] = useState<AliyaGroup | null>(null);
  const [expandedGroupId, setExpandedGroupId] = useState<string | null>(null);

  // Data fetching
  const { data: aliyaTypes, isLoading: aliyaTypesLoading } = useAliyaTypes();
  const { data: aliyaGroups, isLoading: aliyaGroupsLoading } = useAliyaGroups();
  const { data: prayerCards, isLoading: prayerCardsLoading } =
    useAllPrayerCards();
  const updatePrayerCardMutation = useUpdatePrayerCard();
  const createAliyaGroupMutation = useCreateAliyaGroup();
  const updateAliyaGroupMutation = useUpdateAliyaGroup();
  const deleteAliyaGroupMutation = useDeleteAliyaGroup();

  // Initial form values
  const initialAssignmentFormValues: AliyaAssignmentFormValues = {
    aliyaGroupId: "",
    assignments: [],
  };

  const initialReassignmentFormValues: AliyaReassignmentFormValues = {
    assignedPrayerId: "",
  };

  const initialAliyaGroupFormValues: AliyaGroupFormValues = {
    label: "",
    hebrewDate: null,
  };

  const initialEditGroupFormValues: EditGroupFormValues = {
    assignments: [],
  };

  // Get all prayers (adults and children) from all prayer cards
  const allPrayers = React.useMemo(() => {
    if (!prayerCards) return [];

    const prayers: Array<{
      prayer: Prayer;
      isChild: boolean;
      parentName?: string;
    }> = [];

    prayerCards.forEach(card => {
      // Add the main prayer (adult)
      prayers.push({
        prayer: card.prayer,
        isChild: false,
      });

      // Add children
      card.children.forEach(child => {
        prayers.push({
          prayer: child,
          isChild: true,
          parentName: `${card.prayer.firstName} ${card.prayer.lastName}`,
        });
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
      // Sort by aliya type
      return a.aliya.aliyaType.localeCompare(b.aliya.aliyaType);
    });
  }, [prayerCards]);

  // Group aliyot by group ID
  const groupedAliyot = React.useMemo(() => {
    const groups: { [key: string]: typeof allAliyot } = {};

    allAliyot.forEach(aliyaData => {
      const key = aliyaData.aliya.aliyaGroupId;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(aliyaData);
    });

    return groups;
  }, [allAliyot]);

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
        // Sort by Hebrew date (closest first)
        return a.group.hebrewDate
          .toString()
          .localeCompare(b.group.hebrewDate.toString());
      });
  }, [aliyaGroups, allAliyot]);

  // Get assigned aliya types for a specific group
  const getAssignedAliyaTypesForGroup = React.useCallback(
    (aliyaGroupId: string) => {
      const groupAliyot = allAliyot.filter(
        aliyaData => aliyaData.aliya.aliyaGroupId === aliyaGroupId
      );

      return groupAliyot.map(aliyaData => aliyaData.aliya.aliyaType);
    },
    [allAliyot]
  );

  // Handlers
  const handleAliyaAssignment = async (
    values: AliyaAssignmentFormValues,
    { setSubmitting }: FormikHelpers<AliyaAssignmentFormValues>
  ) => {
    try {
      // Process each assignment
      for (const assignment of values.assignments) {
        // Find the prayer card containing the target prayer
        const targetPrayerCard = prayerCards?.find(
          card =>
            card.prayer.id === assignment.assignedPrayerId ||
            card.children.some(
              child => child.id === assignment.assignedPrayerId
            )
        );

        if (!targetPrayerCard) {
          throw new Error(
            `Prayer card not found for prayer ${assignment.assignedPrayerId}`
          );
        }

        // Create new aliya event
        const newAliya = AliyaEvent.create(
          values.aliyaGroupId,
          assignment.aliyaTypeId
        );

        // Update the prayer card
        let updatedPrayerCard = targetPrayerCard;

        if (targetPrayerCard.prayer.id === assignment.assignedPrayerId) {
          // Assign to main prayer
          const updatedPrayer = targetPrayerCard.prayer.update({
            aliyot: [...targetPrayerCard.prayer.aliyot, newAliya],
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            updatedPrayer,
            targetPrayerCard.children
          );
        } else {
          // Assign to child
          const updatedChildren = targetPrayerCard.children.map(child => {
            if (child.id === assignment.assignedPrayerId) {
              return child.update({
                aliyot: [...child.aliyot, newAliya],
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            targetPrayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
      }

      setShowAssignmentDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya assignment:", error);
      setSubmitting(false);
    }
  };

  const handleReassignAliya = async (
    values: AliyaReassignmentFormValues,
    { setSubmitting }: FormikHelpers<AliyaReassignmentFormValues>
  ) => {
    if (!editingAliya) return;

    try {
      // Find the target prayer card
      const targetPrayerCard = prayerCards?.find(
        card =>
          card.prayer.id === values.assignedPrayerId ||
          card.children.some(child => child.id === values.assignedPrayerId)
      );

      if (!targetPrayerCard) {
        throw new Error(
          `Prayer card not found for prayer ${values.assignedPrayerId}`
        );
      }

      // Remove aliya from current prayer
      let updatedCurrentPrayerCard = editingAliya.prayerCard;
      if (editingAliya.prayerCard.prayer.id === editingAliya.prayer.id) {
        // Remove from main prayer
        const updatedPrayer = editingAliya.prayer.update({
          aliyot: editingAliya.prayer.aliyot.filter(
            a => a !== editingAliya.aliya
          ),
        });
        updatedCurrentPrayerCard = new PrayerCard(
          editingAliya.prayerCard.id,
          updatedPrayer,
          editingAliya.prayerCard.children
        );
      } else {
        // Remove from child
        const updatedChildren = editingAliya.prayerCard.children.map(child => {
          if (child.id === editingAliya.prayer.id) {
            return child.update({
              aliyot: child.aliyot.filter(a => a !== editingAliya.aliya),
            });
          }
          return child;
        });
        updatedCurrentPrayerCard = new PrayerCard(
          editingAliya.prayerCard.id,
          editingAliya.prayerCard.prayer,
          updatedChildren
        );
      }

      // Add aliya to new prayer
      let updatedTargetPrayerCard = targetPrayerCard;
      if (targetPrayerCard.prayer.id === values.assignedPrayerId) {
        // Add to main prayer
        const updatedPrayer = targetPrayerCard.prayer.update({
          aliyot: [...targetPrayerCard.prayer.aliyot, editingAliya.aliya],
        });
        updatedTargetPrayerCard = new PrayerCard(
          targetPrayerCard.id,
          updatedPrayer,
          targetPrayerCard.children
        );
      } else {
        // Add to child
        const updatedChildren = targetPrayerCard.children.map(child => {
          if (child.id === values.assignedPrayerId) {
            return child.update({
              aliyot: [...child.aliyot, editingAliya.aliya],
            });
          }
          return child;
        });
        updatedTargetPrayerCard = new PrayerCard(
          targetPrayerCard.id,
          targetPrayerCard.prayer,
          updatedChildren
        );
      }

      // Update both prayer cards in database
      await updatePrayerCardMutation.mutateAsync(updatedCurrentPrayerCard);
      if (updatedCurrentPrayerCard.id !== updatedTargetPrayerCard.id) {
        await updatePrayerCardMutation.mutateAsync(updatedTargetPrayerCard);
      }

      setShowReassignDialog(false);
      setEditingAliya(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error reassigning aliya:", error);
      setSubmitting(false);
    }
  };

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
      } catch (error) {
        console.error("Error deleting aliya:", error);
      }
    }
  };

  const handleReassignClick = (aliyaData: (typeof allAliyot)[0]) => {
    setEditingAliya(aliyaData);
    setShowReassignDialog(true);
  };

  const handleEditGroup = (group: AliyaGroup) => {
    setEditingGroup(group);
    setShowEditGroupDialog(true);
  };

  const handleToggleGroupExpansion = (groupId: string) => {
    setExpandedGroupId(expandedGroupId === groupId ? null : groupId);
  };

  const handleCreateAliyaGroup = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    try {
      const newGroup = AliyaGroup.create(values.label, values.hebrewDate!);
      await createAliyaGroupMutation.mutateAsync(newGroup);
      setShowCreateGroupDialog(false);
      setSubmitting(false);
    } catch (error) {
      console.error("Error creating aliya group:", error);
      setSubmitting(false);
    }
  };

  const handleUpdateAliyaGroup = async (
    values: AliyaGroupFormValues,
    { setSubmitting }: FormikHelpers<AliyaGroupFormValues>
  ) => {
    if (!editingGroup) return;

    try {
      const updatedGroup = editingGroup.update({
        label: values.label,
        hebrewDate: values.hebrewDate!,
      });
      await updateAliyaGroupMutation.mutateAsync(updatedGroup);
      setShowEditGroupDetailsDialog(false);
      setEditingGroup(null);
      setSubmitting(false);
    } catch (error) {
      console.error("Error updating aliya group:", error);
      setSubmitting(false);
    }
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
      if (!editingGroup) return;

      // Process each assignment
      for (const assignment of values.assignments) {
        // Find the prayer card containing the target prayer
        const targetPrayerCard = prayerCards?.find(
          card =>
            card.prayer.id === assignment.assignedPrayerId ||
            card.children.some(
              child => child.id === assignment.assignedPrayerId
            )
        );

        if (!targetPrayerCard) {
          throw new Error(
            `Prayer card not found for prayer ${assignment.assignedPrayerId}`
          );
        }

        // Create new aliya event
        const newAliya = AliyaEvent.create(
          editingGroup.id,
          assignment.aliyaTypeId
        );

        // Update the prayer card
        let updatedPrayerCard = targetPrayerCard;

        if (targetPrayerCard.prayer.id === assignment.assignedPrayerId) {
          // Assign to main prayer
          const updatedPrayer = targetPrayerCard.prayer.update({
            aliyot: [...targetPrayerCard.prayer.aliyot, newAliya],
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            updatedPrayer,
            targetPrayerCard.children
          );
        } else {
          // Assign to child
          const updatedChildren = targetPrayerCard.children.map(child => {
            if (child.id === assignment.assignedPrayerId) {
              return child.update({
                aliyot: [...child.aliyot, newAliya],
              });
            }
            return child;
          });
          updatedPrayerCard = new PrayerCard(
            targetPrayerCard.id,
            targetPrayerCard.prayer,
            updatedChildren
          );
        }

        // Update in database
        await updatePrayerCardMutation.mutateAsync(updatedPrayerCard);
      }

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
                  {aliyaTypes?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  סוגי עליות
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h4" color="primary">
                  {prayerCards?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  כרטיסי תפילה
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
                            הוסף עליות
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
                                              handleReassignClick({
                                                aliya,
                                                prayer,
                                                prayerCard,
                                                isChild,
                                              })
                                            }
                                            color="primary"
                                          >
                                            <EditIcon />
                                          </IconButton>
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

      {/* Aliya Assignment Dialog */}
      <Dialog
        open={showAssignmentDialog}
        onClose={() => setShowAssignmentDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>הקצה עליות לקבוצה</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialAssignmentFormValues}
            validationSchema={aliyaAssignmentValidationSchema}
            onSubmit={handleAliyaAssignment}
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
                  <FormControl
                    fullWidth
                    error={touched.aliyaGroupId && Boolean(errors.aliyaGroupId)}
                  >
                    <InputLabel>קבוצת עליות</InputLabel>
                    <Select
                      name="aliyaGroupId"
                      value={values.aliyaGroupId}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      label="קבוצת עליות"
                    >
                      {aliyaGroups?.map(group => (
                        <MenuItem key={group.id} value={group.id}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography>{group.label}</Typography>
                            <Chip
                              label={group.hebrewDate.toString()}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <Box>
                    <Typography variant="h6" gutterBottom>
                      הקצאת עליות
                    </Typography>
                    {values.assignments.map((assignment, index) => (
                      <Card key={index} sx={{ mb: 2, p: 2 }}>
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 1fr auto",
                            },
                            gap: 2,
                            alignItems: "center",
                          }}
                        >
                          <Box>
                            <FormControl fullWidth>
                              <InputLabel>סוג עלייה</InputLabel>
                              <Select
                                value={assignment.aliyaTypeId}
                                onChange={e => {
                                  const newAssignments = [
                                    ...values.assignments,
                                  ];
                                  newAssignments[index].aliyaTypeId =
                                    e.target.value;
                                  setFieldValue("assignments", newAssignments);
                                }}
                                label="סוג עלייה"
                              >
                                {aliyaTypes
                                  ?.sort(
                                    (a, b) =>
                                      (a.displayOrder || 0) -
                                      (b.displayOrder || 0)
                                  )
                                  .map(type => (
                                    <MenuItem key={type.id} value={type.id}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        <Typography>
                                          {type.displayName}
                                        </Typography>
                                        <Chip
                                          label={`משקל: ${type.weight}`}
                                          size="small"
                                          color={
                                            type.isHighPriority
                                              ? "error"
                                              : type.isMediumPriority
                                                ? "warning"
                                                : "default"
                                          }
                                          variant="outlined"
                                        />
                                      </Box>
                                    </MenuItem>
                                  ))}
                              </Select>
                            </FormControl>
                          </Box>
                          <Box>
                            <FormControl fullWidth>
                              <InputLabel>מתפלל</InputLabel>
                              <Select
                                value={assignment.assignedPrayerId}
                                onChange={e => {
                                  const newAssignments = [
                                    ...values.assignments,
                                  ];
                                  newAssignments[index].assignedPrayerId =
                                    e.target.value;
                                  setFieldValue("assignments", newAssignments);
                                }}
                                label="מתפלל"
                              >
                                {allPrayers.map(
                                  ({ prayer, isChild, parentName }) => (
                                    <MenuItem key={prayer.id} value={prayer.id}>
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                        }}
                                      >
                                        {isChild ? (
                                          <ChildIcon />
                                        ) : (
                                          <PersonIcon />
                                        )}
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
                                    </MenuItem>
                                  )
                                )}
                              </Select>
                            </FormControl>
                          </Box>
                          <Box>
                            <IconButton
                              onClick={() => {
                                const newAssignments =
                                  values.assignments.filter(
                                    (_, i) => i !== index
                                  );
                                setFieldValue("assignments", newAssignments);
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Card>
                    ))}

                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        const newAssignments = [
                          ...values.assignments,
                          { aliyaTypeId: "", assignedPrayerId: "" },
                        ];
                        setFieldValue("assignments", newAssignments);
                      }}
                      sx={{ mt: 1 }}
                    >
                      הוסף עלייה
                    </Button>
                  </Box>
                </Stack>
                <DialogActions>
                  <Button
                    type="button"
                    onClick={() => setShowAssignmentDialog(false)}
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
                      ? "מקצה..."
                      : "הקצה עליות"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Reassign Aliya Dialog */}
      <Dialog
        open={showReassignDialog}
        onClose={() => setShowReassignDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>העבר עלייה למתפלל אחר</DialogTitle>
        <DialogContent>
          {editingAliya && (
            <Formik
              initialValues={initialReassignmentFormValues}
              validationSchema={reassignmentValidationSchema}
              onSubmit={handleReassignAliya}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
              }) => (
                <Form>
                  <Stack spacing={3} sx={{ mt: 1 }}>
                    <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        עלייה נוכחית:
                      </Typography>
                      <Typography variant="body2">
                        {editingAliya.prayer.firstName}{" "}
                        {editingAliya.prayer.lastName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        קבוצה:{" "}
                        {aliyaGroups?.find(
                          g => g.id === editingAliya.aliya.aliyaGroupId
                        )?.label || editingAliya.aliya.aliyaGroupId}
                      </Typography>
                    </Box>

                    <FormControl
                      fullWidth
                      error={
                        touched.assignedPrayerId &&
                        Boolean(errors.assignedPrayerId)
                      }
                    >
                      <InputLabel>מתפלל חדש</InputLabel>
                      <Select
                        name="assignedPrayerId"
                        value={values.assignedPrayerId}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        label="מתפלל חדש"
                      >
                        {allPrayers
                          .filter(
                            ({ prayer }) => prayer.id !== editingAliya.prayer.id
                          )
                          .map(({ prayer, isChild, parentName }) => (
                            <MenuItem key={prayer.id} value={prayer.id}>
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
                                {isChild && parentName && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    (בן/בת של {parentName})
                                  </Typography>
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowReassignDialog(false)}
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
                        ? "מעביר..."
                        : "העבר עלייה"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
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
              initialValues={initialEditGroupFormValues}
              validationSchema={editGroupValidationSchema}
              onSubmit={handleEditGroupSubmit}
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

                    <Typography variant="h6" gutterBottom>
                      עליות חדשות להוספה
                    </Typography>

                    {values.assignments.map((assignment, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 2,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: {
                              xs: "1fr",
                              sm: "1fr 1fr auto",
                            },
                            gap: 2,
                            alignItems: "end",
                          }}
                        >
                          <FormControl
                            fullWidth
                            error={
                              touched.assignments?.[index]?.aliyaTypeId &&
                              Boolean(
                                (errors.assignments as any)?.[index]
                                  ?.aliyaTypeId
                              )
                            }
                          >
                            <InputLabel>סוג עלייה</InputLabel>
                            <Select
                              name={`assignments.${index}.aliyaTypeId`}
                              value={assignment.aliyaTypeId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              label="סוג עלייה"
                            >
                              {aliyaTypes
                                ?.filter(type => {
                                  if (!editingGroup) return true;
                                  const assignedTypes =
                                    getAssignedAliyaTypesForGroup(
                                      editingGroup.id
                                    );
                                  return !assignedTypes.includes(type.id);
                                })
                                .sort(
                                  (a, b) =>
                                    (a.displayOrder || 0) -
                                    (b.displayOrder || 0)
                                )
                                .map(type => (
                                  <MenuItem key={type.id} value={type.id}>
                                    <Box
                                      sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1,
                                      }}
                                    >
                                      <Typography>
                                        {type.displayName}
                                      </Typography>
                                      <Chip
                                        label={`משקל: ${type.weight}`}
                                        size="small"
                                        color={
                                          type.isHighPriority
                                            ? "error"
                                            : type.isMediumPriority
                                              ? "warning"
                                              : "default"
                                        }
                                        variant="outlined"
                                      />
                                    </Box>
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>

                          <FormControl
                            fullWidth
                            error={
                              touched.assignments?.[index]?.assignedPrayerId &&
                              Boolean(
                                (errors.assignments as any)?.[index]
                                  ?.assignedPrayerId
                              )
                            }
                          >
                            <InputLabel>מתפלל</InputLabel>
                            <Select
                              name={`assignments.${index}.assignedPrayerId`}
                              value={assignment.assignedPrayerId}
                              onChange={handleChange}
                              onBlur={handleBlur}
                              label="מתפלל"
                            >
                              {allPrayers.map(
                                ({ prayer, isChild, parentName }) => (
                                  <MenuItem key={prayer.id} value={prayer.id}>
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
                                      {isChild && parentName && (
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          (בן/בת של {parentName})
                                        </Typography>
                                      )}
                                    </Box>
                                  </MenuItem>
                                )
                              )}
                            </Select>
                          </FormControl>

                          <Box>
                            <IconButton
                              onClick={() => {
                                const newAssignments =
                                  values.assignments.filter(
                                    (_, i) => i !== index
                                  );
                                setFieldValue("assignments", newAssignments);
                              }}
                              color="error"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      </Box>
                    ))}

                    <Button
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setFieldValue("assignments", [
                          ...values.assignments,
                          { aliyaTypeId: "", assignedPrayerId: "" },
                        ]);
                      }}
                      variant="outlined"
                    >
                      הוסף עלייה נוספת
                    </Button>
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
                        ? "מוסיף עליות..."
                        : "הוסף עליות"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Aliya Group Dialog */}
      <Dialog
        open={showCreateGroupDialog}
        onClose={() => setShowCreateGroupDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>הוסף קבוצת עליות חדשה</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={initialAliyaGroupFormValues}
            validationSchema={aliyaGroupValidationSchema}
            onSubmit={handleCreateAliyaGroup}
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
                  <TextField
                    name="label"
                    label="תווית קבוצה"
                    value={values.label}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.label && Boolean(errors.label)}
                    helperText={touched.label && errors.label}
                    fullWidth
                  />

                  <HebrewDateSelector
                    value={values.hebrewDate}
                    onChange={date => setFieldValue("hebrewDate", date)}
                    label="תאריך עברי"
                  />
                </Stack>

                <DialogActions>
                  <Button
                    type="button"
                    onClick={() => setShowCreateGroupDialog(false)}
                  >
                    ביטול
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={
                      isSubmitting || createAliyaGroupMutation.isPending
                    }
                  >
                    {isSubmitting || createAliyaGroupMutation.isPending
                      ? "יוצר..."
                      : "צור קבוצה"}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Edit Group Details Dialog */}
      <Dialog
        open={showEditGroupDetailsDialog}
        onClose={() => setShowEditGroupDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>ערוך פרטי קבוצה</DialogTitle>
        <DialogContent>
          {editingGroup && (
            <Formik<AliyaGroupFormValues>
              initialValues={{
                label: editingGroup.label,
                hebrewDate: editingGroup.hebrewDate,
              }}
              validationSchema={aliyaGroupValidationSchema}
              onSubmit={handleUpdateAliyaGroup}
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
                    <TextField
                      name="label"
                      label="תווית קבוצה"
                      value={values.label}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.label && Boolean(errors.label)}
                      helperText={touched.label && errors.label}
                      fullWidth
                    />

                    <HebrewDateSelector
                      value={values.hebrewDate}
                      onChange={date => setFieldValue("hebrewDate", date)}
                      label="תאריך עברי"
                    />
                  </Stack>

                  <DialogActions>
                    <Button
                      type="button"
                      onClick={() => setShowEditGroupDetailsDialog(false)}
                    >
                      ביטול
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={
                        isSubmitting || updateAliyaGroupMutation.isPending
                      }
                    >
                      {isSubmitting || updateAliyaGroupMutation.isPending
                        ? "מעדכן..."
                        : "עדכן קבוצה"}
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const AdminAliyaAssignmentPage: React.FC = () => {
  return <AdminAliyaAssignmentContent />;
};

export default AdminAliyaAssignmentPage;
